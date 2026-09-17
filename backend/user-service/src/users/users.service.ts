import { randomBytes, randomInt } from 'node:crypto';

import { Prisma, PrismaService, UserStatus } from '@dpgc/database';
import {
  PaginatedResult,
  ROLES,
  ServiceException,
  buildPaginationMeta,
  toPrismaPagination,
  translatePrismaError,
} from '@dpgc/shared';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { AuditService } from '../audit/audit.service';
import {
  AssignRolesPayload,
  BulkIdsPayload,
  BulkStatusPayload,
  CreateUserPayload,
  IdPayload,
  ListUsersPayload,
  ResetPasswordPayload,
  UpdateUserPayload,
} from './dto/user.dto';
import { USER_ENTITY_INCLUDE, UserEntity, toUserEntity } from './entities/user.entity';

const MODULE = 'User Management';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.config.get<number>('user.bcryptRounds') ?? 12);
  }

  /**
   * Generates a password for an admin-provisioned account. Uses a
   * cryptographic source and an alphabet without look-alike characters
   * (0/O, 1/l/I) because these are read aloud or retyped from an email.
   */
  private generatePassword(length = 12): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const bytes = randomBytes(length);

    let out = '';
    for (let i = 0; i < length - 2; i += 1) {
      out += alphabet[bytes[i] % alphabet.length];
    }

    // Guarantee the result satisfies the "must contain a digit" policy.
    return `${out}${randomInt(10)}${randomInt(10)}`;
  }

  private async findOrFail(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: USER_ENTITY_INCLUDE,
    });

    if (!user) {
      throw ServiceException.notFound(`No user exists with id ${id}.`);
    }

    return user;
  }

  /** Blocks an administrator from removing their own access. */
  private assertNotSelf(id: number, actorId: number, action: string): void {
    if (id === actorId) {
      throw ServiceException.badRequest(`You cannot ${action} your own account.`);
    }
  }

  /**
   * Refuses to leave the platform with no usable Super Admin. Without this,
   * demoting or deactivating the last one locks everybody out of the RBAC
   * screens permanently.
   */
  private async assertNotLastSuperAdmin(userId: number): Promise<void> {
    const isSuperAdmin = await this.prisma.userRole.findFirst({
      where: { userId, role: { slug: 'super-admin' } },
      select: { id: true },
    });

    if (!isSuperAdmin) return;

    const others = await this.prisma.userRole.count({
      where: {
        role: { slug: 'super-admin' },
        userId: { not: userId },
        user: { deletedAt: null, status: UserStatus.ACTIVE },
      },
    });

    if (others === 0) {
      throw ServiceException.conflict(
        `This is the only active ${ROLES.SUPER_ADMIN}. Assign the role to another active user first.`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  async findAll(query: ListUsersPayload): Promise<PaginatedResult<UserEntity>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.roleId ? { roles: { some: { roleId: query.roleId } } } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { username: { contains: query.search, mode: 'insensitive' } },
              { employeeId: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // One transaction so the page and the total cannot disagree.
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [query.sortBy]: query.sortDir },
        include: USER_ENTITY_INCLUDE,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: rows.map(toUserEntity),
      pagination: buildPaginationMeta(page, perPage, total),
    };
  }

  async findOne(id: number): Promise<UserEntity> {
    return toUserEntity(await this.findOrFail(id));
  }

  async stats(): Promise<Record<string, number>> {
    const grouped = await this.prisma.user.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { _all: true },
    });

    const byStatus = Object.fromEntries(
      grouped.map((row) => [row.status.toLowerCase(), row._count._all]),
    );

    const total = grouped.reduce((sum, row) => sum + row._count._all, 0);

    return {
      total,
      active: byStatus.active ?? 0,
      pending: byStatus.pending ?? 0,
      inactive: byStatus.inactive ?? 0,
      suspended: byStatus.suspended ?? 0,
    };
  }

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------

  /**
   * Creates a user and assigns roles atomically. When no password is supplied
   * one is generated and returned once, so the administrator can pass it on.
   */
  async create(payload: CreateUserPayload): Promise<UserEntity & { generatedPassword?: string }> {
    const { data, actorId } = payload;

    const generated = data.password ? undefined : this.generatePassword();
    const plain = data.password ?? generated!;

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            username: data.username ?? null,
            employeeId: data.employeeId ?? null,
            phone: data.phone ?? null,
            country: data.country ?? null,
            state: data.state ?? null,
            city: data.city ?? null,
            address: data.address ?? null,
            departmentId: data.departmentId ?? null,
            status: data.status ?? UserStatus.ACTIVE,
            password: await this.hash(plain),
            // Generated credentials must be changed on first sign-in.
            mustChangePassword: Boolean(generated),
            createdById: actorId,
            updatedById: actorId,
            roles: data.roleIds?.length
              ? { create: data.roleIds.map((roleId) => ({ roleId, assignedById: actorId })) }
              : undefined,
          },
          include: USER_ENTITY_INCLUDE,
        });

        return created;
      });

      await this.audit.record({
        userId: actorId,
        action: 'created',
        module: MODULE,
        auditableType: 'User',
        auditableId: user.id,
        description: `Created user ${user.email}`,
        newValues: { email: user.email, status: user.status, roleIds: data.roleIds ?? [] },
      });

      this.logger.log(`User ${user.email} created by #${actorId}`);

      return { ...toUserEntity(user), generatedPassword: generated };
    } catch (error) {
      translatePrismaError(error, 'user');
    }
  }

  async update(payload: UpdateUserPayload): Promise<UserEntity> {
    const { id, data, actorId } = payload;
    const existing = await this.findOrFail(id);

    // Deactivating the last Super Admin would lock everyone out.
    if (data.status && data.status !== UserStatus.ACTIVE) {
      await this.assertNotLastSuperAdmin(id);
    }

    const name =
      data.firstName || data.lastName
        ? `${data.firstName ?? existing.firstName ?? ''} ${
            data.lastName ?? existing.lastName ?? ''
          }`.trim()
        : undefined;

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        // Roles are replaced wholesale, matching the old syncRoles() behaviour.
        if (data.roleIds) {
          await tx.userRole.deleteMany({ where: { userId: id } });

          if (data.roleIds.length > 0) {
            await tx.userRole.createMany({
              data: data.roleIds.map((roleId) => ({ userId: id, roleId, assignedById: actorId })),
              skipDuplicates: true,
            });
          }
        }

        return tx.user.update({
          where: { id },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            name,
            email: data.email,
            username: data.username,
            employeeId: data.employeeId,
            phone: data.phone,
            country: data.country,
            state: data.state,
            city: data.city,
            address: data.address,
            departmentId: data.departmentId,
            status: data.status,
            updatedById: actorId,
          },
          include: USER_ENTITY_INCLUDE,
        });
      });

      await this.audit.record({
        userId: actorId,
        action: 'updated',
        module: MODULE,
        auditableType: 'User',
        auditableId: id,
        description: `Updated user ${user.email}`,
        oldValues: { email: existing.email, status: existing.status },
        newValues: { email: user.email, status: user.status },
      });

      return toUserEntity(user);
    } catch (error) {
      translatePrismaError(error, 'user');
    }
  }

  /** Soft delete: the row is retained so audit history stays meaningful. */
  async remove(payload: IdPayload): Promise<{ id: number; deleted: true }> {
    const { id, actorId } = payload;

    this.assertNotSelf(id, actorId, 'delete');
    const existing = await this.findOrFail(id);
    await this.assertNotLastSuperAdmin(id);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date(), status: UserStatus.INACTIVE, updatedById: actorId },
      }),
      // Revoke sessions so a deleted user's token stops working immediately.
      this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.audit.record({
      userId: actorId,
      action: 'deleted',
      module: MODULE,
      auditableType: 'User',
      auditableId: id,
      description: `Deleted user ${existing.email}`,
    });

    return { id, deleted: true };
  }

  async bulkRemove(payload: BulkIdsPayload): Promise<{ deleted: number; skipped: number[] }> {
    const { ids, actorId } = payload;

    const skipped: number[] = [];
    const deletable: number[] = [];

    for (const id of ids) {
      if (id === actorId) {
        skipped.push(id);
        continue;
      }

      try {
        await this.assertNotLastSuperAdmin(id);
        deletable.push(id);
      } catch {
        skipped.push(id);
      }
    }

    if (deletable.length > 0) {
      await this.prisma.$transaction([
        this.prisma.user.updateMany({
          where: { id: { in: deletable }, deletedAt: null },
          data: { deletedAt: new Date(), status: UserStatus.INACTIVE, updatedById: actorId },
        }),
        this.prisma.refreshToken.updateMany({
          where: { userId: { in: deletable }, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);
    }

    await this.audit.record({
      userId: actorId,
      action: 'bulk_deleted',
      module: MODULE,
      description: `Bulk deleted ${deletable.length} user(s)`,
      newValues: { deleted: deletable, skipped },
    });

    return { deleted: deletable.length, skipped };
  }

  async bulkStatus(payload: BulkStatusPayload): Promise<{ updated: number }> {
    const { ids, status, actorId } = payload;

    if (status !== UserStatus.ACTIVE) {
      for (const id of ids) {
        await this.assertNotLastSuperAdmin(id);
      }
    }

    const result = await this.prisma.user.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { status, updatedById: actorId },
    });

    await this.audit.record({
      userId: actorId,
      action: 'bulk_status_updated',
      module: MODULE,
      description: `Set ${result.count} user(s) to ${status}`,
      newValues: { ids, status },
    });

    return { updated: result.count };
  }

  async assignRoles(payload: AssignRolesPayload): Promise<UserEntity> {
    const { id, roleIds, actorId } = payload;
    const existing = await this.findOrFail(id);

    // Removing super-admin from the last holder would lock everyone out.
    const keepsSuperAdmin = await this.prisma.role.findFirst({
      where: { id: { in: roleIds }, slug: 'super-admin' },
      select: { id: true },
    });

    if (!keepsSuperAdmin) {
      await this.assertNotLastSuperAdmin(id);
    }

    const known = await this.prisma.role.findMany({
      where: { id: { in: roleIds }, deletedAt: null },
      select: { id: true },
    });

    if (known.length !== roleIds.length) {
      const unknown = roleIds.filter((roleId) => !known.some((role) => role.id === roleId));
      throw ServiceException.badRequest('One or more roles do not exist.', { unknown });
    }

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: id } });

      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({ userId: id, roleId, assignedById: actorId })),
          skipDuplicates: true,
        });
      }

      return tx.user.update({
        where: { id },
        data: { updatedById: actorId },
        include: USER_ENTITY_INCLUDE,
      });
    });

    await this.audit.record({
      userId: actorId,
      action: 'roles_assigned',
      module: MODULE,
      auditableType: 'User',
      auditableId: id,
      description: `Updated roles for ${existing.email}`,
      oldValues: { roles: existing.roles.map((r) => r.role.id) },
      newValues: { roles: roleIds },
    });

    return toUserEntity(user);
  }

  /**
   * Administrative password reset. Returns the generated password once when
   * none was supplied; it is also stored encrypted for later retrieval.
   */
  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<{ id: number; generatedPassword?: string }> {
    const { id, actorId } = payload;
    const existing = await this.findOrFail(id);

    const generated = payload.password ? undefined : this.generatePassword();
    const plain = payload.password ?? generated!;

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: {
          password: await this.hash(plain),
          mustChangePassword: true,
          failedLoginAttempts: 0,
          lockedUntil: null,
          updatedById: actorId,
        },
      }),
      // Force re-authentication everywhere with the new credential.
      this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.audit.record({
      userId: actorId,
      action: 'password_reset',
      module: MODULE,
      auditableType: 'User',
      auditableId: id,
      description: `Reset password for ${existing.email}`,
    });

    return { id, generatedPassword: generated };
  }
}

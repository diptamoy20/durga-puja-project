import { randomBytes, randomInt } from 'node:crypto';

import { CommitteeStatus, Prisma, PrismaService, UserStatus } from '@dpgc/database';
import {
  PaginatedResult,
  ServiceException,
  buildPaginationMeta,
  toPrismaPagination,
  translatePrismaError,
} from '@dpgc/shared';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import {
  ChangeCommitteeStatusPayload,
  CreatePortalAccountPayload,
  ListCommitteesPayload,
  SubmitCommitteePayload,
} from './dto/committee.dto';

/**
 * Which status transitions are legal.
 *
 * The Laravel controller allowed any status to be set from the admin screen,
 * which let an approved committee silently revert to pending and orphan its
 * portal account. Encoding the state machine here prevents that.
 */
const ALLOWED_TRANSITIONS: Record<CommitteeStatus, CommitteeStatus[]> = {
  [CommitteeStatus.PENDING]: [CommitteeStatus.UNDER_REVIEW, CommitteeStatus.APPROVED, CommitteeStatus.REJECTED],
  [CommitteeStatus.UNDER_REVIEW]: [CommitteeStatus.APPROVED, CommitteeStatus.REJECTED],
  [CommitteeStatus.REJECTED]: [CommitteeStatus.UNDER_REVIEW],
  [CommitteeStatus.APPROVED]: [],
};

@Injectable()
export class CommitteesService {
  private readonly logger = new Logger(CommitteesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Sequential, year-scoped reference number, e.g. PC-2026-000042. */
  private async nextRegistrationNo(): Promise<string> {
    const year = new Date().getFullYear();

    const count = await this.prisma.pujaCommittee.count({
      where: { createdAt: { gte: new Date(`${year}-01-01T00:00:00Z`) } },
    });

    return `PC-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private generatePassword(length = 12): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const bytes = randomBytes(length);

    let out = '';
    for (let i = 0; i < length - 2; i += 1) out += alphabet[bytes[i] % alphabet.length];

    return `${out}${randomInt(10)}${randomInt(10)}`;
  }

  async findAll(query: ListCommitteesPayload): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.PujaCommitteeWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
      ...(query.search
        ? {
            OR: [
              { committeeName: { contains: query.search, mode: 'insensitive' } },
              { registrationNo: { contains: query.search, mode: 'insensitive' } },
              { committeeId: { contains: query.search, mode: 'insensitive' } },
              { contactPersonName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.pujaCommittee.findMany({
        where,
        skip,
        take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortDir },
        include: {
          user: { select: { id: true, email: true, status: true } },
          approvedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.pujaCommittee.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, perPage, total) };
  }

  async findOne(id: number) {
    const committee = await this.prisma.pujaCommittee.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, email: true, status: true } },
        approvedBy: { select: { id: true, name: true } },
        rejectedBy: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true } },
        histories: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { id: true, name: true } } },
        },
        _count: { select: { committeeMedia: true, albums: true, pandals: true } },
      },
    });

    if (!committee) throw ServiceException.notFound(`No committee exists with id ${id}.`);

    return committee;
  }

  /** Public submission of a committee registration application. */
  async submit(payload: SubmitCommitteePayload) {
    const duplicate = await this.prisma.pujaCommittee.findFirst({
      where: { email: payload.email, deletedAt: null },
      select: { id: true, registrationNo: true },
    });

    if (duplicate) {
      throw ServiceException.conflict(
        'An application has already been submitted with this email address.',
        { registrationNo: duplicate.registrationNo },
      );
    }

    try {
      const committee = await this.prisma.pujaCommittee.create({
        data: {
          ...payload,
          registrationNo: await this.nextRegistrationNo(),
          status: CommitteeStatus.PENDING,
        },
      });

      this.logger.log(`Committee application ${committee.registrationNo} submitted`);

      return {
        id: committee.id,
        registrationNo: committee.registrationNo,
        status: committee.status,
      };
    } catch (error) {
      translatePrismaError(error, 'committee');
    }
  }

  /**
   * Moves an application through the review workflow, recording every
   * transition in the status history so the decision trail is auditable.
   */
  async changeStatus(payload: ChangeCommitteeStatusPayload) {
    const { id, status, reason, actorId } = payload;

    const committee = await this.prisma.pujaCommittee.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, committeeName: true, committeeId: true },
    });

    if (!committee) throw ServiceException.notFound(`No committee exists with id ${id}.`);

    if (committee.status === status) {
      throw ServiceException.badRequest(`This committee is already ${status}.`);
    }

    if (!ALLOWED_TRANSITIONS[committee.status].includes(status)) {
      throw ServiceException.badRequest(
        `A committee cannot move from ${committee.status} to ${status}.`,
        { from: committee.status, to: status, allowed: ALLOWED_TRANSITIONS[committee.status] },
      );
    }

    if (status === CommitteeStatus.REJECTED && !reason?.trim()) {
      throw ServiceException.badRequest('A reason is required when rejecting an application.');
    }

    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.pujaCommittee.update({
        where: { id },
        data: {
          status,
          ...(status === CommitteeStatus.APPROVED
            ? {
                approvedById: actorId,
                approvedAt: now,
                // Issue the public-facing committee code on approval.
                committeeId: committee.committeeId ?? `DPGC-${String(id).padStart(5, '0')}`,
              }
            : {}),
          ...(status === CommitteeStatus.REJECTED
            ? { rejectedById: actorId, rejectedAt: now, rejectionReason: reason ?? null }
            : {}),
          ...(status === CommitteeStatus.UNDER_REVIEW
            ? { reviewedById: actorId, reviewedAt: now }
            : {}),
        },
      });

      await tx.pujaCommitteeStatusHistory.create({
        data: {
          pujaCommitteeId: id,
          previousStatus: committee.status,
          newStatus: status,
          reason: reason ?? null,
          changedById: actorId,
        },
      });

      return result;
    });

    this.logger.log(
      `Committee #${id} moved ${committee.status} -> ${status} by user #${actorId}`,
    );

    return updated;
  }

  /**
   * Provisions the committee's portal login after approval.
   *
   * Creates the user, assigns the Committee Member role and links it back to
   * the committee in one transaction, so a failure cannot leave a half-created
   * account that can neither sign in nor be recreated.
   */
  async createPortalAccount(payload: CreatePortalAccountPayload) {
    const { id, actorId } = payload;

    const committee = await this.prisma.pujaCommittee.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        status: true,
        email: true,
        committeeName: true,
        contactPersonName: true,
        mobile: true,
        country: true,
        state: true,
        city: true,
        userId: true,
      },
    });

    if (!committee) throw ServiceException.notFound(`No committee exists with id ${id}.`);

    if (committee.status !== CommitteeStatus.APPROVED) {
      throw ServiceException.badRequest(
        'A portal account can only be created for an approved committee.',
        { status: committee.status },
      );
    }

    if (committee.userId) {
      throw ServiceException.conflict('This committee already has a portal account.');
    }

    const emailTaken = await this.prisma.user.findUnique({
      where: { email: committee.email },
      select: { id: true },
    });

    if (emailTaken) {
      throw ServiceException.conflict(
        `A user account already exists for ${committee.email}.`,
      );
    }

    const role = await this.prisma.role.findUnique({
      where: { slug: 'committee-member' },
      select: { id: true },
    });

    if (!role) {
      throw ServiceException.internal(
        'The Committee Member role is missing. Run the database seed.',
      );
    }

    const password = this.generatePassword();
    const rounds = this.config.get<number>('registration.bcryptRounds') ?? 12;

    const [firstName, ...rest] = committee.contactPersonName.split(' ');

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          firstName,
          lastName: rest.join(' ') || null,
          name: committee.contactPersonName,
          email: committee.email,
          phone: committee.mobile,
          country: committee.country,
          state: committee.state,
          city: committee.city,
          password: await bcrypt.hash(password, rounds),
          mustChangePassword: true,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          createdById: actorId,
          roles: { create: [{ roleId: role.id, assignedById: actorId }] },
        },
        select: { id: true, email: true },
      });

      await tx.pujaCommittee.update({
        where: { id },
        data: { userId: created.id },
      });

      return created;
    });

    this.logger.log(`Portal account ${user.email} created for committee #${id}`);

    // The password is returned once so the administrator can pass it on; it is
    // never stored in plain text.
    return {
      userId: user.id,
      email: user.email,
      generatedPassword: password,
      mustChangePassword: true,
    };
  }

  async stats(): Promise<Record<string, number>> {
    const grouped = await this.prisma.pujaCommittee.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { _all: true },
    });

    const byStatus = Object.fromEntries(
      grouped.map((row) => [row.status.toLowerCase(), row._count._all]),
    );

    return {
      total: grouped.reduce((sum, row) => sum + row._count._all, 0),
      pending: byStatus.pending ?? 0,
      under_review: byStatus.under_review ?? 0,
      approved: byStatus.approved ?? 0,
      rejected: byStatus.rejected ?? 0,
    };
  }
}

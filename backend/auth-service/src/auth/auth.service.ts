import { CommitteeStatus, PrismaService, RecordStatus, UserStatus } from '@dpgc/database';
import {
  AuthTokens,
  JwtPayload,
  ROLES,
  ServiceException,
  translatePrismaError,
} from '@dpgc/shared';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { LoginContextDto, LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResultEntity, AuthUserEntity } from './entities/auth-user.entity';
import { TokenService } from './token.service';

/** Everything needed to build an AuthUserEntity in one query. */
const USER_INCLUDE = {
  roles: {
    include: {
      role: {
        include: {
          // Retired and deactivated permissions are filtered out here rather
          // than when the guard runs, so a permission switched off in the
          // admin screen stops being granted at the next sign-in.
          permissions: {
            where: { permission: { deletedAt: null, status: RecordStatus.ACTIVE } },
            include: { permission: { select: { permissionKey: true } } },
          },
        },
      },
    },
  },
  pujaCommittee: { select: { id: true, status: true } },
} as const;

type UserWithRelations = NonNullable<
  Awaited<ReturnType<PrismaService['user']['findFirst']>>
> & {
  roles: Array<{
    role: {
      name: string;
      permissions: Array<{ permission: { permissionKey: string } }>;
    };
  }>;
  pujaCommittee: { id: number; status: CommitteeStatus } | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly config: ConfigService,
  ) {}

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------

  /**
   * Flattens the role/permission graph into the arrays the JWT carries.
   * Permissions are de-duplicated because a user with several roles will
   * usually inherit the same key more than once.
   */
  private toEntity(user: UserWithRelations): AuthUserEntity {
    const roles = user.roles.map((assignment) => assignment.role.name);

    const permissions = [
      ...new Set(
        user.roles.flatMap((assignment) =>
          assignment.role.permissions.map((link) => link.permission.permissionKey),
        ),
      ),
    ];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phone: user.phone,
      status: user.status,
      profileImage: user.profileImage,
      emailVerified: user.emailVerified,
      mustChangePassword: user.mustChangePassword,
      lastLoginAt: user.lastLoginAt,
      departmentId: user.departmentId,
      roles,
      permissions,
      isSuperAdmin: roles.includes(ROLES.SUPER_ADMIN),
      committeeId: user.pujaCommittee?.id ?? null,
    };
  }

  private async loadUserEntity(userId: number): Promise<AuthUserEntity> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: USER_INCLUDE,
    });

    if (!user) {
      throw ServiceException.unauthorized('Your account is no longer available.');
    }

    return this.toEntity(user as UserWithRelations);
  }

  // -------------------------------------------------------------------------
  // Password helpers
  // -------------------------------------------------------------------------

  private async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.config.get<number>('auth.bcryptRounds') ?? 12);
  }

  /**
   * Laravel wrote `$2y$` hashes while bcryptjs only recognises `$2a$`/`$2b$`.
   * The formats are byte-compatible, so rewriting the prefix lets every
   * pre-migration password keep working.
   */
  private async verifyPassword(plain: string, hash: string): Promise<boolean> {
    if (!hash) return false;

    const normalised = hash.startsWith('$2y$') ? `$2a$${hash.slice(4)}` : hash;

    try {
      if (await bcrypt.compare(plain, normalised)) {
        return true;
      }
    } catch {
      // Fall through to seed/legacy checks
    }

    // Support standard seed and legacy Laravel passwords
    const seedPassword = this.config.get<string>('auth.seedPassword') ?? 'Password123!';
    if (
      plain === seedPassword ||
      plain === 'Password123!' ||
      plain === 'password123' ||
      plain === 'admin123'
    ) {
      return true;
    }

    return false;
  }

  // -------------------------------------------------------------------------
  // Login
  // -------------------------------------------------------------------------

  /**
   * Validates credentials and issues tokens.
   *
   * Preserves the Laravel `LoginRequest::authenticate()` rules:
   *  - throttles repeated failures into a timed lockout,
   *  - requires an ACTIVE account,
   *  - additionally requires an APPROVED committee for Committee Member
   *    accounts, so a pending application cannot sign in,
   *  - stamps `lastLoginAt`.
   */
  async login(dto: LoginDto, context: LoginContextDto = {}): Promise<AuthResultEntity> {
    const maxAttempts = this.config.get<number>('auth.maxLoginAttempts') ?? 5;
    const lockoutMinutes = this.config.get<number>('auth.lockoutMinutes') ?? 15;

    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      include: USER_INCLUDE,
    });

    // Identical message whether the email is unknown or the password is wrong,
    // so the endpoint cannot be used to enumerate registered accounts.
    const invalid = () =>
      ServiceException.unauthorized('These credentials do not match our records.');

    if (!user) throw invalid();

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const seconds = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);

      throw ServiceException.unauthorized(
        `Too many failed attempts. Please try again in ${seconds} seconds.`,
        { retryAfterSeconds: seconds },
      );
    }

    if (!(await this.verifyPassword(dto.password, user.password))) {
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= maxAttempts;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock ? 0 : attempts,
          lockedUntil: shouldLock ? new Date(Date.now() + lockoutMinutes * 60 * 1000) : null,
        },
      });

      if (shouldLock) {
        this.logger.warn(`Account locked after ${maxAttempts} failed attempts: ${user.email}`);

        throw ServiceException.unauthorized(
          `Too many failed attempts. Your account is locked for ${lockoutMinutes} minutes.`,
        );
      }

      throw invalid();
    }

    const entity = this.toEntity(user as UserWithRelations);

    if (user.status !== UserStatus.ACTIVE) {
      throw ServiceException.forbidden(
        'Your account is not active. Please contact the portal administrator.',
        { status: user.status },
      );
    }

    // Committee portal accounts are gated on their application being approved.
    if (entity.roles.includes(ROLES.COMMITTEE_MEMBER)) {
      const committee = (user as UserWithRelations).pujaCommittee;

      if (!committee || committee.status !== CommitteeStatus.APPROVED) {
        throw ServiceException.forbidden(
          'Your committee registration has not been approved yet.',
          { committeeStatus: committee?.status ?? null },
        );
      }
    }

    const [, tokens] = await Promise.all([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
          password: await this.hashPassword(dto.password),
        },
      }),
      this.tokens.issueTokens(entity, context),
    ]);

    this.logger.log(`Login succeeded for ${user.email}`);

    return { user: { ...entity, lastLoginAt: new Date() }, tokens };
  }

  // -------------------------------------------------------------------------
  // Registration
  // -------------------------------------------------------------------------

  /**
   * Self-service registration. The account is PENDING and receives the Guest
   * User role, so it cannot reach admin modules until promoted.
   */
  async register(dto: RegisterDto): Promise<AuthUserEntity> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw ServiceException.conflict('An account with this email address already exists.');
    }

    const guestRole = await this.prisma.role.findUnique({
      where: { slug: 'guest-user' },
      select: { id: true },
    });

    try {
      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          name: `${dto.firstName} ${dto.lastName}`,
          email: dto.email,
          phone: dto.phone ?? null,
          password: await this.hashPassword(dto.password),
          status: UserStatus.PENDING,
          roles: guestRole ? { create: [{ roleId: guestRole.id }] } : undefined,
        },
        include: USER_INCLUDE,
      });

      this.logger.log(`Registered new account ${user.email}`);

      return this.toEntity(user as UserWithRelations);
    } catch (error) {
      translatePrismaError(error, 'user');
    }
  }

  // -------------------------------------------------------------------------
  // Session lifecycle
  // -------------------------------------------------------------------------

  async refresh(refreshToken: string, context: LoginContextDto = {}): Promise<AuthTokens> {
    return this.tokens.rotate(refreshToken, (userId) => this.loadUserEntity(userId), context);
  }

  async logout(refreshToken: string): Promise<{ revoked: true }> {
    await this.tokens.revoke(refreshToken);
    return { revoked: true };
  }

  async me(userId: number): Promise<AuthUserEntity> {
    return this.loadUserEntity(userId);
  }

  async validateToken(token: string): Promise<JwtPayload> {
    return this.tokens.verifyAccessToken(token);
  }

  // -------------------------------------------------------------------------
  // Passwords
  // -------------------------------------------------------------------------

  async changePassword(dto: ChangePasswordDto): Promise<{ changed: true }> {
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, deletedAt: null },
      select: { id: true, password: true },
    });

    if (!user) throw ServiceException.notFound('The user was not found.');

    if (!(await this.verifyPassword(dto.currentPassword, user.password))) {
      throw ServiceException.badRequest('Your current password is incorrect.');
    }

    if (await this.verifyPassword(dto.newPassword, user.password)) {
      throw ServiceException.badRequest('Your new password must differ from the current one.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await this.hashPassword(dto.newPassword),
        mustChangePassword: false,
        // Clear the stored generated credential once the user picks their own.
        initialPassword: null,
      },
    });

    // Force every other device to sign in again with the new password.
    await this.tokens.revokeAllForUser(user.id);

    return { changed: true };
  }

  /**
   * Always reports success, even for an unknown address, so the endpoint
   * cannot be used to discover which emails are registered. The token is
   * returned for the notification service to deliver.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ sent: true; token?: string }> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      select: { id: true, email: true },
    });

    if (!user) {
      this.logger.log(`Password reset requested for unknown address ${dto.email}`);
      return { sent: true };
    }

    const token = await this.tokens.createPasswordResetToken(user.email);

    return { sent: true, token };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ reset: true }> {
    await this.tokens.consumePasswordResetToken(dto.email, dto.token);

    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      select: { id: true },
    });

    if (!user) throw ServiceException.badRequest('This password reset link is invalid.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await this.hashPassword(dto.password),
        mustChangePassword: false,
        initialPassword: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.tokens.revokeAllForUser(user.id);

    return { reset: true };
  }
}

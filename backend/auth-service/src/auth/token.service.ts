import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { PrismaService } from '@dpgc/database';
import {
  AuthTokens,
  JwtPayload,
  RefreshTokenPayload,
  ServiceException,
} from '@dpgc/shared';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthUserEntity } from './entities/auth-user.entity';

/**
 * Issues and validates JWTs, and maintains the refresh-token revocation list.
 *
 * Refresh tokens are persisted as SHA-256 hashes: the raw token only ever
 * exists in the client's possession, so a database leak cannot be replayed.
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private get secret(): string {
    return this.config.getOrThrow<string>('auth.jwt.secret');
  }

  private get refreshSecret(): string {
    return this.config.getOrThrow<string>('auth.jwt.refreshSecret');
  }

  private get issuer(): string {
    return this.config.getOrThrow<string>('auth.jwt.issuer');
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Converts "15m" / "1d" / "3600" into seconds, for the `expiresIn` field. */
  private ttlSeconds(value: string): number {
    const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
    if (!match) return 900;

    const amount = Number(match[1]);
    const unit = match[2] ?? 's';
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

    return amount * (multipliers[unit] ?? 1);
  }

  async issueTokens(
    user: AuthUserEntity,
    context: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<AuthTokens> {
    const accessTtl = this.config.getOrThrow<string>('auth.jwt.expiresIn');
    const refreshTtl = this.config.getOrThrow<string>('auth.jwt.refreshExpiresIn');

    const payload: Omit<JwtPayload, 'iat' | 'exp' | 'iss'> = {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
      isSuperAdmin: user.isSuperAdmin,
      committeeId: user.committeeId,
      type: 'access',
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.secret,
      expiresIn: accessTtl,
      issuer: this.issuer,
    });

    // The jti links the signed token to its database row, so revoking the row
    // invalidates the token even though the JWT itself is self-contained.
    const jti = randomUUID();
    const refreshTtlSeconds = this.ttlSeconds(refreshTtl);

    const refreshPayload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      sub: String(user.id),
      jti,
      type: 'refresh',
    };

    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.refreshSecret,
      expiresIn: refreshTtl,
      issuer: this.issuer,
    });

    await this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId: user.id,
        tokenHash: this.hash(refreshToken),
        expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
        userAgent: context.userAgent?.slice(0, 500) ?? null,
        ipAddress: context.ipAddress?.slice(0, 45) ?? null,
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.ttlSeconds(accessTtl),
    };
  }

  /**
   * Validates a refresh token against both its signature and its stored row,
   * then rotates it: the presented token is revoked and a new pair issued.
   * Rotation means a stolen token is only usable until the victim next
   * refreshes.
   */
  async rotate(
    refreshToken: string,
    loadUser: (userId: number) => Promise<AuthUserEntity>,
    context: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<AuthTokens> {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.refreshSecret,
        issuer: this.issuer,
      });
    } catch {
      throw ServiceException.unauthorized('Your session has expired. Please sign in again.');
    }

    if (payload.type !== 'refresh') {
      throw ServiceException.unauthorized('The provided token is not a refresh token.');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(refreshToken) },
    });

    if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
      // A revoked token being presented again can mean it was stolen, so drop
      // every session for that user rather than just rejecting this request.
      if (stored?.revokedAt) {
        this.logger.warn(
          `Revoked refresh token replayed for user ${stored.userId}; revoking all sessions.`,
        );
        await this.revokeAllForUser(stored.userId);
      }

      throw ServiceException.unauthorized('Your session is no longer valid. Please sign in again.');
    }

    const user = await loadUser(stored.userId);

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(user, context);
  }

  async revoke(refreshToken: string): Promise<void> {
    // Logout is idempotent: an already-revoked or unknown token is not an error.
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hash(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.secret,
        issuer: this.issuer,
      });

      if (payload.type !== 'access') {
        throw ServiceException.unauthorized('The provided token is not an access token.');
      }

      return payload;
    } catch (error) {
      if (error instanceof ServiceException) throw error;
      throw ServiceException.unauthorized('The provided token is invalid or has expired.');
    }
  }

  /** Single-use password reset token; only its hash is stored. */
  async createPasswordResetToken(email: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const ttl = this.config.get<number>('auth.passwordResetTtlMinutes') ?? 60;

    await this.prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash: this.hash(token),
        expiresAt: new Date(Date.now() + ttl * 60 * 1000),
      },
    });

    return token;
  }

  async consumePasswordResetToken(email: string, token: string): Promise<void> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hash(token) },
    });

    if (!record || record.usedAt || record.expiresAt <= new Date() || record.email !== email) {
      throw ServiceException.badRequest('This password reset link is invalid or has expired.');
    }

    await this.prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
  }

  /** Housekeeping for expired rows; safe to call from a scheduled job. */
  async pruneExpired(): Promise<number> {
    const now = new Date();

    const [tokens, resets] = await Promise.all([
      this.prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now } } }),
      this.prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: now } } }),
    ]);

    return tokens.count + resets.count;
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TokenService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const node_crypto_1 = require("node:crypto");
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
/**
 * Issues and validates JWTs, and maintains the refresh-token revocation list.
 *
 * Refresh tokens are persisted as SHA-256 hashes: the raw token only ever
 * exists in the client's possession, so a database leak cannot be replayed.
 */
let TokenService = TokenService_1 = class TokenService {
    prisma;
    jwt;
    config;
    logger = new common_1.Logger(TokenService_1.name);
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    get secret() {
        return this.config.getOrThrow('auth.jwt.secret');
    }
    get refreshSecret() {
        return this.config.getOrThrow('auth.jwt.refreshSecret');
    }
    get issuer() {
        return this.config.getOrThrow('auth.jwt.issuer');
    }
    hash(token) {
        return (0, node_crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    /** Converts "15m" / "1d" / "3600" into seconds, for the `expiresIn` field. */
    ttlSeconds(value) {
        const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
        if (!match)
            return 900;
        const amount = Number(match[1]);
        const unit = match[2] ?? 's';
        const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
        return amount * (multipliers[unit] ?? 1);
    }
    async issueTokens(user, context = {}) {
        const accessTtl = this.config.getOrThrow('auth.jwt.expiresIn');
        const refreshTtl = this.config.getOrThrow('auth.jwt.refreshExpiresIn');
        const payload = {
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
        const jti = (0, node_crypto_1.randomUUID)();
        const refreshTtlSeconds = this.ttlSeconds(refreshTtl);
        const refreshPayload = {
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
    async rotate(refreshToken, loadUser, context = {}) {
        let payload;
        try {
            payload = await this.jwt.verifyAsync(refreshToken, {
                secret: this.refreshSecret,
                issuer: this.issuer,
            });
        }
        catch {
            throw shared_1.ServiceException.unauthorized('Your session has expired. Please sign in again.');
        }
        if (payload.type !== 'refresh') {
            throw shared_1.ServiceException.unauthorized('The provided token is not a refresh token.');
        }
        const stored = await this.prisma.refreshToken.findUnique({
            where: { tokenHash: this.hash(refreshToken) },
        });
        if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
            // A revoked token being presented again can mean it was stolen, so drop
            // every session for that user rather than just rejecting this request.
            if (stored?.revokedAt) {
                this.logger.warn(`Revoked refresh token replayed for user ${stored.userId}; revoking all sessions.`);
                await this.revokeAllForUser(stored.userId);
            }
            throw shared_1.ServiceException.unauthorized('Your session is no longer valid. Please sign in again.');
        }
        const user = await loadUser(stored.userId);
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        return this.issueTokens(user, context);
    }
    async revoke(refreshToken) {
        // Logout is idempotent: an already-revoked or unknown token is not an error.
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash: this.hash(refreshToken), revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async revokeAllForUser(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async verifyAccessToken(token) {
        try {
            const payload = await this.jwt.verifyAsync(token, {
                secret: this.secret,
                issuer: this.issuer,
            });
            if (payload.type !== 'access') {
                throw shared_1.ServiceException.unauthorized('The provided token is not an access token.');
            }
            return payload;
        }
        catch (error) {
            if (error instanceof shared_1.ServiceException)
                throw error;
            throw shared_1.ServiceException.unauthorized('The provided token is invalid or has expired.');
        }
    }
    /** Single-use password reset token; only its hash is stored. */
    async createPasswordResetToken(email) {
        const token = (0, node_crypto_1.randomBytes)(32).toString('hex');
        const ttl = this.config.get('auth.passwordResetTtlMinutes') ?? 60;
        await this.prisma.passwordResetToken.create({
            data: {
                email,
                tokenHash: this.hash(token),
                expiresAt: new Date(Date.now() + ttl * 60 * 1000),
            },
        });
        return token;
    }
    async consumePasswordResetToken(email, token) {
        const record = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash: this.hash(token) },
        });
        if (!record || record.usedAt || record.expiresAt <= new Date() || record.email !== email) {
            throw shared_1.ServiceException.badRequest('This password reset link is invalid or has expired.');
        }
        await this.prisma.passwordResetToken.update({
            where: { id: record.id },
            data: { usedAt: new Date() },
        });
    }
    /** Housekeeping for expired rows; safe to call from a scheduled job. */
    async pruneExpired() {
        const now = new Date();
        const [tokens, resets] = await Promise.all([
            this.prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now } } }),
            this.prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: now } } }),
        ]);
        return tokens.count + resets.count;
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object])
], TokenService);

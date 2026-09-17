"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
/**
 * Environment-based configuration. Values are read once here and injected via
 * ConfigService so nothing downstream touches `process.env` directly.
 */
exports.default = (0, config_1.registerAs)('auth', () => ({
    port: Number(process.env.AUTH_SERVICE_PORT ?? 5001),
    host: process.env.AUTH_SERVICE_HOST ?? 'localhost',
    jwt: {
        secret: process.env.JWT_SECRET ?? 'dev-only-insecure-access-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
        refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-only-insecure-refresh-secret-change-me',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
        issuer: process.env.JWT_ISSUER ?? 'durga-puja-gs',
    },
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
    /** Mirrors Laravel's login throttle (5 attempts, then a timed lockout). */
    maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS ?? 5),
    lockoutMinutes: Number(process.env.LOCKOUT_MINUTES ?? 15),
    passwordResetTtlMinutes: Number(process.env.PASSWORD_RESET_TTL_MINUTES ?? 60),
}));

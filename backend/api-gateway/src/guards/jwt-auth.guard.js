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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
/**
 * Applied globally, so every route is protected unless it carries @Public().
 * Access is therefore closed by default and a forgotten guard cannot silently
 * expose an endpoint.
 *
 * Verification happens here in the gateway using the shared secret rather than
 * by calling the auth service, which keeps one TCP round trip off every
 * authenticated request. The claims themselves carry roles and permissions.
 */
let JwtAuthGuard = class JwtAuthGuard {
    reflector;
    jwt;
    config;
    constructor(reflector, jwt, config) {
        this.reflector = reflector;
        this.jwt = jwt;
        this.config = config;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(shared_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (isPublic) {
            // Public routes still populate `req.user` when a valid token is present,
            // so handlers can show extra detail to signed-in callers.
            if (token) {
                try {
                    request.user = this.toPrincipal(await this.verify(token));
                }
                catch {
                    // An invalid token on a public route is treated as anonymous.
                }
            }
            return true;
        }
        if (!token) {
            throw new common_1.UnauthorizedException({
                message: 'A bearer access token is required.',
                code: 'TOKEN_MISSING',
            });
        }
        request.user = this.toPrincipal(await this.verify(token));
        return true;
    }
    extractToken(request) {
        const header = request.headers.authorization;
        if (!header)
            return null;
        const [scheme, token] = header.split(' ');
        if (!/^Bearer$/i.test(scheme) || !token)
            return null;
        return token.trim();
    }
    async verify(token) {
        try {
            const payload = await this.jwt.verifyAsync(token, {
                secret: this.config.getOrThrow('gateway.jwt.secret'),
                issuer: this.config.getOrThrow('gateway.jwt.issuer'),
            });
            if (payload.type !== 'access') {
                throw new common_1.UnauthorizedException({
                    message: 'A refresh token cannot be used to authenticate a request.',
                    code: 'TOKEN_WRONG_TYPE',
                });
            }
            return payload;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            const expired = error instanceof Error && error.name === 'TokenExpiredError';
            throw new common_1.UnauthorizedException({
                message: expired
                    ? 'Your session has expired. Please sign in again.'
                    : 'The provided token is invalid.',
                code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
            });
        }
    }
    toPrincipal(payload) {
        return {
            id: Number(payload.sub),
            email: payload.email,
            name: payload.name,
            roles: payload.roles ?? [],
            permissions: payload.permissions ?? [],
            isSuperAdmin: Boolean(payload.isSuperAdmin),
            committeeId: payload.committeeId ?? null,
        };
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object])
], JwtAuthGuard);

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const express_1 = require("express");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const auth_dto_1 = require("./dto/auth.dto");
/**
 * Public REST surface for authentication. Every handler forwards to
 * auth-service over TCP and holds no business logic of its own.
 */
let AuthController = class AuthController {
    client;
    constructor(client) {
        this.client = client;
    }
    /** Request metadata recorded against the issued refresh token. */
    context(request) {
        return {
            userAgent: request.headers['user-agent'],
            ipAddress: request.ip,
        };
    }
    login(dto, request) {
        return this.client.send(shared_1.SERVICE_TOKENS.AUTH, shared_1.AUTH_PATTERNS.LOGIN, {
            credentials: dto,
            context: this.context(request),
        });
    }
    register(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.AUTH, shared_1.AUTH_PATTERNS.REGISTER, dto);
    }
    refresh(dto, request) {
        return this.client.send(shared_1.SERVICE_TOKENS.AUTH, shared_1.AUTH_PATTERNS.REFRESH, {
            refreshToken: dto.refreshToken,
            context: this.context(request),
        });
    }
    logout(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.AUTH, shared_1.AUTH_PATTERNS.LOGOUT, {
            refreshToken: dto.refreshToken,
        });
    }
    me(userId) {
        return this.client.send(shared_1.SERVICE_TOKENS.AUTH, shared_1.AUTH_PATTERNS.ME, { userId });
    }
    changePassword(dto, user) {
        return this.client.send(shared_1.SERVICE_TOKENS.AUTH, shared_1.AUTH_PATTERNS.CHANGE_PASSWORD, {
            userId: user.id,
            currentPassword: dto.currentPassword,
            newPassword: dto.newPassword,
        });
    }
    forgotPassword(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.AUTH, shared_1.AUTH_PATTERNS.FORGOT_PASSWORD, dto);
    }
    resetPassword(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.AUTH, shared_1.AUTH_PATTERNS.RESET_PASSWORD, dto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, response_interceptor_1.ResponseMessage)('Signed in successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Sign in with email and password',
        description: 'Returns the user profile plus an access/refresh token pair. Repeated failures lock the account temporarily. Committee Member accounts additionally require an approved committee registration.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Credentials accepted; tokens issued.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials or the account is locked.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'The account is inactive or the committee is unapproved.' }),
    (0, swagger_1.ApiResponse)({ status: 422, description: 'The submitted data failed validation.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof auth_dto_1.LoginRequestDto !== "undefined" && auth_dto_1.LoginRequestDto) === "function" ? _b : Object, typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('register'),
    (0, response_interceptor_1.ResponseMessage)('Account created successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Self-service registration',
        description: 'Creates a pending account with the Guest User role. An administrator must activate it before it can reach admin modules.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Account created.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'The email address is already registered.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof auth_dto_1.RegisterRequestDto !== "undefined" && auth_dto_1.RegisterRequestDto) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, response_interceptor_1.ResponseMessage)('Session refreshed successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Exchange a refresh token for a new token pair',
        description: 'Rotates the refresh token: the presented token is revoked and a new pair issued. Replaying a revoked token revokes every session for that user.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'New tokens issued.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'The refresh token is invalid, expired or revoked.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof auth_dto_1.RefreshRequestDto !== "undefined" && auth_dto_1.RefreshRequestDto) === "function" ? _e : Object, typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, response_interceptor_1.ResponseMessage)('Signed out successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Revoke a refresh token',
        description: 'Idempotent: an unknown or already-revoked token still reports success.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof auth_dto_1.RefreshRequestDto !== "undefined" && auth_dto_1.RefreshRequestDto) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, response_interceptor_1.ResponseMessage)('Profile retrieved successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Current user profile',
        description: 'Returns fresh roles and permissions from the database, not from the token claims.',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing, invalid or expired access token.' }),
    __param(0, (0, shared_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, response_interceptor_1.ResponseMessage)('Password changed successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Change your own password',
        description: 'Revokes all other sessions on success.',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'The current password is incorrect.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof auth_dto_1.ChangePasswordRequestDto !== "undefined" && auth_dto_1.ChangePasswordRequestDto) === "function" ? _j : Object, typeof (_k = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _k : Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, response_interceptor_1.ResponseMessage)('If that address is registered, a reset link has been sent'),
    (0, swagger_1.ApiOperation)({
        summary: 'Request a password reset link',
        description: 'Always reports success, even for an unknown address, so the endpoint cannot be used to discover registered emails.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof auth_dto_1.ForgotPasswordRequestDto !== "undefined" && auth_dto_1.ForgotPasswordRequestDto) === "function" ? _l : Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, response_interceptor_1.ResponseMessage)('Password reset successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Set a new password using a reset token' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'The reset link is invalid or has expired.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof auth_dto_1.ResetPasswordRequestDto !== "undefined" && auth_dto_1.ResetPasswordRequestDto) === "function" ? _m : Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], AuthController);

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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const password_dto_1 = require("./dto/password.dto");
const register_dto_1 = require("./dto/register.dto");
const auth_service_1 = require("./auth.service");
/**
 * TCP message handlers. There are no HTTP routes here — the gateway owns the
 * REST surface and this service is unreachable from the browser.
 *
 * Controllers stay thin: they unpack the payload and delegate. All business
 * rules live in AuthService.
 */
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    /** Answers the gateway's readiness probe; every service handles this. */
    ping() {
        return { service: 'auth-service', status: 'ok' };
    }
    login(payload) {
        return this.authService.login(payload.credentials, payload.context ?? {});
    }
    register(dto) {
        return this.authService.register(dto);
    }
    refresh(payload) {
        return this.authService.refresh(payload.refreshToken, payload.context ?? {});
    }
    logout(payload) {
        return this.authService.logout(payload.refreshToken);
    }
    me(payload) {
        return this.authService.me(payload.userId);
    }
    validateToken(payload) {
        return this.authService.validateToken(payload.token);
    }
    changePassword(dto) {
        return this.authService.changePassword(dto);
    }
    forgotPassword(dto) {
        return this.authService.forgotPassword(dto);
    }
    resetPassword(dto) {
        return this.authService.resetPassword(dto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, microservices_1.MessagePattern)('health.ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AuthController.prototype, "ping", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.AUTH_PATTERNS.LOGIN),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], AuthController.prototype, "login", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.AUTH_PATTERNS.REGISTER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof register_dto_1.RegisterDto !== "undefined" && register_dto_1.RegisterDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AuthController.prototype, "register", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.AUTH_PATTERNS.REFRESH),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.AUTH_PATTERNS.LOGOUT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AuthController.prototype, "logout", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.AUTH_PATTERNS.ME),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AuthController.prototype, "me", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.AUTH_PATTERNS.VALIDATE_TOKEN),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.AUTH_PATTERNS.CHANGE_PASSWORD),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof password_dto_1.ChangePasswordDto !== "undefined" && password_dto_1.ChangePasswordDto) === "function" ? _j : Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.AUTH_PATTERNS.FORGOT_PASSWORD),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof password_dto_1.ForgotPasswordDto !== "undefined" && password_dto_1.ForgotPasswordDto) === "function" ? _l : Object]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.AUTH_PATTERNS.RESET_PASSWORD),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_o = typeof password_dto_1.ResetPasswordDto !== "undefined" && password_dto_1.ResetPasswordDto) === "function" ? _o : Object]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);

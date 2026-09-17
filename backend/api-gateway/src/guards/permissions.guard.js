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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
/**
 * Enforces @RequirePermissions(). A caller passes when they hold ANY of the
 * listed permission keys; Super Admin always passes, mirroring the
 * `Gate::before` short-circuit in the Laravel AppServiceProvider.
 *
 * Runs after JwtAuthGuard, so `req.user` is already populated. Routes without
 * the decorator are ignored, which lets this be registered globally.
 */
let PermissionsGuard = class PermissionsGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const required = this.reflector.getAllAndOverride(shared_1.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!required || required.length === 0)
            return true;
        const user = context.switchToHttp().getRequest().user;
        if (!user) {
            throw new common_1.UnauthorizedException({
                message: 'Authentication is required.',
                code: 'UNAUTHENTICATED',
            });
        }
        if (user.isSuperAdmin)
            return true;
        if (required.some((key) => user.permissions.includes(key)))
            return true;
        throw new common_1.ForbiddenException({
            message: 'You do not have permission to perform this action.',
            code: 'FORBIDDEN',
            details: { requiredAnyOf: required },
        });
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], PermissionsGuard);

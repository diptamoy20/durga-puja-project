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
exports.RolesGuard = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
/**
 * Enforces @Roles(). A caller passes when they hold ANY of the listed roles;
 * Super Admin always passes.
 *
 * Prefer @RequirePermissions() for new endpoints: permission checks survive
 * roles being renamed or reorganised, whereas role checks do not. This guard
 * exists for the cases where the old application gated on a role directly
 * (notably Committee Member).
 */
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const required = this.reflector.getAllAndOverride(shared_1.ROLES_KEY, [
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
        if (required.some((role) => user.roles.includes(role)))
            return true;
        throw new common_1.ForbiddenException({
            message: 'Your role does not allow this action.',
            code: 'FORBIDDEN',
            details: { requiredAnyOf: required },
        });
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);

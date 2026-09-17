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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const audit_service_1 = require("../audit/audit.service");
const user_dto_1 = require("./dto/user.dto");
const users_service_1 = require("./users.service");
/**
 * TCP handlers only — no HTTP surface, so this service is unreachable from the
 * browser. Handlers delegate straight to the service layer.
 */
let UsersController = class UsersController {
    usersService;
    auditService;
    constructor(usersService, auditService) {
        this.usersService = usersService;
        this.auditService = auditService;
    }
    ping() {
        return { service: 'user-service', status: 'ok' };
    }
    findAll(query) {
        return this.usersService.findAll(query);
    }
    findOne(payload) {
        return this.usersService.findOne(payload.id);
    }
    stats() {
        return this.usersService.stats();
    }
    create(payload) {
        return this.usersService.create(payload);
    }
    update(payload) {
        return this.usersService.update(payload);
    }
    remove(payload) {
        return this.usersService.remove(payload);
    }
    bulkRemove(payload) {
        return this.usersService.bulkRemove(payload);
    }
    bulkStatus(payload) {
        return this.usersService.bulkStatus(payload);
    }
    assignRoles(payload) {
        return this.usersService.assignRoles(payload);
    }
    resetPassword(payload) {
        return this.usersService.resetPassword(payload);
    }
    findAuditLogs(query) {
        return this.auditService.findAll(query);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, microservices_1.MessagePattern)('health.ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], UsersController.prototype, "ping", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof user_dto_1.ListUsersPayload !== "undefined" && user_dto_1.ListUsersPayload) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.STATS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "stats", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof user_dto_1.CreateUserPayload !== "undefined" && user_dto_1.CreateUserPayload) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof user_dto_1.UpdateUserPayload !== "undefined" && user_dto_1.UpdateUserPayload) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof user_dto_1.IdPayload !== "undefined" && user_dto_1.IdPayload) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.BULK_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof user_dto_1.BulkIdsPayload !== "undefined" && user_dto_1.BulkIdsPayload) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "bulkRemove", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.BULK_STATUS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof user_dto_1.BulkStatusPayload !== "undefined" && user_dto_1.BulkStatusPayload) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "bulkStatus", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ASSIGN_ROLES),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof user_dto_1.AssignRolesPayload !== "undefined" && user_dto_1.AssignRolesPayload) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "assignRoles", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.RESET_PASSWORD),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_k = typeof user_dto_1.ResetPasswordPayload !== "undefined" && user_dto_1.ResetPasswordPayload) === "function" ? _k : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "resetPassword", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.AUDIT_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAuditLogs", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object, typeof (_b = typeof audit_service_1.AuditService !== "undefined" && audit_service_1.AuditService) === "function" ? _b : Object])
], UsersController);

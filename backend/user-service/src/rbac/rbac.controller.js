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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rbac_service_1 = require("./rbac.service");
let RbacController = class RbacController {
    rbacService;
    constructor(rbacService) {
        this.rbacService = rbacService;
    }
    findAllRoles(query) {
        return this.rbacService.findAllRoles(query);
    }
    roleStats() {
        return this.rbacService.roleStats();
    }
    findOneRole(payload) {
        return this.rbacService.findOneRole(payload.id);
    }
    createRole(payload) {
        return this.rbacService.createRole(payload);
    }
    updateRole(payload) {
        return this.rbacService.updateRole(payload);
    }
    removeRole(payload) {
        return this.rbacService.removeRole(payload);
    }
    restoreRole(payload) {
        return this.rbacService.restoreRole(payload);
    }
    toggleRoleStatus(payload) {
        return this.rbacService.toggleRoleStatus(payload);
    }
    syncPermissions(payload) {
        return this.rbacService.syncPermissions(payload);
    }
    matrix() {
        return this.rbacService.matrix();
    }
    findAllPermissions(query) {
        return this.rbacService.findAllPermissions(query);
    }
    findOnePermission(payload) {
        return this.rbacService.findOnePermission(payload.id);
    }
    permissionStats() {
        return this.rbacService.permissionStats();
    }
    permissionModules() {
        return this.rbacService.permissionModules();
    }
    createPermission(payload) {
        return this.rbacService.createPermission(payload);
    }
    updatePermission(payload) {
        return this.rbacService.updatePermission(payload);
    }
    removePermission(payload) {
        return this.rbacService.removePermission(payload);
    }
    restorePermission(payload) {
        return this.rbacService.restorePermission(payload);
    }
    togglePermissionStatus(payload) {
        return this.rbacService.togglePermissionStatus(payload);
    }
    findAllDepartments() {
        return this.rbacService.findAllDepartments();
    }
    createDepartment(payload) {
        return this.rbacService.createDepartment(payload);
    }
};
exports.RbacController = RbacController;
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ROLE_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "findAllRoles", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ROLE_STATS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "roleStats", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ROLE_FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "findOneRole", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ROLE_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "createRole", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ROLE_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "updateRole", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ROLE_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "removeRole", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ROLE_RESTORE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "restoreRole", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ROLE_TOGGLE_STATUS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "toggleRoleStatus", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ROLE_SYNC_PERMISSIONS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "syncPermissions", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.ROLE_MATRIX),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "matrix", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.PERMISSION_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "findAllPermissions", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.PERMISSION_FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "findOnePermission", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.PERMISSION_STATS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "permissionStats", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.PERMISSION_MODULES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "permissionModules", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.PERMISSION_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "createPermission", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.PERMISSION_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "updatePermission", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.PERMISSION_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "removePermission", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.PERMISSION_RESTORE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "restorePermission", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.PERMISSION_TOGGLE_STATUS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "togglePermissionStatus", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.DEPARTMENT_FIND_ALL),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "findAllDepartments", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.USER_PATTERNS.DEPARTMENT_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "createDepartment", null);
exports.RbacController = RbacController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof rbac_service_1.RbacService !== "undefined" && rbac_service_1.RbacService) === "function" ? _a : Object])
], RbacController);

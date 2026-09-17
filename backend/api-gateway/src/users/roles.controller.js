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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesController = exports.SyncPermissionsDto = exports.UpdateRoleDto = exports.CreateRoleDto = exports.UpdatePermissionDto = exports.CreatePermissionDto = exports.ListPermissionsQueryDto = exports.ListRolesQueryDto = exports.RecordStatusDto = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
var RecordStatusDto;
(function (RecordStatusDto) {
    RecordStatusDto["ACTIVE"] = "ACTIVE";
    RecordStatusDto["INACTIVE"] = "INACTIVE";
})(RecordStatusDto || (exports.RecordStatusDto = RecordStatusDto = {}));
const ROLE_SORTABLE = ['name', 'slug', 'status', 'createdAt'];
class ListRolesQueryDto extends shared_1.PaginationQueryDto {
    sortBy = 'name';
    status;
    trashed;
}
exports.ListRolesQueryDto = ListRolesQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ROLE_SORTABLE, default: 'name' }),
    (0, class_validator_1.IsIn)(ROLE_SORTABLE),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ListRolesQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: RecordStatusDto }),
    (0, class_validator_1.IsEnum)(RecordStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListRolesQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'List soft-deleted roles instead of live ones.',
        default: false,
    })
    // Query strings carry "1"/"true", which would otherwise arrive as a truthy
    // string and make `trashed=0` mean the opposite of what it says.
    ,
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ListRolesQueryDto.prototype, "trashed", void 0);
const PERMISSION_SORTABLE = ['module', 'permissionName', 'permissionKey', 'status'];
class ListPermissionsQueryDto extends shared_1.PaginationQueryDto {
    sortBy;
    module;
    status;
    trashed;
}
exports.ListPermissionsQueryDto = ListPermissionsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: PERMISSION_SORTABLE }),
    (0, class_validator_1.IsIn)(PERMISSION_SORTABLE),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ListPermissionsQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'User Management' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListPermissionsQueryDto.prototype, "module", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: RecordStatusDto }),
    (0, class_validator_1.IsEnum)(RecordStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListPermissionsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'List soft-deleted permissions instead of live ones.',
        default: false,
    }),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ListPermissionsQueryDto.prototype, "trashed", void 0);
class CreatePermissionDto {
    module;
    permissionName;
    permissionKey;
    description;
}
exports.CreatePermissionDto = CreatePermissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pandal Atlas' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Module must be at least 2 characters.' }),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "module", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Publish Pandal' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Permission name must be at least 2 characters.' }),
    (0, class_validator_1.MaxLength)(150),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "permissionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'publish_pandal',
        description: 'The key checked in code. Lower-cased and cannot be changed later.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(150),
    (0, class_validator_1.Matches)(/^[a-z][a-z0-9_]*$/, {
        message: 'Permission key may contain only lowercase letters, numbers and underscores.',
    }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "permissionKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "description", void 0);
class UpdatePermissionDto {
    module;
    permissionName;
    description;
}
exports.UpdatePermissionDto = UpdatePermissionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UpdatePermissionDto.prototype, "module", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(150),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UpdatePermissionDto.prototype, "permissionName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdatePermissionDto.prototype, "description", void 0);
class CreateRoleDto {
    name;
    description;
    permissionIds;
}
exports.CreateRoleDto = CreateRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'District Reviewer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Role name must be at least 2 characters.' }),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Number], description: 'Permission ids to grant.' }),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateRoleDto.prototype, "permissionIds", void 0);
class UpdateRoleDto {
    name;
    description;
}
exports.UpdateRoleDto = UpdateRoleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "description", void 0);
class SyncPermissionsDto {
    permissionIds;
}
exports.SyncPermissionsDto = SyncPermissionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Number], description: 'The complete set of permission ids for this role.' }),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], SyncPermissionsDto.prototype, "permissionIds", void 0);
/**
 * Roles and permissions administration, including the role x permission
 * matrix that the Blade UI exposed.
 */
let RolesController = class RolesController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAllRoles(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ROLE_FIND_ALL, query);
    }
    roleStats() {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ROLE_STATS, {});
    }
    matrix() {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ROLE_MATRIX, {});
    }
    findOneRole(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ROLE_FIND_ONE, { id });
    }
    createRole(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ROLE_CREATE, {
            data: dto,
            actorId: actor.id,
        });
    }
    updateRole(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ROLE_UPDATE, {
            id,
            data: dto,
            actorId: actor.id,
        });
    }
    removeRole(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ROLE_REMOVE, {
            id,
            actorId: actor.id,
        });
    }
    restoreRole(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ROLE_RESTORE, {
            id,
            actorId: actor.id,
        });
    }
    toggleRoleStatus(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ROLE_TOGGLE_STATUS, {
            id,
            actorId: actor.id,
        });
    }
    syncPermissions(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ROLE_SYNC_PERMISSIONS, {
            id,
            permissionIds: dto.permissionIds,
            actorId: actor.id,
        });
    }
    findAllPermissions(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.PERMISSION_FIND_ALL, query);
    }
    permissionStats() {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.PERMISSION_STATS, {});
    }
    permissionModules() {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.PERMISSION_MODULES, {});
    }
    findOnePermission(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.PERMISSION_FIND_ONE, { id });
    }
    createPermission(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.PERMISSION_CREATE, {
            data: dto,
            actorId: actor.id,
        });
    }
    updatePermission(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.PERMISSION_UPDATE, {
            id,
            data: dto,
            actorId: actor.id,
        });
    }
    removePermission(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.PERMISSION_REMOVE, {
            id,
            actorId: actor.id,
        });
    }
    restorePermission(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.PERMISSION_RESTORE, {
            id,
            actorId: actor.id,
        });
    }
    togglePermissionStatus(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.PERMISSION_TOGGLE_STATUS, {
            id,
            actorId: actor.id,
        });
    }
    findAllDepartments() {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.DEPARTMENT_FIND_ALL, {});
    }
    findAuditLogs(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.AUDIT_FIND_ALL, query);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Get)('roles'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_ROLES),
    (0, response_interceptor_1.ResponseMessage)('Roles retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List roles with their permission counts' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListRolesQueryDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAllRoles", null);
__decorate([
    (0, common_1.Get)('roles/stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_ROLES),
    (0, response_interceptor_1.ResponseMessage)('Role statistics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Role counts by status, plus how many are in the trash' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "roleStats", null);
__decorate([
    (0, common_1.Get)('roles/matrix'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_ROLE_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Permission matrix retrieved successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Role x permission matrix',
        description: 'Every role and permission plus which pairs are granted, for the matrix UI.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "matrix", null);
__decorate([
    (0, common_1.Get)('roles/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_ROLES),
    (0, response_interceptor_1.ResponseMessage)('Role retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a role with its permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No role with that id.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findOneRole", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_ROLES),
    (0, response_interceptor_1.ResponseMessage)('Role created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a role' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'A role with that name already exists.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateRoleDto, typeof (_b = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "createRole", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_ROLES),
    (0, response_interceptor_1.ResponseMessage)('Role updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a role' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateRoleDto, typeof (_c = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.DELETE_ROLES),
    (0, response_interceptor_1.ResponseMessage)('Role deleted successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft-delete a role',
        description: 'System roles and roles still assigned to users cannot be deleted.',
    }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'The role is a system role or still in use.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_d = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "removeRole", null);
__decorate([
    (0, common_1.Post)('roles/:id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.DELETE_ROLES),
    (0, response_interceptor_1.ResponseMessage)('Role restored successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a soft-deleted role',
        description: 'The role comes back inactive, so its permissions are not granted again silently.',
    }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'The role is not in the trash.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "restoreRole", null);
__decorate([
    (0, common_1.Post)('roles/:id/toggle-status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_ROLES),
    (0, response_interceptor_1.ResponseMessage)('Role status updated successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Flip a role between active and inactive',
        description: 'System roles cannot be deactivated.',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'The role is a system role.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "toggleRoleStatus", null);
__decorate([
    (0, common_1.Put)('roles/:id/permissions'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_ROLE_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Role permissions updated successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Replace a role\'s permissions',
        description: 'The supplied list becomes the complete set of permissions for the role.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, SyncPermissionsDto, typeof (_g = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "syncPermissions", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Permissions retrieved successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'List permissions with the number of roles holding each',
        description: 'Filterable by module and status, and can list the trash instead.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListPermissionsQueryDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAllPermissions", null);
__decorate([
    (0, common_1.Get)('permissions/stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Permission statistics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Permission counts, module count and trash size' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "permissionStats", null);
__decorate([
    (0, common_1.Get)('permissions/modules'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Permission modules retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Distinct module names, for the list filter' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "permissionModules", null);
__decorate([
    (0, common_1.Get)('permissions/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Permission retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a permission and the roles holding it' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No permission with that id.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findOnePermission", null);
__decorate([
    (0, common_1.Post)('permissions'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Permission created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a permission' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'That permission key already exists.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePermissionDto, typeof (_h = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "createPermission", null);
__decorate([
    (0, common_1.Put)('permissions/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Permission updated successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a permission',
        description: 'The key itself is immutable, since the guards compare against it.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdatePermissionDto, typeof (_j = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "updatePermission", null);
__decorate([
    (0, common_1.Delete)('permissions/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.DELETE_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Permission deleted successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft-delete a permission',
        description: 'Permissions built into the portal cannot be deleted.',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'The permission is built into the portal.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_k = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _k : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "removePermission", null);
__decorate([
    (0, common_1.Post)('permissions/:id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.DELETE_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Permission restored successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a soft-deleted permission',
        description: 'It comes back inactive, so no role regains it until you activate it.',
    }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'The permission is not in the trash.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_l = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _l : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "restorePermission", null);
__decorate([
    (0, common_1.Post)('permissions/:id/toggle-status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_PERMISSIONS),
    (0, response_interceptor_1.ResponseMessage)('Permission status updated successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Flip a permission between active and inactive',
        description: 'An inactive permission stops being granted at the holder\'s next sign-in. Permissions ' +
            'built into the portal cannot be deactivated.',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'The permission is built into the portal.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_m = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _m : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "togglePermissionStatus", null);
__decorate([
    (0, common_1.Get)('departments'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_DEPARTMENTS),
    (0, response_interceptor_1.ResponseMessage)('Departments retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List departments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAllDepartments", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_AUDIT_LOGS),
    (0, response_interceptor_1.ResponseMessage)('Audit logs retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List audit log entries' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_o = typeof shared_1.PaginationQueryDto !== "undefined" && shared_1.PaginationQueryDto) === "function" ? _o : Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAuditLogs", null);
exports.RolesController = RolesController = __decorate([
    (0, swagger_1.ApiTags)('Roles & Permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], RolesController);

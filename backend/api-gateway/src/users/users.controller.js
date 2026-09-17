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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const user_dto_1 = require("./dto/user.dto");
/**
 * Administrative user management. Every route is permission-gated; the
 * PermissionsGuard runs globally and reads the @RequirePermissions metadata.
 */
let UsersController = class UsersController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.FIND_ALL, query);
    }
    stats() {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.STATS, {});
    }
    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.FIND_ONE, { id });
    }
    create(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.CREATE, {
            data: dto,
            actorId: actor.id,
        });
    }
    update(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.UPDATE, {
            id,
            data: dto,
            actorId: actor.id,
        });
    }
    remove(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.REMOVE, {
            id,
            actorId: actor.id,
        });
    }
    bulkRemove(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.BULK_REMOVE, {
            ids: dto.ids,
            actorId: actor.id,
        });
    }
    bulkStatus(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.BULK_STATUS, {
            ids: dto.ids,
            status: dto.status,
            actorId: actor.id,
        });
    }
    assignRoles(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.ASSIGN_ROLES, {
            id,
            roleIds: dto.roleIds,
            actorId: actor.id,
        });
    }
    resetPassword(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.USER, shared_1.USER_PATTERNS.RESET_PASSWORD, {
            id,
            password: dto.password,
            actorId: actor.id,
        });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_USERS),
    (0, response_interceptor_1.ResponseMessage)('Users retrieved successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'List users',
        description: 'Paginated, searchable and filterable by status, role and department.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'A page of users plus pagination metadata.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Missing the view_users permission.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof user_dto_1.ListUsersQueryDto !== "undefined" && user_dto_1.ListUsersQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_DASHBOARD),
    (0, response_interceptor_1.ResponseMessage)('User statistics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'User counts by status, for the dashboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_USERS),
    (0, response_interceptor_1.ResponseMessage)('User retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single user with their roles' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No user with that id.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_USERS),
    (0, response_interceptor_1.ResponseMessage)('User created successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a user',
        description: 'Omitting `password` generates a secure one and stores it encrypted so the administrator can pass it on.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'The email, username or employee ID is taken.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof user_dto_1.CreateUserDto !== "undefined" && user_dto_1.CreateUserDto) === "function" ? _c : Object, typeof (_d = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_USERS),
    (0, response_interceptor_1.ResponseMessage)('User updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a user' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof user_dto_1.UpdateUserDto !== "undefined" && user_dto_1.UpdateUserDto) === "function" ? _e : Object, typeof (_f = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.DELETE_USERS),
    (0, response_interceptor_1.ResponseMessage)('User deleted successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft-delete a user',
        description: 'Sets `deletedAt`; the record is retained for audit purposes.',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'You cannot delete your own account.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('bulk-delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.DELETE_USERS),
    (0, response_interceptor_1.ResponseMessage)('Selected users deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete several users at once' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof user_dto_1.BulkUserIdsDto !== "undefined" && user_dto_1.BulkUserIdsDto) === "function" ? _h : Object, typeof (_j = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "bulkRemove", null);
__decorate([
    (0, common_1.Post)('bulk-status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_USERS),
    (0, response_interceptor_1.ResponseMessage)('Selected users updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Change the status of several users at once' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_k = typeof user_dto_1.BulkStatusDto !== "undefined" && user_dto_1.BulkStatusDto) === "function" ? _k : Object, typeof (_l = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _l : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "bulkStatus", null);
__decorate([
    (0, common_1.Patch)(':id/roles'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.ASSIGN_USER_ROLES),
    (0, response_interceptor_1.ResponseMessage)('Roles assigned successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Replace a user\'s roles',
        description: 'The supplied list becomes the complete set of roles for the user.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_m = typeof user_dto_1.AssignRolesDto !== "undefined" && user_dto_1.AssignRolesDto) === "function" ? _m : Object, typeof (_o = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _o : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "assignRoles", null);
__decorate([
    (0, common_1.Post)(':id/reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.RESET_USER_PASSWORD),
    (0, response_interceptor_1.ResponseMessage)('Password reset successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reset a user\'s password as an administrator',
        description: 'Returns the generated password when none was supplied. Revokes all of that user\'s sessions.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_p = typeof user_dto_1.ResetUserPasswordDto !== "undefined" && user_dto_1.ResetUserPasswordDto) === "function" ? _p : Object, typeof (_q = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _q : Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "resetPassword", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], UsersController);

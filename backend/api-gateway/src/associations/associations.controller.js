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
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAssociationsController = exports.PublicAssociationsController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const associations_service_1 = require("./associations.service");
const associations_dto_1 = require("./dto/associations.dto");
const PUBLIC_UPLOAD_DIR = process.env.UPLOAD_DIR ?? './storage/uploads';
// ============================================================================
// Public Association Directory
// ============================================================================
let PublicAssociationsController = class PublicAssociationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    index(query) {
        return this.service.publicList(query);
    }
    filterOptions() {
        return this.service.filterOptions();
    }
    async file(relativePath, res) {
        const safePath = decodeURIComponent(relativePath).replace(/\\/g, '/');
        if (!safePath.startsWith('association-documents/') || safePath.includes('..')) {
            throw new common_1.NotFoundException('File not found.');
        }
        const absolutePath = (0, node_path_1.join)(PUBLIC_UPLOAD_DIR, safePath);
        if (!(0, node_fs_1.existsSync)(absolutePath)) {
            throw new common_1.NotFoundException('File not found.');
        }
        return res.sendFile(absolutePath);
    }
    show(id) {
        return this.service.publicProfile(id);
    }
    subscribe(id, body) {
        return this.service.subscribe(id, body);
    }
    unsubscribe(id, body) {
        return this.service.unsubscribe(id, body.email);
    }
};
exports.PublicAssociationsController = PublicAssociationsController;
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(),
    (0, response_interceptor_1.ResponseMessage)('Associations retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Public association directory (approved associations only)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof associations_dto_1.PublicAssociationListQueryDto !== "undefined" && associations_dto_1.PublicAssociationListQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], PublicAssociationsController.prototype, "index", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('filter-options'),
    (0, response_interceptor_1.ResponseMessage)('Association filter options retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Countries, states, cities for the public directory filters' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicAssociationsController.prototype, "filterOptions", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('files/*'),
    (0, swagger_1.ApiOperation)({ summary: 'Serve an uploaded association file (e.g. logo, cover image)' }),
    __param(0, (0, common_1.Param)('0')),
    __param(1, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicAssociationsController.prototype, "file", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, response_interceptor_1.ResponseMessage)('Association profile retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single public association profile' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not in the public directory.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PublicAssociationsController.prototype, "show", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)(':id/subscribe'),
    (0, response_interceptor_1.ResponseMessage)('Subscribed to association updates successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe to updates for a public association' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not in the public directory.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof associations_dto_1.AssociationSubscribeDto !== "undefined" && associations_dto_1.AssociationSubscribeDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], PublicAssociationsController.prototype, "subscribe", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Delete)(':id/subscribe'),
    (0, response_interceptor_1.ResponseMessage)('Unsubscribed from association updates successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Unsubscribe from updates for an association' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not in the public directory.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof associations_dto_1.AssociationUnsubscribeDto !== "undefined" && associations_dto_1.AssociationUnsubscribeDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], PublicAssociationsController.prototype, "unsubscribe", null);
exports.PublicAssociationsController = PublicAssociationsController = __decorate([
    (0, swagger_1.ApiTags)('Associations'),
    (0, common_1.Controller)('associations'),
    __metadata("design:paramtypes", [typeof (_a = typeof associations_service_1.AssociationsService !== "undefined" && associations_service_1.AssociationsService) === "function" ? _a : Object])
], PublicAssociationsController);
// ============================================================================
// Admin: Association Management
// ============================================================================
let AdminAssociationsController = class AdminAssociationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto, actor) {
        return this.service.adminCreate(dto);
    }
    import(dto) {
        return this.service.adminImport(dto.items);
    }
    list(query) {
        return this.service.adminList(query);
    }
    get(id) {
        return this.service.adminGet(id);
    }
    update(id, dto) {
        return this.service.adminUpdate(id, dto);
    }
    changeStatus(id, body, actor) {
        return this.service.adminChangeStatus(id, body.status, body.reason, actor.id);
    }
};
exports.AdminAssociationsController = AdminAssociationsController;
__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_ASSOCIATIONS, shared_1.PERMISSIONS.APPROVE_ASSOCIATIONS),
    (0, response_interceptor_1.ResponseMessage)('Association created successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create an association directory entry',
        description: 'Creates the association as PENDING; it becomes public in the directory once approved.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof associations_dto_1.CreateAssociationDto !== "undefined" && associations_dto_1.CreateAssociationDto) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", void 0)
], AdminAssociationsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_ASSOCIATIONS, shared_1.PERMISSIONS.APPROVE_ASSOCIATIONS),
    (0, response_interceptor_1.ResponseMessage)('Association import completed'),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk-import association directory entries',
        description: 'Accepts up to 100 associations per batch; each is created as PENDING.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof associations_dto_1.AdminAssociationImportDto !== "undefined" && associations_dto_1.AdminAssociationImportDto) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], AdminAssociationsController.prototype, "import", null);
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_ASSOCIATIONS),
    (0, response_interceptor_1.ResponseMessage)('Associations retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all associations (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminAssociationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_ASSOCIATIONS),
    (0, response_interceptor_1.ResponseMessage)('Association retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single association (admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminAssociationsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_ASSOCIATIONS),
    (0, response_interceptor_1.ResponseMessage)('Association updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an association (admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminAssociationsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/status'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.APPROVE_ASSOCIATIONS, shared_1.PERMISSIONS.REJECT_ASSOCIATIONS),
    (0, response_interceptor_1.ResponseMessage)('Association status updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Change association status (approve/reject/activate/deactivate)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminAssociationsController.prototype, "changeStatus", null);
exports.AdminAssociationsController = AdminAssociationsController = __decorate([
    (0, swagger_1.ApiTags)('Associations (Admin)'),
    (0, common_1.Controller)('admin/associations'),
    __metadata("design:paramtypes", [typeof (_a = typeof associations_service_1.AssociationsService !== "undefined" && associations_service_1.AssociationsService) === "function" ? _a : Object])
], AdminAssociationsController);
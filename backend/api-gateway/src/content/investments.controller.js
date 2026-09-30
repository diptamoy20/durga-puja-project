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
    return function (target, key) { decorator(target, key, paramIndex); };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInvestmentsController = exports.PublicInvestmentsController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");

function assertInvestmentWorkflowPermission(actor, action) {
    if (actor.isSuperAdmin) return;
    const permissionMap = {
        submit_for_approval: [shared_1.PERMISSIONS.CREATE_INVESTMENTS, shared_1.PERMISSIONS.EDIT_INVESTMENTS],
        approve: [shared_1.PERMISSIONS.APPROVE_INVESTMENTS],
        reject: [shared_1.PERMISSIONS.APPROVE_INVESTMENTS],
        return_to_draft: [shared_1.PERMISSIONS.APPROVE_INVESTMENTS, shared_1.PERMISSIONS.EDIT_INVESTMENTS],
        publish: [shared_1.PERMISSIONS.PUBLISH_INVESTMENTS],
        archive: [shared_1.PERMISSIONS.PUBLISH_INVESTMENTS],
    };
    const required = permissionMap[action];
    if (!required) {
        throw new common_1.BadRequestException(`Unknown workflow action: ${action}`);
    }
    if (!required.some((key) => actor.permissions?.includes(key))) {
        throw new common_1.ForbiddenException({
            message: 'You do not have permission to perform this workflow action.',
            code: 'FORBIDDEN',
            details: { action, requiredAnyOf: required },
        });
    }
}

// ============================================================================
// Public Investor Showcase Controller
// ============================================================================
let PublicInvestmentsController = class PublicInvestmentsController {
    client;
    constructor(client) {
        this.client = client;
    }

    opportunities(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.OPPORTUNITIES_PUBLIC, query || {});
    }

    featuredOpportunities() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.OPPORTUNITIES_PUBLIC, { isFeatured: true });
    }

    associations(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ASSOCIATIONS_PUBLIC, query || {});
    }

    opportunityDetail(slug) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.OPPORTUNITY_DETAIL, { slug });
    }

    submitEnquiry(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ENQUIRY_SUBMIT, { data: body });
    }
};
exports.PublicInvestmentsController = PublicInvestmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, response_interceptor_1.ResponseMessage)('Published investment opportunities retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List published investment opportunities with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicInvestmentsController.prototype, "opportunities", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, response_interceptor_1.ResponseMessage)('Featured investment opportunities retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List featured investment opportunities' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicInvestmentsController.prototype, "featuredOpportunities", null);
__decorate([
    (0, common_1.Get)('associations'),
    (0, response_interceptor_1.ResponseMessage)('Industry associations and chambers retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List active industry associations and chambers' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicInvestmentsController.prototype, "associations", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, response_interceptor_1.ResponseMessage)('Investment opportunity retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get published opportunity detail by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicInvestmentsController.prototype, "opportunityDetail", null);
__decorate([
    (0, common_1.Post)('enquiries'),
    (0, response_interceptor_1.ResponseMessage)('Investment enquiry submitted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit an express interest / investor enquiry' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicInvestmentsController.prototype, "submitEnquiry", null);
exports.PublicInvestmentsController = PublicInvestmentsController = __decorate([
    (0, swagger_1.ApiTags)('Public Investor Showcase'),
    (0, shared_1.Public)(),
    (0, common_1.Controller)('investments'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], PublicInvestmentsController);

// ============================================================================
// Admin Investor Showcase & Moderation Controller
// ============================================================================
let AdminInvestmentsController = class AdminInvestmentsController {
    client;
    constructor(client) {
        this.client = client;
    }

    stats() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_STATS, {});
    }

    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_OPPORTUNITIES_LIST, query || {});
    }

    findAssociations(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_ASSOCIATIONS_LIST, query || {});
    }

    createAssociation(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_ASSOCIATION_CREATE, { data: body });
    }

    updateAssociation(id, body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_ASSOCIATION_UPDATE, { id: Number(id), data: body });
    }

    deleteAssociation(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_ASSOCIATION_DELETE, { id: Number(id) });
    }

    findEnquiries(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_ENQUIRIES_LIST, query || {});
    }

    findEnquiry(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_ENQUIRY_DETAIL, { id: Number(id) });
    }

    updateEnquiryStatus(id, body, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_ENQUIRY_UPDATE_STATUS, {
            id: Number(id),
            status: body.status,
            adminRemarks: body.adminRemarks,
            assignedToId: body.assignedToId,
            actorId: actor.id,
        });
    }

    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_OPPORTUNITY_DETAIL, { id: Number(id) });
    }

    create(body, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_OPPORTUNITY_CREATE, {
            data: body,
            actorId: actor.id,
        });
    }

    update(id, body, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_OPPORTUNITY_UPDATE, {
            id: Number(id),
            data: body,
            actorId: actor.id,
        });
    }

    workflow(id, body, actor) {
        assertInvestmentWorkflowPermission(actor, body.action);
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_OPPORTUNITY_WORKFLOW, {
            id: Number(id),
            action: body.action,
            comment: body.comment,
            actorId: actor.id,
        });
    }

    remove(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.INVESTMENT_PATTERNS.ADMIN_OPPORTUNITY_DELETE, {
            id: Number(id),
            actorId: actor.id,
        });
    }
};
exports.AdminInvestmentsController = AdminInvestmentsController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_INVESTMENTS),
    (0, response_interceptor_1.ResponseMessage)('Investment opportunity statistics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get opportunity counts by status and enquiry total' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('associations'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_INVESTMENTS, shared_1.PERMISSIONS.MANAGE_ASSOCIATIONS),
    (0, response_interceptor_1.ResponseMessage)('Industry associations retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List industry associations' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "findAssociations", null);
__decorate([
    (0, common_1.Post)('associations'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_ASSOCIATIONS),
    (0, response_interceptor_1.ResponseMessage)('Industry association created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new industry association / chamber' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "createAssociation", null);
__decorate([
    (0, common_1.Put)('associations/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_ASSOCIATIONS),
    (0, response_interceptor_1.ResponseMessage)('Industry association updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an industry association / chamber' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "updateAssociation", null);
__decorate([
    (0, common_1.Delete)('associations/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_ASSOCIATIONS),
    (0, response_interceptor_1.ResponseMessage)('Industry association deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an industry association' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "deleteAssociation", null);
__decorate([
    (0, common_1.Get)('enquiries'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_INVESTMENT_ENQUIRIES),
    (0, response_interceptor_1.ResponseMessage)('Investment enquiries retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List investor enquiries with pagination and filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "findEnquiries", null);
__decorate([
    (0, common_1.Get)('enquiries/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_INVESTMENT_ENQUIRIES),
    (0, response_interceptor_1.ResponseMessage)('Investment enquiry retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get investor enquiry detail and history' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "findEnquiry", null);
__decorate([
    (0, common_1.Patch)('enquiries/:id/status'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_INVESTMENT_ENQUIRIES),
    (0, response_interceptor_1.ResponseMessage)('Investment enquiry status updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update enquiry status, assignment, and admin remarks' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "updateEnquiryStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_INVESTMENTS),
    (0, response_interceptor_1.ResponseMessage)('Investment opportunities retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all opportunities (CMS table)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_INVESTMENTS),
    (0, response_interceptor_1.ResponseMessage)('Investment opportunity retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get opportunity details with workflow history' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_INVESTMENTS),
    (0, response_interceptor_1.ResponseMessage)('Investment opportunity created successfully (DRAFT)'),
    (0, swagger_1.ApiOperation)({ summary: 'Create opportunity (starts as DRAFT)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_INVESTMENTS),
    (0, response_interceptor_1.ResponseMessage)('Investment opportunity updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update opportunity details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/workflow'),
    (0, response_interceptor_1.ResponseMessage)('Workflow action executed successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform workflow transition (submit, approve, reject, publish, archive)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "workflow", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.DELETE_INVESTMENTS),
    (0, response_interceptor_1.ResponseMessage)('Investment opportunity deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete an investment opportunity' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminInvestmentsController.prototype, "remove", null);
exports.AdminInvestmentsController = AdminInvestmentsController = __decorate([
    (0, swagger_1.ApiTags)('Admin Investor Showcase'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/investments'),
    __metadata("design:paramtypes", [typeof (_b = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _b : Object])
], AdminInvestmentsController);

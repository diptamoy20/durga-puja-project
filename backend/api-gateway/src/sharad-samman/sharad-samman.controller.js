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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharadSammanController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const sharad_samman_service_1 = require("./sharad-samman.service");
const sharad_samman_dto_1 = require("./dto/sharad-samman.dto");

let SharadSammanController = class SharadSammanController {
    service;
    constructor(service) {
        this.service = service;
    }

    /**
     * Dashboard statistics
     */
    dashboard() {
        return this.service.getDashboardStats();
    }

    /**
     * Available contests for dropdowns
     */
    contests() {
        return this.service.listContests();
    }

    /**
     * Search committees for nomination creation
     */
    committees(search) {
        return this.service.searchCommittees(search);
    }

    /**
     * List nominations
     */
    list(query) {
        return this.service.listNominations(query);
    }

    /**
     * Get nomination by ID
     */
    get(id) {
        return this.service.getNomination(id);
    }

    /**
     * Create nomination on behalf of a committee
     */
    create(dto, actor) {
        return this.service.createNomination(dto, actor?.id);
    }

    /**
     * Edit nomination details
     */
    update(id, dto) {
        return this.service.updateNomination(id, dto);
    }

    /**
     * Change nomination status (Approve, Reject, Shortlist, Review)
     * Enforces SHORTLIST_NOMINATIONS specifically for SHORTLISTED.
     */
    changeStatus(id, dto, actor) {
        const isSuperAdmin = actor?.isSuperAdmin || (actor?.roles && actor.roles.includes('Super Admin'));
        const userPerms = actor?.permissions || [];

        if (dto.status === 'SHORTLISTED') {
            const hasShortlist = isSuperAdmin || userPerms.includes(shared_1.PERMISSIONS.SHORTLIST_NOMINATIONS);
            if (!hasShortlist) {
                throw new common_1.ForbiddenException({
                    message: 'You do not have permission to shortlist nominations.',
                    code: 'FORBIDDEN',
                    details: { required: shared_1.PERMISSIONS.SHORTLIST_NOMINATIONS },
                });
            }
        } else if (dto.status === 'SUBMITTED') {
            const canSubmit = isSuperAdmin || userPerms.includes(shared_1.PERMISSIONS.MANAGE_NOMINATIONS) || userPerms.includes(shared_1.PERMISSIONS.REVIEW_NOMINATIONS);
            if (!canSubmit) {
                throw new common_1.ForbiddenException({
                    message: 'You do not have permission to submit nominations.',
                    code: 'FORBIDDEN',
                    details: { requiredAnyOf: [shared_1.PERMISSIONS.MANAGE_NOMINATIONS, shared_1.PERMISSIONS.REVIEW_NOMINATIONS] },
                });
            }
        } else {
            const hasReview = isSuperAdmin || userPerms.includes(shared_1.PERMISSIONS.REVIEW_NOMINATIONS);
            if (!hasReview) {
                throw new common_1.ForbiddenException({
                    message: 'You do not have permission to review, approve or reject nominations.',
                    code: 'FORBIDDEN',
                    details: { required: shared_1.PERMISSIONS.REVIEW_NOMINATIONS },
                });
            }
        }

        return this.service.changeNominationStatus(id, dto.status, dto.reason, dto.reviewNotes, actor);
    }
};
exports.SharadSammanController = SharadSammanController;

__decorate([
    (0, common_1.Get)('dashboard'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Sharad Samman dashboard stats retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Sharad Samman admin dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SharadSammanController.prototype, "dashboard", null);

__decorate([
    (0, common_1.Get)('contests'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Contests retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List contests for selection' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SharadSammanController.prototype, "contests", null);

__decorate([
    (0, common_1.Get)('committees'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Committees retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Search eligible committees for nomination creation' }),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SharadSammanController.prototype, "committees", null);

__decorate([
    (0, common_1.Get)('nominations'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Nominations retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List and filter Sharad Samman nominations' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof sharad_samman_dto_1.NominationListQueryDto !== "undefined" && sharad_samman_dto_1.NominationListQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], SharadSammanController.prototype, "list", null);

__decorate([
    (0, common_1.Get)('nominations/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Nomination details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single nomination details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SharadSammanController.prototype, "get", null);

__decorate([
    (0, common_1.Post)('nominations'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Nomination created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a nomination on behalf of a Puja Committee' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof sharad_samman_dto_1.CreateNominationDto !== "undefined" && sharad_samman_dto_1.CreateNominationDto) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", void 0)
], SharadSammanController.prototype, "create", null);

__decorate([
    (0, common_1.Put)('nominations/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Nomination updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update nomination details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_d = typeof sharad_samman_dto_1.UpdateNominationDto !== "undefined" && sharad_samman_dto_1.UpdateNominationDto) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], SharadSammanController.prototype, "update", null);

__decorate([
    (0, common_1.Post)('nominations/:id/status'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.REVIEW_NOMINATIONS, shared_1.PERMISSIONS.SHORTLIST_NOMINATIONS, shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Nomination status updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Transition nomination status (review, approve, reject, shortlist)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof sharad_samman_dto_1.NominationStatusTransitionDto !== "undefined" && sharad_samman_dto_1.NominationStatusTransitionDto) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", void 0)
], SharadSammanController.prototype, "changeStatus", null);

exports.SharadSammanController = SharadSammanController = __decorate([
    (0, swagger_1.ApiTags)('Sharad Samman'),
    (0, common_1.Controller)('sharad-samman'),
    __metadata("design:paramtypes", [typeof (_a = typeof sharad_samman_service_1.SharadSammanService !== "undefined" && sharad_samman_service_1.SharadSammanService) === "function" ? _a : Object])
], SharadSammanController);

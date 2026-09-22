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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitteeSharadSammanController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const sharad_samman_service_1 = require("./sharad-samman.service");
const sharad_samman_dto_1 = require("./dto/sharad-samman.dto");

function ensureCommitteeUser(actor) {
    if (!actor || !actor.committeeId) {
        throw new common_1.ForbiddenException({
            message: 'Only approved Puja Committee portal accounts can access committee nominations.',
            code: 'FORBIDDEN',
        });
    }
    return Number(actor.committeeId);
}

let CommitteeSharadSammanController = class CommitteeSharadSammanController {
    service;
    constructor(service) {
        this.service = service;
    }

    /**
     * Get active contest for committee submissions
     */
    activeContest() {
        return this.service.getActiveContest();
    }

    /**
     * List all nominations belonging to the logged-in committee
     */
    list(query, actor) {
        const committeeId = ensureCommitteeUser(actor);
        return this.service.listCommitteeNominations(committeeId, query);
    }

    /**
     * Get single nomination by ID (committee-scoped ownership)
     */
    get(id, actor) {
        const committeeId = ensureCommitteeUser(actor);
        return this.service.getCommitteeNomination(id, committeeId);
    }

    /**
     * Create nomination for the logged-in committee
     */
    create(dto, actor) {
        const committeeId = ensureCommitteeUser(actor);
        return this.service.createCommitteeNomination(dto, committeeId, actor?.id);
    }

    /**
     * Edit draft nomination details
     */
    update(id, dto, actor) {
        const committeeId = ensureCommitteeUser(actor);
        return this.service.updateCommitteeNomination(id, dto, committeeId);
    }

    /**
     * Submit draft nomination to the administrative review queue
     */
    submit(id, actor) {
        const committeeId = ensureCommitteeUser(actor);
        return this.service.submitCommitteeNomination(id, committeeId);
    }

    /**
     * Discard draft nomination
     */
    remove(id, actor) {
        const committeeId = ensureCommitteeUser(actor);
        return this.service.deleteCommitteeDraft(id, committeeId);
    }
};
exports.CommitteeSharadSammanController = CommitteeSharadSammanController;

__decorate([
    (0, common_1.Get)('active-contest'),
    (0, response_interceptor_1.ResponseMessage)('Active contest retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current active contest for committee nominations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommitteeSharadSammanController.prototype, "activeContest", null);

__decorate([
    (0, common_1.Get)(),
    (0, response_interceptor_1.ResponseMessage)('Committee nominations retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List nominations for logged-in committee' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof sharad_samman_dto_1.NominationListQueryDto !== "undefined" && sharad_samman_dto_1.NominationListQueryDto) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", void 0)
], CommitteeSharadSammanController.prototype, "list", null);

__decorate([
    (0, common_1.Get)(':id'),
    (0, response_interceptor_1.ResponseMessage)('Nomination details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single committee nomination details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CommitteeSharadSammanController.prototype, "get", null);

__decorate([
    (0, common_1.Post)(),
    (0, response_interceptor_1.ResponseMessage)('Nomination created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a nomination for the current committee' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof sharad_samman_dto_1.CommitteeCreateNominationDto !== "undefined" && sharad_samman_dto_1.CommitteeCreateNominationDto) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", void 0)
], CommitteeSharadSammanController.prototype, "create", null);

__decorate([
    (0, common_1.Put)(':id'),
    (0, response_interceptor_1.ResponseMessage)('Nomination updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update draft nomination details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_d = typeof sharad_samman_dto_1.CommitteeUpdateNominationDto !== "undefined" && sharad_samman_dto_1.CommitteeUpdateNominationDto) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", void 0)
], CommitteeSharadSammanController.prototype, "update", null);

__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, response_interceptor_1.ResponseMessage)('Nomination submitted successfully for review'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit draft nomination to admin review queue' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CommitteeSharadSammanController.prototype, "submit", null);

__decorate([
    (0, common_1.Delete)(':id'),
    (0, response_interceptor_1.ResponseMessage)('Draft nomination deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Discard draft nomination' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CommitteeSharadSammanController.prototype, "remove", null);

exports.CommitteeSharadSammanController = CommitteeSharadSammanController = __decorate([
    (0, swagger_1.ApiTags)('Committee Sharad Samman'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('committee/nominations'),
    __metadata("design:paramtypes", [typeof (_a = typeof sharad_samman_service_1.SharadSammanService !== "undefined" && sharad_samman_service_1.SharadSammanService) === "function" ? _a : Object])
], CommitteeSharadSammanController);

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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PujaCommitteeController = exports.DiasporaVerificationController = exports.PublicRegistrationController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const registration_dto_1 = require("./dto/registration.dto");
// ============================================================================
// PUBLIC Registration (no auth)
// ============================================================================
let PublicRegistrationController = class PublicRegistrationController {
    client;
    constructor(client) {
        this.client = client;
    }
    submitDiaspora(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.DIASPORA_SUBMIT, dto);
    }
    submitCommittee(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_SUBMIT, dto);
    }
};
exports.PublicRegistrationController = PublicRegistrationController;
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('diaspora'),
    (0, response_interceptor_1.ResponseMessage)('Diaspora registration submitted successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit a diaspora registration',
        description: 'Public-facing form. Creates a pending diaspora registration that an admin will verify or reject.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Registration created.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'A registration already exists for this email.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof registration_dto_1.SubmitDiasporaDto !== "undefined" && registration_dto_1.SubmitDiasporaDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], PublicRegistrationController.prototype, "submitDiaspora", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('committee'),
    (0, response_interceptor_1.ResponseMessage)('Committee registration submitted successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit a puja committee registration',
        description: 'Public-facing form. Creates a pending committee application that an admin will review.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Application created.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof registration_dto_1.SubmitCommitteeDto !== "undefined" && registration_dto_1.SubmitCommitteeDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], PublicRegistrationController.prototype, "submitCommittee", null);
exports.PublicRegistrationController = PublicRegistrationController = __decorate([
    (0, swagger_1.ApiTags)('Public Registration'),
    (0, common_1.Controller)('registrations'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], PublicRegistrationController);
// ============================================================================
// Admin: Diaspora Verification
// ============================================================================
let DiasporaVerificationController = class DiasporaVerificationController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.DIASPORA_FIND_ALL, query);
    }
    stats() {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.DIASPORA_STATS, {});
    }
    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.DIASPORA_FIND_ONE, { id });
    }
    verify(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.DIASPORA_VERIFY, {
            id,
            reason: dto.reason,
            actorId: actor.id,
        });
    }
    reject(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.DIASPORA_REJECT, {
            id,
            reason: dto.reason,
            actorId: actor.id,
        });
    }
};
exports.DiasporaVerificationController = DiasporaVerificationController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_DIASPORA),
    (0, response_interceptor_1.ResponseMessage)('Diaspora registrations retrieved successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'List diaspora registrations',
        description: 'Paginated, searchable and filterable by status and country.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof registration_dto_1.ListDiasporaQueryDto !== "undefined" && registration_dto_1.ListDiasporaQueryDto) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], DiasporaVerificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_DIASPORA),
    (0, response_interceptor_1.ResponseMessage)('Diaspora statistics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Diaspora registration counts by status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiasporaVerificationController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_DIASPORA),
    (0, response_interceptor_1.ResponseMessage)('Diaspora registration retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a diaspora registration with its verification history' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No registration with that id.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DiasporaVerificationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VERIFY_DIASPORA),
    (0, response_interceptor_1.ResponseMessage)('Diaspora registration verified successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify a pending diaspora registration' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'The registration is not pending.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof registration_dto_1.DecideDiasporaDto !== "undefined" && registration_dto_1.DecideDiasporaDto) === "function" ? _f : Object, typeof (_g = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], DiasporaVerificationController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.REJECT_DIASPORA),
    (0, response_interceptor_1.ResponseMessage)('Diaspora registration rejected'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a pending diaspora registration' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'A reason is required, or the registration is not pending.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_h = typeof registration_dto_1.DecideDiasporaDto !== "undefined" && registration_dto_1.DecideDiasporaDto) === "function" ? _h : Object, typeof (_j = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], DiasporaVerificationController.prototype, "reject", null);
exports.DiasporaVerificationController = DiasporaVerificationController = __decorate([
    (0, swagger_1.ApiTags)('Diaspora Verification'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('diaspora-verifications'),
    __metadata("design:paramtypes", [typeof (_d = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _d : Object])
], DiasporaVerificationController);
// ============================================================================
// Admin: Puja Committee Management
// ============================================================================
let PujaCommitteeController = class PujaCommitteeController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_FIND_ALL, query);
    }
    stats() {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_STATS, {});
    }
    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_FIND_ONE, { id });
    }
    update(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_UPDATE, {
            id,
            data: dto,
            actorId: actor.id,
        });
    }
    changeStatus(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_CHANGE_STATUS, {
            id,
            status: dto.status,
            reason: dto.reason,
            actorId: actor.id,
        });
    }
    createPortalAccount(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_CREATE_PORTAL_ACCOUNT, { id, actorId: actor.id });
    }
    bulkAction(dto, actor) {
        // Fan out to individual status changes; the service handles each one.
        const promises = dto.ids.map((id) => this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_CHANGE_STATUS, {
            id,
            status: dto.action,
            reason: dto.reason,
            actorId: actor.id,
        }));
        return Promise.allSettled(promises).then((results) => ({
            succeeded: results.filter((r) => r.status === 'fulfilled').length,
            failed: results.filter((r) => r.status === 'rejected').length,
        }));
    }
};
exports.PujaCommitteeController = PujaCommitteeController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_COMMITTEES),
    (0, response_interceptor_1.ResponseMessage)('Puja committees retrieved successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'List puja committee applications',
        description: 'Paginated, searchable and filterable by status and city.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof registration_dto_1.ListCommitteesQueryDto !== "undefined" && registration_dto_1.ListCommitteesQueryDto) === "function" ? _l : Object]),
    __metadata("design:returntype", void 0)
], PujaCommitteeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_COMMITTEES),
    (0, response_interceptor_1.ResponseMessage)('Committee statistics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Committee application counts by status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PujaCommitteeController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_COMMITTEES),
    (0, response_interceptor_1.ResponseMessage)('Puja committee retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a committee application with status history' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No committee with that id.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PujaCommitteeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.APPROVE_COMMITTEES),
    (0, response_interceptor_1.ResponseMessage)('Puja committee updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update committee application details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_m = typeof registration_dto_1.UpdateCommitteeDto !== "undefined" && registration_dto_1.UpdateCommitteeDto) === "function" ? _m : Object, typeof (_o = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _o : Object]),
    __metadata("design:returntype", void 0)
], PujaCommitteeController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.APPROVE_COMMITTEES),
    (0, response_interceptor_1.ResponseMessage)('Committee status updated successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Change committee application status',
        description: 'Move between pending, under_review, approved, rejected.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_p = typeof registration_dto_1.ChangeCommitteeStatusDto !== "undefined" && registration_dto_1.ChangeCommitteeStatusDto) === "function" ? _p : Object, typeof (_q = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _q : Object]),
    __metadata("design:returntype", void 0)
], PujaCommitteeController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Post)(':id/create-portal-account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_COMMITTEE_PORTAL_ACCOUNT),
    (0, response_interceptor_1.ResponseMessage)('Portal account created successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a portal user account for an approved committee',
        description: 'Provisions a User linked to the committee, generates credentials and assigns the Committee Member role.',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Committee is not approved or already has an account.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_r = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _r : Object]),
    __metadata("design:returntype", void 0)
], PujaCommitteeController.prototype, "createPortalAccount", null);
__decorate([
    (0, common_1.Post)('bulk-action'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.APPROVE_COMMITTEES),
    (0, response_interceptor_1.ResponseMessage)('Bulk action completed successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply a status change to multiple committees at once' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_s = typeof registration_dto_1.BulkCommitteeActionDto !== "undefined" && registration_dto_1.BulkCommitteeActionDto) === "function" ? _s : Object, typeof (_t = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _t : Object]),
    __metadata("design:returntype", void 0)
], PujaCommitteeController.prototype, "bulkAction", null);
exports.PujaCommitteeController = PujaCommitteeController = __decorate([
    (0, swagger_1.ApiTags)('Puja Committees'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('puja-committees'),
    __metadata("design:paramtypes", [typeof (_k = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _k : Object])
], PujaCommitteeController);

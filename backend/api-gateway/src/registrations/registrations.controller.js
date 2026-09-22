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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PujaCommitteeController = exports.DiasporaVerificationController = exports.PublicRegistrationController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const registration_dto_1 = require("./dto/registration.dto");
const registration_upload_util_1 = require("./registration-upload.util");
const PUBLIC_UPLOAD_DIR = process.env.UPLOAD_DIR ?? './storage/uploads';
const COMMITTEE_DOCUMENT_FIELDS = {
    registration_certificate: 'registrationCertificate',
    address_proof: 'addressProof',
    pandal_image: 'pandalImage',
};
function parseBoolean(value) {
    return value === true || value === 'true' || value === '1' || value === 1;
}
function parseCommitteeMultipartBody(body, files) {
    const rel = (file) => file ? (0, node_path_1.join)('committee-documents', file.filename).replace(/\\/g, '/') : '';
    return {
        committeeName: body.committeeName?.trim(),
        establishedYear: Number(body.establishedYear),
        pujaType: body.pujaType,
        pujaCategory: body.pujaCategory,
        committeeDescription: body.committeeDescription,
        contactPersonName: body.contactPersonName?.trim(),
        designation: body.designation,
        email: body.email?.trim().toLowerCase(),
        mobile: body.mobile,
        country: body.country,
        state: body.state,
        city: body.city,
        postalCode: body.postalCode,
        venueName: body.venueName,
        venueAddress: body.venueAddress,
        landmark: body.landmark || undefined,
        address: body.address,
        registrationCertificate: rel(files?.registrationCertificate?.[0]),
        addressProof: rel(files?.addressProof?.[0]),
        pandalImage: rel(files?.pandalImage?.[0]),
        declaration: parseBoolean(body.declaration),
        captcha: body.captcha,
        captchaToken: body.captchaToken,
    };
}
function parseCommitteeUpdateBody(body, files) {
    const rel = (file) => file ? (0, node_path_1.join)('committee-documents', file.filename).replace(/\\/g, '/') : '';
    const data = {};
    const textFields = [
        'committeeName', 'pujaType', 'pujaCategory', 'committeeDescription',
        'contactPersonName', 'designation', 'email', 'mobile', 'country', 'state',
        'city', 'postalCode', 'venueName', 'venueAddress', 'landmark', 'address',
    ];
    for (const field of textFields) {
        if (body[field] !== undefined && body[field] !== '') {
            data[field] = field === 'email' ? String(body[field]).trim().toLowerCase() : body[field];
        }
    }
    if (body.establishedYear !== undefined && body.establishedYear !== '') {
        data.establishedYear = Number(body.establishedYear);
    }
    if (files?.registrationCertificate?.[0]) {
        data.registrationCertificate = rel(files.registrationCertificate[0]);
    }
    if (files?.addressProof?.[0]) {
        data.addressProof = rel(files.addressProof[0]);
    }
    if (files?.pandalImage?.[0]) {
        data.pandalImage = rel(files.pandalImage[0]);
    }
    return data;
}
const BULK_STATUS_MAP = {
    approve: 'APPROVED',
    reject: 'REJECTED',
};
// ============================================================================
// PUBLIC Registration (no auth)
// ============================================================================
let PublicRegistrationController = class PublicRegistrationController {
    client;
    config;
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }
    captcha() {
        return shared_1.createRegistrationCaptcha();
    }
    submitDiaspora(dto) {
        if (!shared_1.verifyRegistrationCaptcha(dto.captchaToken, dto.captcha)) {
            throw new common_1.BadRequestException('The security check answer is incorrect.');
        }
        const { captcha, captchaToken, ...payload } = dto;
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.DIASPORA_SUBMIT, payload);
    }
    submitCommittee(body, files) {
        const dto = parseCommitteeMultipartBody(body, files);
        if (!shared_1.verifyRegistrationCaptcha(dto.captchaToken, dto.captcha)) {
            throw new common_1.BadRequestException('The security check answer is incorrect.');
        }
        if (!dto.registrationCertificate || !dto.addressProof || !dto.pandalImage) {
            throw new common_1.BadRequestException('All required documents must be uploaded.');
        }
        const { captcha, captchaToken, ...payload } = dto;
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_SUBMIT, payload);
    }
};
exports.PublicRegistrationController = PublicRegistrationController;
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('captcha'),
    (0, response_interceptor_1.ResponseMessage)('Captcha generated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a registration security check question' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicRegistrationController.prototype, "captcha", null);
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
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'registrationCertificate', maxCount: 1 },
        { name: 'addressProof', maxCount: 1 },
        { name: 'pandalImage', maxCount: 1 },
    ], (0, registration_upload_util_1.committeeUploadOptions)(PUBLIC_UPLOAD_DIR))),
    (0, response_interceptor_1.ResponseMessage)('Committee registration submitted successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit a puja committee registration',
        description: 'Public-facing multipart form. Creates a pending committee application that an admin will review.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Application created.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PublicRegistrationController.prototype, "submitCommittee", null);
exports.PublicRegistrationController = PublicRegistrationController = __decorate([
    (0, swagger_1.ApiTags)('Public Registration'),
    (0, common_1.Controller)('registrations'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object, typeof (_v = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _v : Object])
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
    async document(id, document, query, res) {
        const field = COMMITTEE_DOCUMENT_FIELDS[document];
        if (!field) {
            throw new common_1.BadRequestException('Unknown document type.');
        }
        const committee = await this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_FIND_ONE, { id });
        const relativePath = committee?.[field];
        if (!relativePath) {
            throw new common_1.NotFoundException('Document not found for this committee.');
        }
        const absolutePath = (0, node_path_1.join)(PUBLIC_UPLOAD_DIR, relativePath);
        if (!(0, node_fs_1.existsSync)(absolutePath)) {
            throw new common_1.NotFoundException('Document file is missing on the server.');
        }
        if (query.download === '1' || query.download === 'true') {
            return res.download(absolutePath);
        }
        return res.sendFile(absolutePath);
    }
    update(id, body, files, actor) {
        const data = parseCommitteeUpdateBody(body ?? {}, files);
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_UPDATE, {
            id,
            data,
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
    generateLocalPassword(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_GENERATE_LOCAL_PASSWORD, { id, actorId: actor.id });
    }
    async bulkAction(dto, actor) {
        if (!dto.ids?.length) {
            throw new common_1.BadRequestException('Select at least one application.');
        }
        if (dto.action === 'reject' && !dto.reason?.trim()) {
            throw new common_1.BadRequestException('A rejection reason is required.');
        }
        if (dto.action === 'status' && !dto.status) {
            throw new common_1.BadRequestException('Select a status to apply.');
        }
        const results = await Promise.allSettled(dto.ids.map(async (committeeId) => {
            if (dto.action === 'delete') {
                return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_REMOVE, { id: committeeId });
            }
            const status = dto.action === 'status'
                ? dto.status
                : BULK_STATUS_MAP[dto.action];
            return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_CHANGE_STATUS, {
                id: committeeId,
                status,
                reason: dto.reason,
                actorId: actor.id,
            });
        }));
        return {
            succeeded: results.filter((r) => r.status === 'fulfilled').length,
            failed: results.filter((r) => r.status === 'rejected').length,
        };
    }
    remove(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_REMOVE, { id });
    }
    async exportCsv(query) {
        const result = await this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_FIND_ALL, {
            ...query,
            page: 1,
            perPage: 1000,
        });
        const items = result?.items ?? [];
        const header = [
            'Registration No', 'Committee Name', 'Contact Person', 'Email', 'Mobile',
            'City', 'Status', 'Committee ID', 'Created At',
        ].join(',');
        const lines = items.map((row) => [
            row.registrationNo,
            row.committeeName,
            row.contactPersonName,
            row.email,
            row.mobile,
            row.city,
            row.status,
            row.committeeId,
            row.createdAt,
        ].map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','));
        return {
            filename: 'puja-committee-applications.csv',
            content: [header, ...lines].join('\n'),
        };
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
    (0, common_1.Get)(':id/documents/:document'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_COMMITTEES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('document')),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object, Object]),
    __metadata("design:returntype", Promise)
], PujaCommitteeController.prototype, "document", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'registrationCertificate', maxCount: 1 },
        { name: 'addressProof', maxCount: 1 },
        { name: 'pandalImage', maxCount: 1 },
    ], (0, registration_upload_util_1.committeeUploadOptions)(PUBLIC_UPLOAD_DIR))),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_COMMITTEES),
    (0, response_interceptor_1.ResponseMessage)('Puja committee updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update committee application details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, typeof (_o = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _o : Object]),
    __metadata("design:returntype", void 0)
], PujaCommitteeController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.APPROVE_COMMITTEES, shared_1.PERMISSIONS.REJECT_COMMITTEES),
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
    (0, common_1.Post)(':id/generate-local-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_COMMITTEES),
    (0, response_interceptor_1.ResponseMessage)('Local development password generated'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a new local development password for the committee portal account' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_r = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _r : Object]),
    __metadata("design:returntype", void 0)
], PujaCommitteeController.prototype, "generateLocalPassword", null);
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
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_COMMITTEES),
    (0, response_interceptor_1.ResponseMessage)('Puja committee deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a committee application' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PujaCommitteeController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EXPORT_COMMITTEES),
    (0, response_interceptor_1.ResponseMessage)('Committee export generated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Export filtered committee applications as CSV' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_u = typeof registration_dto_1.ListCommitteesQueryDto !== "undefined" && registration_dto_1.ListCommitteesQueryDto) === "function" ? _u : Object]),
    __metadata("design:returntype", Promise)
], PujaCommitteeController.prototype, "exportCsv", null);
exports.PujaCommitteeController = PujaCommitteeController = __decorate([
    (0, swagger_1.ApiTags)('Puja Committees'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('puja-committees'),
    __metadata("design:paramtypes", [typeof (_k = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _k : Object])
], PujaCommitteeController);

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
exports.AdminAtlasController = exports.PublicAtlasController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const atlas_dto_1 = require("./dto/atlas.dto");
const atlas_upload_util_1 = require("./atlas-upload.util");
const PUBLIC_UPLOAD_DIR = process.env.UPLOAD_DIR ?? './storage/uploads';
function parseCreateBody(body, files) {
    const photos = (files?.photos ?? []).map(atlas_upload_util_1.relativeAtlasPhotoPath).filter(Boolean);
    const virtualTourUrl = files?.virtual_tour_file?.[0]
        ? (0, atlas_upload_util_1.relativeAtlasTourPath)(files.virtual_tour_file[0])
        : (body.virtualTourUrl?.trim() || body.virtual_tour_url?.trim() || null);
    return {
        name: body.name?.trim(),
        location: body.location?.trim(),
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        pujaCommitteeId: Number(body.pujaCommitteeId ?? body.puja_committee_id),
        timing: body.timing?.trim(),
        ritualSchedule: body.ritualSchedule?.trim() || body.ritual_schedule?.trim() || null,
        livestreamUrl: body.livestreamUrl?.trim() || body.livestream_url?.trim() || null,
        virtualTourUrl,
        photos,
        action: body.action === 'submit' ? 'submit' : 'draft',
    };
}
function parseUpdateBody(body, files) {
    const data = {};
    if (body.name !== undefined)
        data.name = body.name?.trim();
    if (body.location !== undefined)
        data.location = body.location?.trim();
    if (body.latitude !== undefined && body.latitude !== '')
        data.latitude = Number(body.latitude);
    if (body.longitude !== undefined && body.longitude !== '')
        data.longitude = Number(body.longitude);
    if (body.pujaCommitteeId !== undefined || body.puja_committee_id !== undefined) {
        data.pujaCommitteeId = Number(body.pujaCommitteeId ?? body.puja_committee_id);
    }
    if (body.timing !== undefined)
        data.timing = body.timing?.trim();
    if (body.ritualSchedule !== undefined || body.ritual_schedule !== undefined) {
        data.ritualSchedule = body.ritualSchedule?.trim() || body.ritual_schedule?.trim() || null;
    }
    if (body.livestreamUrl !== undefined || body.livestream_url !== undefined) {
        data.livestreamUrl = body.livestreamUrl?.trim() || body.livestream_url?.trim() || null;
    }
    const newPhotos = (files?.photos ?? []).map(atlas_upload_util_1.relativeAtlasPhotoPath).filter(Boolean);
    if (newPhotos.length)
        data.photos = newPhotos;
    if (files?.virtual_tour_file?.[0]) {
        data.virtualTourUrl = (0, atlas_upload_util_1.relativeAtlasTourPath)(files.virtual_tour_file[0]);
    }
    else if (body.virtualTourUrl !== undefined || body.virtual_tour_url !== undefined) {
        data.virtualTourUrl = body.virtualTourUrl?.trim() || body.virtual_tour_url?.trim() || null;
    }
    const remove = body.removePhotos ?? body.remove_photos;
    if (remove) {
        data.removePhotos = Array.isArray(remove) ? remove : [remove];
    }
    if (body.action === 'submit')
        data.action = 'submit';
    return data;
}
function assertCreatePayload(data) {
    if (!data.name || !data.location || !data.timing) {
        throw new common_1.BadRequestException('Name, location, and timing are required.');
    }
    if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) {
        throw new common_1.BadRequestException('Valid latitude and longitude are required.');
    }
    if (!Number.isInteger(data.pujaCommitteeId)) {
        throw new common_1.BadRequestException('A Puja Committee must be selected.');
    }
}
function isAtlasModerator(actor) {
    return actor.isSuperAdmin ||
        (actor.permissions ?? []).includes(shared_1.PERMISSIONS.MODERATE_PANDAL_ATLAS);
}
function atlasCommitteeScope(actor) {
    if (isAtlasModerator(actor))
        return undefined;
    return actor.committeeId ?? undefined;
}
function resolveCreateCommitteeId(data, actor) {
    if (isAtlasModerator(actor)) {
        if (!Number.isInteger(data.pujaCommitteeId)) {
            throw new common_1.BadRequestException('A Puja Committee must be selected.');
        }
        return data.pujaCommitteeId;
    }
    if (!actor.committeeId) {
        throw new common_1.BadRequestException('No approved committee is linked to this account.');
    }
    return actor.committeeId;
}
// ============================================================================
// Public Atlas
// ============================================================================
let PublicAtlasController = class PublicAtlasController {
    client;
    constructor(client) {
        this.client = client;
    }
    index(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.PUBLIC_LIST, query);
    }
    mapData(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.MAP_DATA, query);
    }
    async file(relativePath, res) {
        const safePath = decodeURIComponent(relativePath).replace(/\\/g, '/');
        if (!safePath.startsWith('pandal-atlas/') || safePath.includes('..')) {
            throw new common_1.NotFoundException('File not found.');
        }
        const absolutePath = (0, node_path_1.join)(PUBLIC_UPLOAD_DIR, safePath);
        if (!(0, node_fs_1.existsSync)(absolutePath)) {
            throw new common_1.NotFoundException('File not found.');
        }
        return res.sendFile(absolutePath);
    }
    show(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.FIND_ONE, { id, publicOnly: true });
    }
};
exports.PublicAtlasController = PublicAtlasController;
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(),
    (0, response_interceptor_1.ResponseMessage)('Public atlas data retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Public pandal atlas with optional map-bounds filtering' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof atlas_dto_1.MapBoundsQueryDto !== "undefined" && atlas_dto_1.MapBoundsQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], PublicAtlasController.prototype, "index", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('map-data'),
    (0, response_interceptor_1.ResponseMessage)('Map data retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Pandal pins for the map view' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof atlas_dto_1.MapBoundsQueryDto !== "undefined" && atlas_dto_1.MapBoundsQueryDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], PublicAtlasController.prototype, "mapData", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('files/*'),
    __param(0, (0, common_1.Param)('0')),
    __param(1, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicAtlasController.prototype, "file", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, response_interceptor_1.ResponseMessage)('Pandal details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Public pandal detail view' }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PublicAtlasController.prototype, "show", null);
exports.PublicAtlasController = PublicAtlasController = __decorate([
    (0, swagger_1.ApiTags)('Public Atlas'),
    (0, common_1.Controller)('atlas'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], PublicAtlasController);
// ============================================================================
// Admin Pandal Atlas
// ============================================================================
let AdminAtlasController = class AdminAtlasController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.FIND_ALL, {
            ...query,
            scopeToCommitteeId: atlasCommitteeScope(actor),
        });
    }
    stats() {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.STATS, {});
    }
    formOptions(actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.FORM_OPTIONS, {
            isModerator: isAtlasModerator(actor),
            committeeId: actor.committeeId ?? null,
        });
    }
    findOne(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.FIND_ONE, {
            id,
            scopeToCommitteeId: atlasCommitteeScope(actor),
        });
    }
    create(body, files, actor) {
        const data = parseCreateBody(body ?? {}, files);
        data.pujaCommitteeId = resolveCreateCommitteeId(data, actor);
        assertCreatePayload(data);
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.CREATE, {
            data,
            actorId: actor.id,
        });
    }
    update(id, body, files, actor) {
        const data = parseUpdateBody(body ?? {}, files);
        if (!isAtlasModerator(actor)) {
            delete data.pujaCommitteeId;
        }
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.UPDATE, {
            id,
            data,
            actorId: actor.id,
            scopeToCommitteeId: atlasCommitteeScope(actor),
        });
    }
    remove(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.REMOVE, {
            id,
            actorId: actor.id,
            scopeToCommitteeId: atlasCommitteeScope(actor),
        });
    }
    submit(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.SUBMIT, {
            id,
            actorId: actor.id,
            scopeToCommitteeId: atlasCommitteeScope(actor),
        });
    }
    moderate(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.MODERATE, {
            id,
            decision: dto.decision,
            remarks: dto.remarks,
            actorId: actor.id,
        });
    }
};
exports.AdminAtlasController = AdminAtlasController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandals retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all pandal entries with admin filters' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof atlas_dto_1.ListPandalsQueryDto !== "undefined" && atlas_dto_1.ListPandalsQueryDto) === "function" ? _e : Object, typeof (_f = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Atlas statistics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Pandal counts by status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('form-options'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_PANDAL_ATLAS, shared_1.PERMISSIONS.EDIT_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal form options retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Approved committees for the pandal atlas form' }),
    __param(0, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "formOptions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pandal details' }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_h = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'photos', maxCount: 10 },
        { name: 'virtual_tour_file', maxCount: 1 },
    ], (0, atlas_upload_util_1.atlasMultipartOptions)(PUBLIC_UPLOAD_DIR))),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new pandal entry (draft or submit)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, typeof (_f = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'photos', maxCount: 10 },
        { name: 'virtual_tour_file', maxCount: 1 },
    ], (0, atlas_upload_util_1.atlasMultipartOptions)(PUBLIC_UPLOAD_DIR))),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a pandal entry' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, typeof (_g = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.DELETE_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a pandal entry' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_h = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal submitted for review'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a draft pandal for moderation' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_j = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/moderate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MODERATE_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal moderation action completed'),
    (0, swagger_1.ApiOperation)({
        summary: 'Moderate a submitted pandal',
        description: 'Actions: start_review, approve, reject',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_k = typeof atlas_dto_1.ModeratePandalDto !== "undefined" && atlas_dto_1.ModeratePandalDto) === "function" ? _k : Object, typeof (_l = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _l : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "moderate", null);
exports.AdminAtlasController = AdminAtlasController = __decorate([
    (0, swagger_1.ApiTags)('Pandal Atlas (Admin)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/pandal-atlas'),
    __metadata("design:paramtypes", [typeof (_d = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _d : Object])
], AdminAtlasController);

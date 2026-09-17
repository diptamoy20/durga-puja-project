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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlbumsController = exports.AdminMediaController = exports.CommitteeMediaController = exports.PublicGalleryController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const gallery_dto_1 = require("./dto/gallery.dto");
// ============================================================================
// Public Gallery
// ============================================================================
let PublicGalleryController = class PublicGalleryController {
    client;
    constructor(client) {
        this.client = client;
    }
    index(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_PUBLIC_LIST, query);
    }
    show(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_FIND_ONE, { id });
    }
};
exports.PublicGalleryController = PublicGalleryController;
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(),
    (0, response_interceptor_1.ResponseMessage)('Gallery items retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Public gallery listing (approved media only)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof gallery_dto_1.ListMediaQueryDto !== "undefined" && gallery_dto_1.ListMediaQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], PublicGalleryController.prototype, "index", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, response_interceptor_1.ResponseMessage)('Gallery item retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single gallery item' }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PublicGalleryController.prototype, "show", null);
exports.PublicGalleryController = PublicGalleryController = __decorate([
    (0, swagger_1.ApiTags)('Public Gallery'),
    (0, common_1.Controller)('gallery'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], PublicGalleryController);
// ============================================================================
// Committee Media (committee-member view)
// ============================================================================
let CommitteeMediaController = class CommitteeMediaController {
    client;
    constructor(client) {
        this.client = client;
    }
    index(query, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_MY_UPLOADS, {
            ...query,
            uploadedById: actor.id,
        });
    }
    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_FIND_ONE, { id });
    }
    create(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_CREATE, {
            ...dto,
            uploadedById: actor.id,
        });
    }
    update(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_UPDATE, {
            id,
            data: dto,
            actorId: actor.id,
        });
    }
    remove(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_REMOVE, {
            id,
            actorId: actor.id,
        });
    }
};
exports.CommitteeMediaController = CommitteeMediaController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_GALLERY),
    (0, response_interceptor_1.ResponseMessage)('Media retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List media uploaded by the current committee' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof gallery_dto_1.ListMediaQueryDto !== "undefined" && gallery_dto_1.ListMediaQueryDto) === "function" ? _d : Object, typeof (_e = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], CommitteeMediaController.prototype, "index", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_GALLERY),
    (0, response_interceptor_1.ResponseMessage)('Media item retrieved successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CommitteeMediaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.UPLOAD_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Media uploaded successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload new media' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof gallery_dto_1.CreateMediaDto !== "undefined" && gallery_dto_1.CreateMediaDto) === "function" ? _e : Object, typeof (_f = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], CommitteeMediaController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.UPLOAD_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Media updated successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof gallery_dto_1.UpdateMediaDto !== "undefined" && gallery_dto_1.UpdateMediaDto) === "function" ? _g : Object, typeof (_h = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], CommitteeMediaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.UPLOAD_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Media deleted successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_j = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], CommitteeMediaController.prototype, "remove", null);
exports.CommitteeMediaController = CommitteeMediaController = __decorate([
    (0, swagger_1.ApiTags)('Committee Media'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('committee/media'),
    __metadata("design:paramtypes", [typeof (_c = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _c : Object])
], CommitteeMediaController);
// ============================================================================
// Admin Media Management
// ============================================================================
let AdminMediaController = class AdminMediaController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_FIND_ALL, query);
    }
    moderationQueue(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_MODERATION_QUEUE, query);
    }
    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_FIND_ONE, { id });
    }
    moderate(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_MODERATE, {
            id,
            decision: dto.decision,
            rejectionReason: dto.rejectionReason,
            actorId: actor.id,
        });
    }
    create(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.MEDIA_CREATE, {
            ...dto,
            uploadedById: actor.id,
        });
    }
};
exports.AdminMediaController = AdminMediaController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MODERATE_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Media retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all committee media (admin view)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof gallery_dto_1.ListMediaQueryDto !== "undefined" && gallery_dto_1.ListMediaQueryDto) === "function" ? _l : Object]),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('moderation-queue'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MODERATE_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Moderation queue retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List pending media awaiting moderation' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof gallery_dto_1.ListMediaQueryDto !== "undefined" && gallery_dto_1.ListMediaQueryDto) === "function" ? _m : Object]),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "moderationQueue", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MODERATE_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Media item retrieved successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/moderate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MODERATE_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Media moderated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve or reject a media item' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_o = typeof gallery_dto_1.ModerateMediaDto !== "undefined" && gallery_dto_1.ModerateMediaDto) === "function" ? _o : Object, typeof (_p = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _p : Object]),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "moderate", null);
__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MODERATE_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Media created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload media as admin' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_q = typeof gallery_dto_1.CreateMediaDto !== "undefined" && gallery_dto_1.CreateMediaDto) === "function" ? _q : Object, typeof (_r = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _r : Object]),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "create", null);
exports.AdminMediaController = AdminMediaController = __decorate([
    (0, swagger_1.ApiTags)('Admin Media'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/media'),
    __metadata("design:paramtypes", [typeof (_k = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _k : Object])
], AdminMediaController);
// ============================================================================
// Albums
// ============================================================================
let AlbumsController = class AlbumsController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.ALBUM_FIND_ALL, query);
    }
    create(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.ALBUM_CREATE, {
            data: dto,
            actorId: actor.id,
        });
    }
    syncMedia(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.GALLERY, shared_1.GALLERY_PATTERNS.ALBUM_SYNC_MEDIA, {
            id,
            mediaIds: dto.mediaIds,
            actorId: actor.id,
        });
    }
};
exports.AlbumsController = AlbumsController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_ALBUMS),
    (0, response_interceptor_1.ResponseMessage)('Albums retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List albums' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_t = typeof gallery_dto_1.ListMediaQueryDto !== "undefined" && gallery_dto_1.ListMediaQueryDto) === "function" ? _t : Object]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_ALBUMS),
    (0, response_interceptor_1.ResponseMessage)('Album created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an album' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_u = typeof gallery_dto_1.CreateAlbumDto !== "undefined" && gallery_dto_1.CreateAlbumDto) === "function" ? _u : Object, typeof (_v = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _v : Object]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id/media'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_ALBUMS),
    (0, response_interceptor_1.ResponseMessage)('Album media updated successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Replace the media items in an album',
        description: 'The supplied list becomes the complete set of media for this album.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_w = typeof gallery_dto_1.SyncAlbumMediaDto !== "undefined" && gallery_dto_1.SyncAlbumMediaDto) === "function" ? _w : Object, typeof (_x = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _x : Object]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "syncMedia", null);
exports.AlbumsController = AlbumsController = __decorate([
    (0, swagger_1.ApiTags)('Albums'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('albums'),
    __metadata("design:paramtypes", [typeof (_s = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _s : Object])
], AlbumsController);

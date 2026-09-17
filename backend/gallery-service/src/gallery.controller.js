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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const gallery_service_1 = require("./gallery.service");
let GalleryController = class GalleryController {
    gallery;
    constructor(gallery) {
        this.gallery = gallery;
    }
    ping() {
        return { service: 'gallery-service', status: 'ok' };
    }
    findAll(query) {
        return this.gallery.findAll(query);
    }
    publicList(query) {
        return this.gallery.publicList(query);
    }
    myUploads(query) {
        return this.gallery.findAll({
            ...query,
            uploadedById: query.uploadedById ?? query.actorId,
        });
    }
    findOne(payload) {
        return this.gallery.findOne(payload);
    }
    create(payload) {
        return this.gallery.create(payload);
    }
    update(payload) {
        return this.gallery.update(payload);
    }
    remove(payload) {
        return this.gallery.remove(payload);
    }
    moderationQueue(query) {
        return this.gallery.moderationQueue(query);
    }
    moderate(payload) {
        return this.gallery.moderate(payload);
    }
    findAllAlbums(query) {
        return this.gallery.findAllAlbums(query);
    }
    createAlbum(payload) {
        return this.gallery.createAlbum(payload);
    }
    syncAlbumMedia(payload) {
        return this.gallery.syncAlbumMedia(payload);
    }
};
exports.GalleryController = GalleryController;
__decorate([
    (0, microservices_1.MessagePattern)('health.ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], GalleryController.prototype, "ping", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.MEDIA_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof gallery_service_1.ListMediaPayload !== "undefined" && gallery_service_1.ListMediaPayload) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.MEDIA_PUBLIC_LIST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof gallery_service_1.ListMediaPayload !== "undefined" && gallery_service_1.ListMediaPayload) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "publicList", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.MEDIA_MY_UPLOADS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof gallery_service_1.ListMediaPayload !== "undefined" && gallery_service_1.ListMediaPayload) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "myUploads", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.MEDIA_FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.MEDIA_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof gallery_service_1.CreateMediaPayload !== "undefined" && gallery_service_1.CreateMediaPayload) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.MEDIA_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "update", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.MEDIA_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "remove", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.MEDIA_MODERATION_QUEUE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof gallery_service_1.ListMediaPayload !== "undefined" && gallery_service_1.ListMediaPayload) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "moderationQueue", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.MEDIA_MODERATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof gallery_service_1.ModerateMediaPayload !== "undefined" && gallery_service_1.ModerateMediaPayload) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "moderate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.ALBUM_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "findAllAlbums", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.ALBUM_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "createAlbum", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.GALLERY_PATTERNS.ALBUM_SYNC_MEDIA),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GalleryController.prototype, "syncAlbumMedia", null);
exports.GalleryController = GalleryController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof gallery_service_1.GalleryService !== "undefined" && gallery_service_1.GalleryService) === "function" ? _a : Object])
], GalleryController);

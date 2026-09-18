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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtlasController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const atlas_service_1 = require("./atlas.service");
let AtlasController = class AtlasController {
    atlas;
    constructor(atlas) {
        this.atlas = atlas;
    }
    ping() {
        return { service: 'atlas-service', status: 'ok' };
    }
    findAll(query) {
        return this.atlas.findAll(query);
    }
    findOne(payload) {
        return this.atlas.findOne(payload);
    }
    stats() {
        return this.atlas.stats();
    }
    publicList(query) {
        return this.atlas.publicList(query);
    }
    mapData(query) {
        return this.atlas.mapData(query);
    }
    formOptions(payload) {
        return this.atlas.formOptions(payload);
    }
    create(payload) {
        return this.atlas.create(payload);
    }
    update(payload) {
        return this.atlas.update(payload);
    }
    submit(payload) {
        return this.atlas.submit(payload);
    }
    moderate(payload) {
        return this.atlas.moderate(payload);
    }
    remove(payload) {
        return this.atlas.remove(payload);
    }
};
exports.AtlasController = AtlasController;
__decorate([
    (0, microservices_1.MessagePattern)('health.ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AtlasController.prototype, "ping", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof atlas_service_1.ListPandalsPayload !== "undefined" && atlas_service_1.ListPandalsPayload) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.STATS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "stats", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.PUBLIC_LIST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "publicList", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.MAP_DATA),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "mapData", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.FORM_OPTIONS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "formOptions", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "update", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.SUBMIT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "submit", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.MODERATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "moderate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.ATLAS_PATTERNS.REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AtlasController.prototype, "remove", null);
exports.AtlasController = AtlasController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof atlas_service_1.AtlasService !== "undefined" && atlas_service_1.AtlasService) === "function" ? _a : Object])
], AtlasController);

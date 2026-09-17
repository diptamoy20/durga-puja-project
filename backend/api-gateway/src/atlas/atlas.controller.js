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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAtlasController = exports.PublicAtlasController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const atlas_dto_1 = require("./dto/atlas.dto");
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
    show(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.FIND_ONE, { id });
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
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.FIND_ALL, query);
    }
    stats() {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.STATS, {});
    }
    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.FIND_ONE, { id });
    }
    create(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.CREATE, {
            data: dto,
            actorId: actor.id,
        });
    }
    update(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.UPDATE, {
            id,
            data: dto,
            actorId: actor.id,
        });
    }
    remove(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.REMOVE, {
            id,
            actorId: actor.id,
        });
    }
    submit(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.SUBMIT, {
            id,
            actorId: actor.id,
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof atlas_dto_1.ListPandalsQueryDto !== "undefined" && atlas_dto_1.ListPandalsQueryDto) === "function" ? _e : Object]),
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
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pandal details' }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new pandal entry (starts as DRAFT)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof atlas_dto_1.CreatePandalDto !== "undefined" && atlas_dto_1.CreatePandalDto) === "function" ? _f : Object, typeof (_g = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a pandal entry' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_h = typeof atlas_dto_1.UpdatePandalDto !== "undefined" && atlas_dto_1.UpdatePandalDto) === "function" ? _h : Object, typeof (_j = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a pandal entry' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_k = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _k : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_PANDAL_ATLAS),
    (0, response_interceptor_1.ResponseMessage)('Pandal submitted for review'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a draft pandal for moderation' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_l = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _l : Object]),
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
    __metadata("design:paramtypes", [Number, typeof (_m = typeof atlas_dto_1.ModeratePandalDto !== "undefined" && atlas_dto_1.ModeratePandalDto) === "function" ? _m : Object, typeof (_o = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _o : Object]),
    __metadata("design:returntype", void 0)
], AdminAtlasController.prototype, "moderate", null);
exports.AdminAtlasController = AdminAtlasController = __decorate([
    (0, swagger_1.ApiTags)('Pandal Atlas (Admin)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/pandal-atlas'),
    __metadata("design:paramtypes", [typeof (_d = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _d : Object])
], AdminAtlasController);

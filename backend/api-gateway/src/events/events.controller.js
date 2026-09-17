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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminWebinarsController = exports.PublicWebinarsController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const events_dto_1 = require("./dto/events.dto");
// ============================================================================
// Public Webinars
// ============================================================================
let PublicWebinarsController = class PublicWebinarsController {
    client;
    constructor(client) {
        this.client = client;
    }
    index() {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.WEBINAR_PUBLIC_LIST, {});
    }
    replays() {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.WEBINAR_REPLAYS, {});
    }
    show(slug) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.WEBINAR_FIND_BY_SLUG, { slug });
    }
    rsvp(slug, dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.RSVP_CREATE, {
            slug,
            ...dto,
        });
    }
    pushSubscribe(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.PUSH_SUBSCRIBE, {
            subscribableType: 'GuestSubscriber',
            subscribableId: 0,
            ...dto,
        });
    }
};
exports.PublicWebinarsController = PublicWebinarsController;
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(),
    (0, response_interceptor_1.ResponseMessage)('Webinars retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Public listing of upcoming webinars' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicWebinarsController.prototype, "index", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('replays'),
    (0, response_interceptor_1.ResponseMessage)('Replays retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List completed webinars with replay URLs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicWebinarsController.prototype, "replays", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(':slug'),
    (0, response_interceptor_1.ResponseMessage)('Webinar retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single webinar by slug' }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicWebinarsController.prototype, "show", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)(':slug/rsvp'),
    (0, response_interceptor_1.ResponseMessage)('RSVP submitted successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Register for a webinar (public)',
        description: 'Creates a guest subscriber if the email is not a registered portal user.',
    }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof events_dto_1.StoreRsvpDto !== "undefined" && events_dto_1.StoreRsvpDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], PublicWebinarsController.prototype, "rsvp", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('push/subscribe'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, response_interceptor_1.ResponseMessage)('Push subscription registered'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a push subscription for webinar notifications' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof events_dto_1.PushSubscribeDto !== "undefined" && events_dto_1.PushSubscribeDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], PublicWebinarsController.prototype, "pushSubscribe", null);
exports.PublicWebinarsController = PublicWebinarsController = __decorate([
    (0, swagger_1.ApiTags)('Public Webinars'),
    (0, common_1.Controller)('webinars'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], PublicWebinarsController);
// ============================================================================
// Admin Webinar Management
// ============================================================================
let AdminWebinarsController = class AdminWebinarsController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.WEBINAR_FIND_ALL, query);
    }
    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.WEBINAR_FIND_ONE, { id });
    }
    create(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.WEBINAR_CREATE, {
            data: dto,
            actorId: actor.id,
        });
    }
    update(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.WEBINAR_UPDATE, {
            id,
            data: dto,
            actorId: actor.id,
        });
    }
    toggleStatus(id, dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.WEBINAR_TOGGLE_STATUS, {
            id,
            status: dto.status,
            actorId: actor.id,
        });
    }
    remove(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.WEBINAR_REMOVE, {
            id,
            actorId: actor.id,
        });
    }
    // RSVPs
    rsvps(id, query) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.RSVP_FIND_ALL, {
            ...query,
            webinarId: id,
        });
    }
    updateRsvpStatus(id, dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.EVENTS, shared_1.EVENTS_PATTERNS.RSVP_UPDATE_STATUS, {
            id,
            status: dto.status,
            notes: dto.notes,
        });
    }
};
exports.AdminWebinarsController = AdminWebinarsController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_WEBINARS),
    (0, response_interceptor_1.ResponseMessage)('Webinars retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all webinars with admin filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof events_dto_1.ListWebinarsQueryDto !== "undefined" && events_dto_1.ListWebinarsQueryDto) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], AdminWebinarsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_WEBINARS),
    (0, response_interceptor_1.ResponseMessage)('Webinar retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a webinar with its registrations' }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminWebinarsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_WEBINARS),
    (0, response_interceptor_1.ResponseMessage)('Webinar created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule a new webinar' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof events_dto_1.CreateWebinarDto !== "undefined" && events_dto_1.CreateWebinarDto) === "function" ? _f : Object, typeof (_g = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], AdminWebinarsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_WEBINARS),
    (0, response_interceptor_1.ResponseMessage)('Webinar updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a webinar' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_h = typeof events_dto_1.UpdateWebinarDto !== "undefined" && events_dto_1.UpdateWebinarDto) === "function" ? _h : Object, typeof (_j = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], AdminWebinarsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/toggle-status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_WEBINARS),
    (0, response_interceptor_1.ResponseMessage)('Webinar status updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Change webinar status (e.g. go live, complete, cancel)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_k = typeof events_dto_1.ToggleWebinarStatusDto !== "undefined" && events_dto_1.ToggleWebinarStatusDto) === "function" ? _k : Object, typeof (_l = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _l : Object]),
    __metadata("design:returntype", void 0)
], AdminWebinarsController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_WEBINARS),
    (0, response_interceptor_1.ResponseMessage)('Webinar deleted successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_m = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _m : Object]),
    __metadata("design:returntype", void 0)
], AdminWebinarsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/rsvps'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_WEBINAR_RSVPS),
    (0, response_interceptor_1.ResponseMessage)('RSVPs retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List RSVPs for a webinar' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_o = typeof events_dto_1.ListRsvpsQueryDto !== "undefined" && events_dto_1.ListRsvpsQueryDto) === "function" ? _o : Object]),
    __metadata("design:returntype", void 0)
], AdminWebinarsController.prototype, "rsvps", null);
__decorate([
    (0, common_1.Post)(':webinarId/rsvps/:id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_WEBINAR_RSVPS),
    (0, response_interceptor_1.ResponseMessage)('RSVP status updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an RSVP status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_p = typeof events_dto_1.UpdateRsvpStatusDto !== "undefined" && events_dto_1.UpdateRsvpStatusDto) === "function" ? _p : Object]),
    __metadata("design:returntype", void 0)
], AdminWebinarsController.prototype, "updateRsvpStatus", null);
exports.AdminWebinarsController = AdminWebinarsController = __decorate([
    (0, swagger_1.ApiTags)('Admin Webinars'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/webinars'),
    __metadata("design:paramtypes", [typeof (_d = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _d : Object])
], AdminWebinarsController);

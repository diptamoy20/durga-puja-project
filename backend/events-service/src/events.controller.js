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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const events_service_1 = require("./events.service");
let EventsController = class EventsController {
    events;
    constructor(events) {
        this.events = events;
    }
    ping() {
        return { service: 'events-service', status: 'ok' };
    }
    findAll(query) {
        return this.events.findAll(query);
    }
    publicList() {
        return this.events.publicList();
    }
    replays() {
        return this.events.replays();
    }
    findOne(payload) {
        return this.events.findOne(payload.id);
    }
    findBySlug(payload) {
        return this.events.findBySlug(payload.slug);
    }
    create(payload) {
        return this.events.create(payload);
    }
    update(payload) {
        return this.events.update(payload);
    }
    toggleStatus(payload) {
        return this.events.toggleStatus(payload);
    }
    remove(payload) {
        return this.events.remove(payload);
    }
    createRsvp(payload) {
        return this.events.createRsvp(payload);
    }
    findAllRsvps(query) {
        return this.events.findAllRsvps(query);
    }
    updateRsvpStatus(payload) {
        return this.events.updateRsvpStatus(payload);
    }
    subscribeToPush(payload) {
        return this.events.subscribeToPush(payload);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, microservices_1.MessagePattern)('health.ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], EventsController.prototype, "ping", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.WEBINAR_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof events_service_1.ListWebinarsPayload !== "undefined" && events_service_1.ListWebinarsPayload) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.WEBINAR_PUBLIC_LIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "publicList", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.WEBINAR_REPLAYS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "replays", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.WEBINAR_FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.WEBINAR_FIND_BY_SLUG),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findBySlug", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.WEBINAR_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.WEBINAR_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "update", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.WEBINAR_TOGGLE_STATUS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "toggleStatus", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.WEBINAR_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "remove", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.RSVP_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof events_service_1.RsvpData !== "undefined" && events_service_1.RsvpData) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "createRsvp", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.RSVP_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAllRsvps", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.RSVP_UPDATE_STATUS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "updateRsvpStatus", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.EVENTS_PATTERNS.PUSH_SUBSCRIBE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "subscribeToPush", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof events_service_1.EventsService !== "undefined" && events_service_1.EventsService) === "function" ? _a : Object])
], EventsController);

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
exports.NotificationController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const notification_service_1 = require("./notification.service");
let NotificationController = class NotificationController {
    notifications;
    constructor(notifications) {
        this.notifications = notifications;
    }
    ping() {
        return { service: 'notification-service', status: 'ok' };
    }
    /**
     * Request/response send, for callers that need to know the outcome.
     */
    sendEmail(payload) {
        return this.notifications.sendEmail(payload);
    }
    /**
     * Fire-and-forget variant. Other services emit this so a slow or failing
     * mail server never delays the business operation that triggered it.
     */
    handleEmailEvent(payload) {
        void this.notifications.sendEmail(payload);
    }
    findAll(query) {
        return this.notifications.findAll(query);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, microservices_1.MessagePattern)('health.ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], NotificationController.prototype, "ping", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.NOTIFICATION_PATTERNS.SEND_EMAIL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof notification_service_1.SendEmailPayload !== "undefined" && notification_service_1.SendEmailPayload) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "sendEmail", null);
__decorate([
    (0, microservices_1.EventPattern)(shared_1.NOTIFICATION_PATTERNS.SEND_EMAIL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof notification_service_1.SendEmailPayload !== "undefined" && notification_service_1.SendEmailPayload) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "handleEmailEvent", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.NOTIFICATION_PATTERNS.FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "findAll", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof notification_service_1.NotificationService !== "undefined" && notification_service_1.NotificationService) === "function" ? _a : Object])
], NotificationController);

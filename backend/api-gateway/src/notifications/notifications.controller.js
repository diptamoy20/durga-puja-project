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
exports.NotificationsController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const notifications_dto_1 = require("./dto/notifications.dto");
/**
 * Notification log administration and manual email triggers. The notification
 * service persists every send to `notification_logs`, so list/stats here are
 * audit views over records the service already writes.
 */
let NotificationsController = class NotificationsController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.NOTIFICATION, shared_1.NOTIFICATION_PATTERNS.FIND_ALL, query);
    }
    summary() {
        return this.client.send(shared_1.SERVICE_TOKENS.NOTIFICATION, shared_1.NOTIFICATION_PATTERNS.STATS, {});
    }
    sendEmail(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.NOTIFICATION, shared_1.NOTIFICATION_PATTERNS.SEND_EMAIL, {
            to: dto.to,
            template: dto.template,
            subject: dto.subject,
            data: dto.data,
            userId: dto.userId,
        });
    }
    retryFailed(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.NOTIFICATION, shared_1.NOTIFICATION_PATTERNS.RETRY_FAILED, {
            maxAttempts: dto?.maxAttempts,
        });
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_NOTIFICATIONS),
    (0, response_interceptor_1.ResponseMessage)('Notifications retrieved successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'List notification log entries',
        description: 'Every email the platform has attempted, filterable by delivery status.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof notifications_dto_1.ListNotificationsQueryDto !== "undefined" && notifications_dto_1.ListNotificationsQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_NOTIFICATIONS),
    (0, response_interceptor_1.ResponseMessage)('Notification summary retrieved successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Notification counts by status',
        description: 'Total, queued, sent, failed and retryable (failed under 3 attempts) counts for the dashboard tile.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "summary", null);
__decorate([
    (0, common_1.Post)('send-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.SEND_NOTIFICATIONS),
    (0, response_interceptor_1.ResponseMessage)('Email queued for delivery'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send an email through a known template',
        description: 'Queues delivery through the notification service (logged in dev via MAIL_DRIVER=log).',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof notifications_dto_1.SendEmailDto !== "undefined" && notifications_dto_1.SendEmailDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('retry-failed'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.SEND_NOTIFICATIONS),
    (0, response_interceptor_1.ResponseMessage)('Failed notifications requeued'),
    (0, swagger_1.ApiOperation)({
        summary: 'Retry failed email sends',
        description: 'Requeues notifications marked FAILED with fewer than 3 attempts (up to 50 per run).',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "retryFailed", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], NotificationsController);
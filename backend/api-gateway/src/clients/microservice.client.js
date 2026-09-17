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
var MicroserviceClient_1;
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicroserviceClient = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
/** Requests that hang longer than this are failed rather than left pending. */
const REQUEST_TIMEOUT_MS = 15_000;
/**
 * The single place the gateway talks to microservices.
 *
 * Centralising `send()` means timeout handling, error translation and
 * connection diagnostics are written once instead of in every controller.
 */
let MicroserviceClient = MicroserviceClient_1 = class MicroserviceClient {
    auth;
    user;
    registration;
    content;
    gallery;
    atlas;
    events;
    notification;
    logger = new common_1.Logger(MicroserviceClient_1.name);
    constructor(auth, user, registration, content, gallery, atlas, events, notification) {
        this.auth = auth;
        this.user = user;
        this.registration = registration;
        this.content = content;
        this.gallery = gallery;
        this.atlas = atlas;
        this.events = events;
        this.notification = notification;
    }
    proxyFor(service) {
        const map = {
            [shared_1.SERVICE_TOKENS.AUTH]: this.auth,
            [shared_1.SERVICE_TOKENS.USER]: this.user,
            [shared_1.SERVICE_TOKENS.REGISTRATION]: this.registration,
            [shared_1.SERVICE_TOKENS.CONTENT]: this.content,
            [shared_1.SERVICE_TOKENS.GALLERY]: this.gallery,
            [shared_1.SERVICE_TOKENS.ATLAS]: this.atlas,
            [shared_1.SERVICE_TOKENS.EVENTS]: this.events,
            [shared_1.SERVICE_TOKENS.NOTIFICATION]: this.notification,
        };
        return map[service];
    }
    /**
     * Sends a message and awaits the single response.
     *
     * A `ServiceErrorPayload` from the far side is rethrown as the matching
     * HttpException, so a 404 raised deep inside a service reaches the client as
     * a 404 rather than collapsing into a 500.
     */
    async send(service, pattern, payload) {
        try {
            return await (0, rxjs_1.firstValueFrom)(this.proxyFor(service).send(pattern, payload).pipe((0, rxjs_1.timeout)(REQUEST_TIMEOUT_MS)));
        }
        catch (error) {
            throw this.translate(error, service, pattern);
        }
    }
    /** Fire-and-forget event, used for notifications and audit trails. */
    emit(service, pattern, payload) {
        this.proxyFor(service)
            .emit(pattern, payload)
            .subscribe({
            error: (error) => this.logger.warn(`Failed to emit ${pattern} to ${service}: ${error instanceof Error ? error.message : String(error)}`),
        });
    }
    translate(error, service, pattern) {
        if ((0, shared_1.isServiceErrorPayload)(error)) {
            return new common_1.HttpException({ message: error.message, code: error.code, details: error.details }, error.statusCode);
        }
        if (error instanceof rxjs_1.TimeoutError) {
            this.logger.error(`${service} timed out handling "${pattern}"`);
            return new common_1.HttpException({
                message: 'The request timed out. Please try again.',
                code: 'SERVICE_TIMEOUT',
            }, common_1.HttpStatus.GATEWAY_TIMEOUT);
        }
        const message = error instanceof Error ? error.message : String(error);
        // ECONNREFUSED here almost always means the service process is not running.
        if (message.includes('ECONNREFUSED') || message.includes('ECONNRESET')) {
            this.logger.error(`${service} is unreachable (pattern "${pattern}"): ${message}`);
            return new common_1.ServiceUnavailableException({
                message: `The ${service
                    .toLowerCase()
                    .replace('_service', '')} service is currently unavailable.`,
                code: 'SERVICE_UNAVAILABLE',
            });
        }
        this.logger.error(`Unexpected error calling ${service} "${pattern}": ${message}`);
        return new common_1.HttpException({ message: 'An unexpected error occurred.', code: 'INTERNAL_ERROR' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
exports.MicroserviceClient = MicroserviceClient;
exports.MicroserviceClient = MicroserviceClient = MicroserviceClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(shared_1.SERVICE_TOKENS.AUTH)),
    __param(1, (0, common_1.Inject)(shared_1.SERVICE_TOKENS.USER)),
    __param(2, (0, common_1.Inject)(shared_1.SERVICE_TOKENS.REGISTRATION)),
    __param(3, (0, common_1.Inject)(shared_1.SERVICE_TOKENS.CONTENT)),
    __param(4, (0, common_1.Inject)(shared_1.SERVICE_TOKENS.GALLERY)),
    __param(5, (0, common_1.Inject)(shared_1.SERVICE_TOKENS.ATLAS)),
    __param(6, (0, common_1.Inject)(shared_1.SERVICE_TOKENS.EVENTS)),
    __param(7, (0, common_1.Inject)(shared_1.SERVICE_TOKENS.NOTIFICATION)),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object, typeof (_c = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _c : Object, typeof (_d = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _d : Object, typeof (_e = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _e : Object, typeof (_f = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _f : Object, typeof (_g = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _g : Object, typeof (_h = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _h : Object])
], MicroserviceClient);

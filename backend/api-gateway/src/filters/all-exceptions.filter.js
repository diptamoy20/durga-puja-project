"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
/**
 * The gateway's single exit point for every failure.
 *
 * Guarantees that clients always receive the platform envelope with
 * `success: false`, a stable machine-readable `code`, and never a raw database
 * error, driver message or stack trace.
 */
let AllExceptionsFilter = class AllExceptionsFilter {
    logger = new common_1.Logger('ExceptionFilter');
    isProduction = process.env.NODE_ENV === 'production';
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const error = this.normalise(exception);
        // 5xx is our bug; 4xx is the caller's. Log them at different levels so
        // real faults are not buried under routine validation noise.
        const logMessage = `${request.method} ${request.originalUrl} -> ${error.status} ${error.code}: ${error.message}`;
        if (error.status >= common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined);
        }
        else {
            this.logger.warn(logMessage);
        }
        const body = {
            success: false,
            message: error.message,
            data: null,
            error: { code: error.code, details: error.details },
            timestamp: new Date().toISOString(),
            path: request.originalUrl,
        };
        response.status(error.status).json(body);
    }
    normalise(exception) {
        // Raised by MicroserviceClient after translating a far-side failure.
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const payload = exception.getResponse();
            if (typeof payload === 'string') {
                return { status, code: this.codeFor(status), message: payload };
            }
            const shaped = payload;
            // Nest's ValidationPipe reports `message` as an array of strings.
            if (Array.isArray(shaped.message)) {
                return {
                    status,
                    code: 'VALIDATION_FAILED',
                    message: 'The submitted data failed validation.',
                    details: shaped.message,
                };
            }
            return {
                status,
                code: shaped.code ?? this.codeFor(status),
                message: shaped.message ?? shaped.error ?? 'The request could not be completed.',
                details: shaped.details,
            };
        }
        if ((0, shared_1.isServiceErrorPayload)(exception)) {
            return {
                status: exception.statusCode,
                code: exception.code,
                message: exception.message,
                details: exception.details,
            };
        }
        return {
            status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            code: 'INTERNAL_ERROR',
            // Only surface the real message outside production; never the stack.
            message: this.isProduction
                ? 'An unexpected error occurred.'
                : exception instanceof Error
                    ? exception.message
                    : String(exception),
        };
    }
    codeFor(status) {
        const codes = {
            [common_1.HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
            [common_1.HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
            [common_1.HttpStatus.FORBIDDEN]: 'FORBIDDEN',
            [common_1.HttpStatus.NOT_FOUND]: 'NOT_FOUND',
            [common_1.HttpStatus.CONFLICT]: 'CONFLICT',
            [common_1.HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_FAILED',
            [common_1.HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
            [common_1.HttpStatus.GATEWAY_TIMEOUT]: 'SERVICE_TIMEOUT',
            [common_1.HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
        };
        return codes[status] ?? (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED');
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);

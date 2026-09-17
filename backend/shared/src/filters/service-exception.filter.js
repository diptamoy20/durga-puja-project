"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const service_exception_util_1 = require("../utils/service-exception.util");
/**
 * Global filter for every microservice.
 *
 * Whatever a handler throws, this emits a plain `ServiceErrorPayload` so the
 * status code and message survive JSON serialisation over TCP. Without it,
 * Nest would send `{}` for a thrown Error and the gateway could only report a
 * generic 500.
 *
 * Register in each service's `main.ts`:
 *   app.useGlobalFilters(new ServiceExceptionFilter());
 */
let ServiceExceptionFilter = class ServiceExceptionFilter {
    logger = new common_1.Logger('ServiceException');
    catch(exception, _host) {
        return (0, rxjs_1.throwError)(() => this.toPayload(exception));
    }
    toPayload(exception) {
        if (exception instanceof service_exception_util_1.ServiceException) {
            return exception.getError();
        }
        if (exception instanceof microservices_1.RpcException) {
            const error = exception.getError();
            if ((0, service_exception_util_1.isServiceErrorPayload)(error))
                return error;
            return {
                isServiceError: true,
                statusCode: 500,
                code: 'INTERNAL_ERROR',
                message: typeof error === 'string' ? error : 'An unexpected error occurred.',
            };
        }
        // A Nest HttpException thrown inside a service (e.g. from ValidationPipe).
        if (exception instanceof common_1.HttpException) {
            const response = exception.getResponse();
            const status = exception.getStatus();
            const message = typeof response === 'string'
                ? response
                : (response.message ?? exception.message);
            return {
                isServiceError: true,
                statusCode: status,
                code: status === 422 || status === 400 ? 'VALIDATION_FAILED' : 'REQUEST_FAILED',
                message: Array.isArray(message) ? 'The submitted data failed validation.' : message,
                details: Array.isArray(message) ? message : undefined,
            };
        }
        if ((0, service_exception_util_1.isServiceErrorPayload)(exception)) {
            return exception;
        }
        // Genuinely unexpected: log the detail server-side, return none of it.
        this.logger.error(exception instanceof Error ? exception.stack ?? exception.message : String(exception));
        return {
            isServiceError: true,
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
        };
    }
};
exports.ServiceExceptionFilter = ServiceExceptionFilter;
exports.ServiceExceptionFilter = ServiceExceptionFilter = __decorate([
    (0, common_1.Catch)()
], ServiceExceptionFilter);

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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = exports.ResponseMessage = exports.RESPONSE_MESSAGE_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
exports.RESPONSE_MESSAGE_KEY = 'responseMessage';
/**
 * Sets the `message` for a successful response.
 *
 *   @ResponseMessage('User retrieved successfully')
 */
const ResponseMessage = (message) => (0, common_1.SetMetadata)(exports.RESPONSE_MESSAGE_KEY, message);
exports.ResponseMessage = ResponseMessage;
function isPaginated(value) {
    return (typeof value === 'object' &&
        value !== null &&
        Array.isArray(value.items) &&
        typeof value.pagination === 'object');
}
/**
 * Wraps every successful handler return value in the platform envelope:
 *
 *   { success: true, message, data, meta?, timestamp, path }
 *
 * Controllers therefore return plain domain objects and never build the
 * envelope themselves, which is what keeps the shape consistent across all
 * endpoints. Failures are handled by AllExceptionsFilter.
 */
let ResponseInterceptor = class ResponseInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const message = this.reflector.getAllAndOverride(exports.RESPONSE_MESSAGE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? 'Request completed successfully';
        return next.handle().pipe((0, rxjs_1.map)((payload) => {
            const base = {
                success: true,
                message,
                timestamp: new Date().toISOString(),
                path: request.originalUrl,
            };
            // Lift pagination out of the payload so `data` is just the array.
            if (isPaginated(payload)) {
                return {
                    ...base,
                    data: payload.items,
                    meta: {
                        pagination: payload.pagination,
                        ...(payload.stats ? { stats: payload.stats } : {}),
                    },
                };
            }
            return { ...base, data: payload ?? null };
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], ResponseInterceptor);

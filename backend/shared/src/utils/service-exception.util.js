"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceException = void 0;
exports.isServiceErrorPayload = isServiceErrorPayload;
const common_1 = require("@nestjs/common");
class ServiceException extends Error {
    payload;
    constructor(statusCode, code, message, details) {
        super(message);
        this.name = 'ServiceException';
        this.payload = { isServiceError: true, statusCode, code, message, details };
    }
    /** RpcException reads `getError()` to build the wire payload. */
    getError() {
        return this.payload;
    }
    static badRequest(message = 'The request was invalid.', details) {
        return new ServiceException(common_1.HttpStatus.BAD_REQUEST, 'BAD_REQUEST', message, details);
    }
    static unauthorized(message = 'Authentication failed.', details) {
        return new ServiceException(common_1.HttpStatus.UNAUTHORIZED, 'UNAUTHENTICATED', message, details);
    }
    static forbidden(message = 'You do not have permission to perform this action.', details) {
        return new ServiceException(common_1.HttpStatus.FORBIDDEN, 'FORBIDDEN', message, details);
    }
    static notFound(message = 'The requested resource was not found.', details) {
        return new ServiceException(common_1.HttpStatus.NOT_FOUND, 'NOT_FOUND', message, details);
    }
    static conflict(message = 'The request conflicts with the current state.', details) {
        return new ServiceException(common_1.HttpStatus.CONFLICT, 'CONFLICT', message, details);
    }
    static unprocessable(message = 'The request failed validation.', details) {
        return new ServiceException(common_1.HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_FAILED', message, details);
    }
    static internal(message = 'An unexpected error occurred.', details) {
        return new ServiceException(common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_ERROR', message, details);
    }
}
exports.ServiceException = ServiceException;
function isServiceErrorPayload(value) {
    return (typeof value === 'object' &&
        value !== null &&
        value.isServiceError === true &&
        typeof value.statusCode === 'number');
}

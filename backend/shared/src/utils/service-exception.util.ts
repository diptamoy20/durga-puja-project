import { HttpStatus } from '@nestjs/common';

/**
 * A failure raised inside a microservice, shaped so it survives the TCP hop.
 *
 * Nest serialises an RpcException's payload to JSON, so throwing a plain
 * `NotFoundException` inside a service would reach the gateway as an opaque
 * object and degrade into a 500. Services throw `ServiceException` instead and
 * the gateway's RpcExceptionFilter turns it back into the right HTTP status.
 */
export interface ServiceErrorPayload {
  /** Marker that lets the gateway recognise one of our own errors. */
  isServiceError: true;
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ServiceException extends Error {
  readonly payload: ServiceErrorPayload;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ServiceException';
    this.payload = { isServiceError: true, statusCode, code, message, details };
  }

  /** RpcException reads `getError()` to build the wire payload. */
  getError(): ServiceErrorPayload {
    return this.payload;
  }

  static badRequest(message = 'The request was invalid.', details?: unknown): ServiceException {
    return new ServiceException(HttpStatus.BAD_REQUEST, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentication failed.', details?: unknown): ServiceException {
    return new ServiceException(HttpStatus.UNAUTHORIZED, 'UNAUTHENTICATED', message, details);
  }

  static forbidden(
    message = 'You do not have permission to perform this action.',
    details?: unknown,
  ): ServiceException {
    return new ServiceException(HttpStatus.FORBIDDEN, 'FORBIDDEN', message, details);
  }

  static notFound(message = 'The requested resource was not found.', details?: unknown): ServiceException {
    return new ServiceException(HttpStatus.NOT_FOUND, 'NOT_FOUND', message, details);
  }

  static conflict(
    message = 'The request conflicts with the current state.',
    details?: unknown,
  ): ServiceException {
    return new ServiceException(HttpStatus.CONFLICT, 'CONFLICT', message, details);
  }

  static unprocessable(message = 'The request failed validation.', details?: unknown): ServiceException {
    return new ServiceException(HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_FAILED', message, details);
  }

  static internal(message = 'An unexpected error occurred.', details?: unknown): ServiceException {
    return new ServiceException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'INTERNAL_ERROR',
      message,
      details,
    );
  }
}

export function isServiceErrorPayload(value: unknown): value is ServiceErrorPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as ServiceErrorPayload).isServiceError === true &&
    typeof (value as ServiceErrorPayload).statusCode === 'number'
  );
}

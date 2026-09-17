import { ArgumentsHost, Catch, HttpException, Logger, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

import {
  ServiceErrorPayload,
  ServiceException,
  isServiceErrorPayload,
} from '../utils/service-exception.util';

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
@Catch()
export class ServiceExceptionFilter implements RpcExceptionFilter {
  private readonly logger = new Logger('ServiceException');

  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    return throwError(() => this.toPayload(exception));
  }

  private toPayload(exception: unknown): ServiceErrorPayload {
    if (exception instanceof ServiceException) {
      return exception.getError();
    }

    if (exception instanceof RpcException) {
      const error = exception.getError();
      if (isServiceErrorPayload(error)) return error;

      return {
        isServiceError: true,
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: typeof error === 'string' ? error : 'An unexpected error occurred.',
      };
    }

    // A Nest HttpException thrown inside a service (e.g. from ValidationPipe).
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const status = exception.getStatus();

      const message =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] }).message ?? exception.message);

      return {
        isServiceError: true,
        statusCode: status,
        code: status === 422 || status === 400 ? 'VALIDATION_FAILED' : 'REQUEST_FAILED',
        message: Array.isArray(message) ? 'The submitted data failed validation.' : message,
        details: Array.isArray(message) ? message : undefined,
      };
    }

    if (isServiceErrorPayload(exception)) {
      return exception;
    }

    // Genuinely unexpected: log the detail server-side, return none of it.
    this.logger.error(
      exception instanceof Error ? exception.stack ?? exception.message : String(exception),
    );

    return {
      isServiceError: true,
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    };
  }
}

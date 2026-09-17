import { ApiResponse, isServiceErrorPayload } from '@dpgc/shared';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface NormalisedError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

/**
 * The gateway's single exit point for every failure.
 *
 * Guarantees that clients always receive the platform envelope with
 * `success: false`, a stable machine-readable `code`, and never a raw database
 * error, driver message or stack trace.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const error = this.normalise(exception);

    // 5xx is our bug; 4xx is the caller's. Log them at different levels so
    // real faults are not buried under routine validation noise.
    const logMessage = `${request.method} ${request.originalUrl} -> ${error.status} ${error.code}: ${error.message}`;

    if (error.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(logMessage);
    }

    const body: ApiResponse<null> = {
      success: false,
      message: error.message,
      data: null,
      error: { code: error.code, details: error.details },
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };

    response.status(error.status).json(body);
  }

  private normalise(exception: unknown): NormalisedError {
    // Raised by MicroserviceClient after translating a far-side failure.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return { status, code: this.codeFor(status), message: payload };
      }

      const shaped = payload as {
        message?: string | string[];
        code?: string;
        details?: unknown;
        error?: string;
      };

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

    if (isServiceErrorPayload(exception)) {
      return {
        status: exception.statusCode,
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      // Only surface the real message outside production; never the stack.
      message: this.isProduction
        ? 'An unexpected error occurred.'
        : exception instanceof Error
          ? exception.message
          : String(exception),
    };
  }

  private codeFor(status: number): string {
    const codes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_FAILED',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
      [HttpStatus.GATEWAY_TIMEOUT]: 'SERVICE_TIMEOUT',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    };

    return codes[status] ?? (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED');
  }
}

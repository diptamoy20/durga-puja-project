import { ApiResponse } from '@dpgc/shared';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { map, Observable } from 'rxjs';

export const RESPONSE_MESSAGE_KEY = 'responseMessage';

/**
 * Sets the `message` for a successful response.
 *
 *   @ResponseMessage('User retrieved successfully')
 */
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE_KEY, message);

/** A service list result, which is unwrapped into `data` + `meta`. */
interface MaybePaginated {
  items: unknown[];
  pagination: Record<string, unknown>;
}

function isPaginated(value: unknown): value is MaybePaginated {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as MaybePaginated).items) &&
    typeof (value as MaybePaginated).pagination === 'object'
  );
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
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<unknown>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Request completed successfully';

    return next.handle().pipe(
      map((payload): ApiResponse<unknown> => {
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
            meta: { pagination: payload.pagination },
          };
        }

        return { ...base, data: payload ?? null };
      }),
    );
  }
}

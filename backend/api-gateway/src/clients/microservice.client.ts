import { SERVICE_TOKENS, isServiceErrorPayload } from '@dpgc/shared';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';

type ServiceKey = (typeof SERVICE_TOKENS)[keyof typeof SERVICE_TOKENS];

/** Requests that hang longer than this are failed rather than left pending. */
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * The single place the gateway talks to microservices.
 *
 * Centralising `send()` means timeout handling, error translation and
 * connection diagnostics are written once instead of in every controller.
 */
@Injectable()
export class MicroserviceClient {
  private readonly logger = new Logger(MicroserviceClient.name);

  constructor(
    @Inject(SERVICE_TOKENS.AUTH) private readonly auth: ClientProxy,
    @Inject(SERVICE_TOKENS.USER) private readonly user: ClientProxy,
    @Inject(SERVICE_TOKENS.REGISTRATION) private readonly registration: ClientProxy,
    @Inject(SERVICE_TOKENS.CONTENT) private readonly content: ClientProxy,
    @Inject(SERVICE_TOKENS.GALLERY) private readonly gallery: ClientProxy,
    @Inject(SERVICE_TOKENS.ATLAS) private readonly atlas: ClientProxy,
    @Inject(SERVICE_TOKENS.EVENTS) private readonly events: ClientProxy,
    @Inject(SERVICE_TOKENS.NOTIFICATION) private readonly notification: ClientProxy,
  ) {}

  private proxyFor(service: ServiceKey): ClientProxy {
    const map: Record<ServiceKey, ClientProxy> = {
      [SERVICE_TOKENS.AUTH]: this.auth,
      [SERVICE_TOKENS.USER]: this.user,
      [SERVICE_TOKENS.REGISTRATION]: this.registration,
      [SERVICE_TOKENS.CONTENT]: this.content,
      [SERVICE_TOKENS.GALLERY]: this.gallery,
      [SERVICE_TOKENS.ATLAS]: this.atlas,
      [SERVICE_TOKENS.EVENTS]: this.events,
      [SERVICE_TOKENS.NOTIFICATION]: this.notification,
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
  async send<TResult, TPayload = unknown>(
    service: ServiceKey,
    pattern: string,
    payload: TPayload,
  ): Promise<TResult> {
    try {
      return await firstValueFrom(
        this.proxyFor(service).send<TResult, TPayload>(pattern, payload).pipe(
          timeout(REQUEST_TIMEOUT_MS),
        ),
      );
    } catch (error) {
      throw this.translate(error, service, pattern);
    }
  }

  /** Fire-and-forget event, used for notifications and audit trails. */
  emit<TPayload = unknown>(service: ServiceKey, pattern: string, payload: TPayload): void {
    this.proxyFor(service)
      .emit(pattern, payload)
      .subscribe({
        error: (error: unknown) =>
          this.logger.warn(
            `Failed to emit ${pattern} to ${service}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
      });
  }

  private translate(error: unknown, service: ServiceKey, pattern: string): Error {
    if (isServiceErrorPayload(error)) {
      return new HttpException(
        { message: error.message, code: error.code, details: error.details },
        error.statusCode,
      );
    }

    if (error instanceof TimeoutError) {
      this.logger.error(`${service} timed out handling "${pattern}"`);

      return new HttpException(
        {
          message: 'The request timed out. Please try again.',
          code: 'SERVICE_TIMEOUT',
        },
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    const message = error instanceof Error ? error.message : String(error);

    // ECONNREFUSED here almost always means the service process is not running.
    if (message.includes('ECONNREFUSED') || message.includes('ECONNRESET')) {
      this.logger.error(`${service} is unreachable (pattern "${pattern}"): ${message}`);

      return new ServiceUnavailableException({
        message: `The ${service
          .toLowerCase()
          .replace('_service', '')} service is currently unavailable.`,
        code: 'SERVICE_UNAVAILABLE',
      });
    }

    this.logger.error(`Unexpected error calling ${service} "${pattern}": ${message}`);

    return new HttpException(
      { message: 'An unexpected error occurred.', code: 'INTERNAL_ERROR' },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

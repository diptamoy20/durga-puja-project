import { AuthenticatedUser, IS_PUBLIC_KEY, JwtPayload } from '@dpgc/shared';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Applied globally, so every route is protected unless it carries @Public().
 * Access is therefore closed by default and a forgotten guard cannot silently
 * expose an endpoint.
 *
 * Verification happens here in the gateway using the shared secret rather than
 * by calling the auth service, which keeps one TCP round trip off every
 * authenticated request. The claims themselves carry roles and permissions.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (isPublic) {
      // Public routes still populate `req.user` when a valid token is present,
      // so handlers can show extra detail to signed-in callers.
      if (token) {
        try {
          request.user = this.toPrincipal(await this.verify(token));
        } catch {
          // An invalid token on a public route is treated as anonymous.
        }
      }

      return true;
    }

    if (!token) {
      throw new UnauthorizedException({
        message: 'A bearer access token is required.',
        code: 'TOKEN_MISSING',
      });
    }

    request.user = this.toPrincipal(await this.verify(token));

    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) return null;

    const [scheme, token] = header.split(' ');
    if (!/^Bearer$/i.test(scheme) || !token) return null;

    return token.trim();
  }

  private async verify(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('gateway.jwt.secret'),
        issuer: this.config.getOrThrow<string>('gateway.jwt.issuer'),
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException({
          message: 'A refresh token cannot be used to authenticate a request.',
          code: 'TOKEN_WRONG_TYPE',
        });
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;

      const expired = error instanceof Error && error.name === 'TokenExpiredError';

      throw new UnauthorizedException({
        message: expired
          ? 'Your session has expired. Please sign in again.'
          : 'The provided token is invalid.',
        code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      });
    }
  }

  private toPrincipal(payload: JwtPayload): AuthenticatedUser {
    return {
      id: Number(payload.sub),
      email: payload.email,
      name: payload.name,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
      isSuperAdmin: Boolean(payload.isSuperAdmin),
      committeeId: payload.committeeId ?? null,
    };
  }
}

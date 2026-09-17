import { AuthenticatedUser, PERMISSIONS_KEY } from '@dpgc/shared';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

/**
 * Enforces @RequirePermissions(). A caller passes when they hold ANY of the
 * listed permission keys; Super Admin always passes, mirroring the
 * `Gate::before` short-circuit in the Laravel AppServiceProvider.
 *
 * Runs after JwtAuthGuard, so `req.user` is already populated. Routes without
 * the decorator are ignored, which lets this be registered globally.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest<Request>().user as
      | AuthenticatedUser
      | undefined;

    if (!user) {
      throw new UnauthorizedException({
        message: 'Authentication is required.',
        code: 'UNAUTHENTICATED',
      });
    }

    if (user.isSuperAdmin) return true;

    if (required.some((key) => user.permissions.includes(key))) return true;

    throw new ForbiddenException({
      message: 'You do not have permission to perform this action.',
      code: 'FORBIDDEN',
      details: { requiredAnyOf: required },
    });
  }
}

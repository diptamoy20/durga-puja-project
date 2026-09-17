import { AuthenticatedUser, ROLES_KEY } from '@dpgc/shared';
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
 * Enforces @Roles(). A caller passes when they hold ANY of the listed roles;
 * Super Admin always passes.
 *
 * Prefer @RequirePermissions() for new endpoints: permission checks survive
 * roles being renamed or reorganised, whereas role checks do not. This guard
 * exists for the cases where the old application gated on a role directly
 * (notably Committee Member).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
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

    if (required.some((role) => user.roles.includes(role))) return true;

    throw new ForbiddenException({
      message: 'Your role does not allow this action.',
      code: 'FORBIDDEN',
      details: { requiredAnyOf: required },
    });
  }
}

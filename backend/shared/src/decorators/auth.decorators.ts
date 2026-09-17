import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

/**
 * Opts a route out of JwtAuthGuard. The guard is applied globally, so access
 * is closed by default and every public endpoint has to say so explicitly.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Requires ANY of the named roles. Super Admin always passes.
 *
 *   @Roles(ROLES.PORTAL_ADMINISTRATOR, ROLES.COMMITTEE_MANAGER)
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Requires ANY of the given permission keys. Super Admin always passes.
 * Prefer this over @Roles: it survives roles being reorganised.
 *
 *   @RequirePermissions(PERMISSIONS.VIEW_USERS)
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Injects the authenticated principal, or one of its fields.
 *
 *   findAll(@CurrentUser() user: AuthenticatedUser)
 *   findMine(@CurrentUser('id') userId: number)
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) return undefined;
    return field ? user[field] : user;
  },
);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = exports.RequirePermissions = exports.Roles = exports.Public = exports.PERMISSIONS_KEY = exports.ROLES_KEY = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
exports.ROLES_KEY = 'roles';
exports.PERMISSIONS_KEY = 'permissions';
/**
 * Opts a route out of JwtAuthGuard. The guard is applied globally, so access
 * is closed by default and every public endpoint has to say so explicitly.
 */
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
/**
 * Requires ANY of the named roles. Super Admin always passes.
 *
 *   @Roles(ROLES.PORTAL_ADMINISTRATOR, ROLES.COMMITTEE_MANAGER)
 */
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
/**
 * Requires ANY of the given permission keys. Super Admin always passes.
 * Prefer this over @Roles: it survives roles being reorganised.
 *
 *   @RequirePermissions(PERMISSIONS.VIEW_USERS)
 */
const RequirePermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
/**
 * Injects the authenticated principal, or one of its fields.
 *
 *   findAll(@CurrentUser() user: AuthenticatedUser)
 *   findMine(@CurrentUser('id') userId: number)
 */
exports.CurrentUser = (0, common_1.createParamDecorator)((field, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user)
        return undefined;
    return field ? user[field] : user;
});

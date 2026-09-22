import { ROUTES } from '@/constants/routes';

export interface UserMgmtBreadcrumb {
  label: string;
  to?: string;
}

/** Shared breadcrumb roots for the User Management section. */
export const USER_MGMT_CRUMBS = {
  dashboard: { label: 'Dashboard', to: ROUTES.DASHBOARD } satisfies UserMgmtBreadcrumb,
  users: { label: 'Users', to: ROUTES.USERS } satisfies UserMgmtBreadcrumb,
  roles: { label: 'Roles', to: ROUTES.ROLES } satisfies UserMgmtBreadcrumb,
  permissions: { label: 'Permissions', to: ROUTES.PERMISSIONS } satisfies UserMgmtBreadcrumb,
  permissionMatrix: { label: 'Permission Matrix', to: ROUTES.PERMISSION_MATRIX } satisfies UserMgmtBreadcrumb,
  auditLogs: { label: 'User Activity Log', to: ROUTES.AUDIT_LOGS } satisfies UserMgmtBreadcrumb,
} as const;

/** Builds `Dashboard / …` trails for User Management pages. */
export function userMgmtBreadcrumbs(...trail: UserMgmtBreadcrumb[]): UserMgmtBreadcrumb[] {
  return [USER_MGMT_CRUMBS.dashboard, ...trail];
}

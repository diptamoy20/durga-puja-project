/**
 * The platform's complete permission catalogue and role -> permission mapping,
 * ported from the Laravel `RolePermissionSeeder`.
 *
 * This is the single source of truth: the Prisma seed inserts from it, guards
 * compare against it, and `@RequirePermissions()` call sites reference it, so a
 * permission key is never spelled out as a bare string. A typo in an
 * authorisation check fails open, which is the dangerous direction.
 */
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',

  // User management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  RESET_USER_PASSWORD: 'reset_user_password',
  EXPORT_USERS: 'export_users',
  ASSIGN_USER_ROLES: 'assign_user_roles',
  VIEW_AUDIT_LOGS: 'view_audit_logs',

  // Role & permission management
  VIEW_ROLES: 'view_roles',
  CREATE_ROLES: 'create_roles',
  EDIT_ROLES: 'edit_roles',
  DELETE_ROLES: 'delete_roles',
  MANAGE_ROLE_PERMISSIONS: 'manage_role_permissions',
  VIEW_PERMISSIONS: 'view_permissions',
  CREATE_PERMISSIONS: 'create_permissions',
  EDIT_PERMISSIONS: 'edit_permissions',
  DELETE_PERMISSIONS: 'delete_permissions',

  // Master data / taxonomy
  VIEW_CATEGORIES: 'view_categories',
  MANAGE_CATEGORIES: 'manage_categories',
  VIEW_DEPARTMENTS: 'view_departments',
  MANAGE_DEPARTMENTS: 'manage_departments',

  // Diaspora
  VIEW_DIASPORA: 'view_diaspora',
  VERIFY_DIASPORA: 'verify_diaspora',
  REJECT_DIASPORA: 'reject_diaspora',
  EXPORT_DIASPORA: 'export_diaspora',

  // Puja committees
  VIEW_COMMITTEES: 'view_committees',
  EDIT_COMMITTEES: 'edit_committees',
  APPROVE_COMMITTEES: 'approve_committees',
  REJECT_COMMITTEES: 'reject_committees',
  DELETE_COMMITTEES: 'delete_committees',
  EXPORT_COMMITTEES: 'export_committees',
  CREATE_COMMITTEE_PORTAL_ACCOUNT: 'create_committee_portal_account',
  VIEW_COMMITTEE_DOCUMENTS: 'view_committee_documents',

  // Pandal atlas
  VIEW_PANDAL_ATLAS: 'view_pandal_atlas',
  CREATE_PANDAL_ATLAS: 'create_pandal_atlas',
  EDIT_PANDAL_ATLAS: 'edit_pandal_atlas',
  DELETE_PANDAL_ATLAS: 'delete_pandal_atlas',
  MODERATE_PANDAL_ATLAS: 'moderate_pandal_atlas',

  // Gallery & albums
  VIEW_GALLERY: 'view_gallery',
  UPLOAD_MEDIA: 'upload_media',
  EDIT_MEDIA: 'edit_media',
  DELETE_MEDIA: 'delete_media',
  MODERATE_MEDIA: 'moderate_media',
  MANAGE_MEDIA: 'manage_media',
  VIEW_ALBUMS: 'view_albums',
  MANAGE_ALBUMS: 'manage_albums',

  // Content / articles
  VIEW_ARTICLES: 'view_articles',
  CREATE_ARTICLES: 'create_articles',
  EDIT_ARTICLES: 'edit_articles',
  DELETE_ARTICLES: 'delete_articles',
  REVIEW_ARTICLES: 'review_articles',
  APPROVE_ARTICLES: 'approve_articles',
  PUBLISH_ARTICLES: 'publish_articles',

  // Webinars / events
  VIEW_WEBINARS: 'view_webinars',
  CREATE_WEBINARS: 'create_webinars',
  EDIT_WEBINARS: 'edit_webinars',
  DELETE_WEBINARS: 'delete_webinars',
  MANAGE_WEBINAR_RSVPS: 'manage_webinar_rsvps',

  // Settings
  MANAGE_SETTINGS: 'manage_settings',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface PermissionDefinition {
  module: string;
  permissionName: string;
  permissionKey: PermissionKey;
}

/** Human-readable definitions used to populate the `permissions` table. */
export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { module: 'Dashboard', permissionName: 'View Dashboard', permissionKey: PERMISSIONS.VIEW_DASHBOARD },
  { module: 'Dashboard', permissionName: 'View Reports', permissionKey: PERMISSIONS.VIEW_REPORTS },
  { module: 'Dashboard', permissionName: 'Export Reports', permissionKey: PERMISSIONS.EXPORT_REPORTS },

  { module: 'User Management', permissionName: 'View Users', permissionKey: PERMISSIONS.VIEW_USERS },
  { module: 'User Management', permissionName: 'Create Users', permissionKey: PERMISSIONS.CREATE_USERS },
  { module: 'User Management', permissionName: 'Edit Users', permissionKey: PERMISSIONS.EDIT_USERS },
  { module: 'User Management', permissionName: 'Delete Users', permissionKey: PERMISSIONS.DELETE_USERS },
  { module: 'User Management', permissionName: 'Reset User Password', permissionKey: PERMISSIONS.RESET_USER_PASSWORD },
  { module: 'User Management', permissionName: 'Export Users', permissionKey: PERMISSIONS.EXPORT_USERS },
  { module: 'User Management', permissionName: 'Assign User Roles', permissionKey: PERMISSIONS.ASSIGN_USER_ROLES },
  { module: 'User Management', permissionName: 'View Audit Logs', permissionKey: PERMISSIONS.VIEW_AUDIT_LOGS },

  { module: 'Role Management', permissionName: 'View Roles', permissionKey: PERMISSIONS.VIEW_ROLES },
  { module: 'Role Management', permissionName: 'Create Roles', permissionKey: PERMISSIONS.CREATE_ROLES },
  { module: 'Role Management', permissionName: 'Edit Roles', permissionKey: PERMISSIONS.EDIT_ROLES },
  { module: 'Role Management', permissionName: 'Delete Roles', permissionKey: PERMISSIONS.DELETE_ROLES },
  { module: 'Role Management', permissionName: 'Manage Role Permissions', permissionKey: PERMISSIONS.MANAGE_ROLE_PERMISSIONS },
  { module: 'Role Management', permissionName: 'View Permissions', permissionKey: PERMISSIONS.VIEW_PERMISSIONS },
  { module: 'Role Management', permissionName: 'Create Permissions', permissionKey: PERMISSIONS.CREATE_PERMISSIONS },
  { module: 'Role Management', permissionName: 'Edit Permissions', permissionKey: PERMISSIONS.EDIT_PERMISSIONS },
  { module: 'Role Management', permissionName: 'Delete Permissions', permissionKey: PERMISSIONS.DELETE_PERMISSIONS },

  { module: 'Master Management', permissionName: 'View Categories', permissionKey: PERMISSIONS.VIEW_CATEGORIES },
  { module: 'Master Management', permissionName: 'Manage Categories', permissionKey: PERMISSIONS.MANAGE_CATEGORIES },
  { module: 'Master Management', permissionName: 'View Departments', permissionKey: PERMISSIONS.VIEW_DEPARTMENTS },
  { module: 'Master Management', permissionName: 'Manage Departments', permissionKey: PERMISSIONS.MANAGE_DEPARTMENTS },

  { module: 'Diaspora Management', permissionName: 'View Diaspora Registrations', permissionKey: PERMISSIONS.VIEW_DIASPORA },
  { module: 'Diaspora Management', permissionName: 'Verify Diaspora Registration', permissionKey: PERMISSIONS.VERIFY_DIASPORA },
  { module: 'Diaspora Management', permissionName: 'Reject Diaspora Registration', permissionKey: PERMISSIONS.REJECT_DIASPORA },
  { module: 'Diaspora Management', permissionName: 'Export Diaspora Registrations', permissionKey: PERMISSIONS.EXPORT_DIASPORA },

  { module: 'Committee Management', permissionName: 'View Committees', permissionKey: PERMISSIONS.VIEW_COMMITTEES },
  { module: 'Committee Management', permissionName: 'Edit Committees', permissionKey: PERMISSIONS.EDIT_COMMITTEES },
  { module: 'Committee Management', permissionName: 'Approve Committees', permissionKey: PERMISSIONS.APPROVE_COMMITTEES },
  { module: 'Committee Management', permissionName: 'Reject Committees', permissionKey: PERMISSIONS.REJECT_COMMITTEES },
  { module: 'Committee Management', permissionName: 'Delete Committees', permissionKey: PERMISSIONS.DELETE_COMMITTEES },
  { module: 'Committee Management', permissionName: 'Export Committees', permissionKey: PERMISSIONS.EXPORT_COMMITTEES },
  { module: 'Committee Management', permissionName: 'Create Portal Account', permissionKey: PERMISSIONS.CREATE_COMMITTEE_PORTAL_ACCOUNT },
  { module: 'Committee Management', permissionName: 'View Committee Documents', permissionKey: PERMISSIONS.VIEW_COMMITTEE_DOCUMENTS },

  { module: 'Pandal Atlas', permissionName: 'View Pandal Atlas', permissionKey: PERMISSIONS.VIEW_PANDAL_ATLAS },
  { module: 'Pandal Atlas', permissionName: 'Create Pandal Entry', permissionKey: PERMISSIONS.CREATE_PANDAL_ATLAS },
  { module: 'Pandal Atlas', permissionName: 'Edit Pandal Entry', permissionKey: PERMISSIONS.EDIT_PANDAL_ATLAS },
  { module: 'Pandal Atlas', permissionName: 'Delete Pandal Entry', permissionKey: PERMISSIONS.DELETE_PANDAL_ATLAS },
  { module: 'Pandal Atlas', permissionName: 'Moderate Pandal Entry', permissionKey: PERMISSIONS.MODERATE_PANDAL_ATLAS },

  { module: 'Media Gallery', permissionName: 'View Gallery', permissionKey: PERMISSIONS.VIEW_GALLERY },
  { module: 'Media Gallery', permissionName: 'Upload Media', permissionKey: PERMISSIONS.UPLOAD_MEDIA },
  { module: 'Media Gallery', permissionName: 'Edit Media', permissionKey: PERMISSIONS.EDIT_MEDIA },
  { module: 'Media Gallery', permissionName: 'Delete Media', permissionKey: PERMISSIONS.DELETE_MEDIA },
  { module: 'Media Gallery', permissionName: 'Moderate Media', permissionKey: PERMISSIONS.MODERATE_MEDIA },
  { module: 'Media Gallery', permissionName: 'Manage Media Library', permissionKey: PERMISSIONS.MANAGE_MEDIA },
  { module: 'Media Gallery', permissionName: 'View Albums', permissionKey: PERMISSIONS.VIEW_ALBUMS },
  { module: 'Media Gallery', permissionName: 'Manage Albums', permissionKey: PERMISSIONS.MANAGE_ALBUMS },

  { module: 'Content Management', permissionName: 'View Articles', permissionKey: PERMISSIONS.VIEW_ARTICLES },
  { module: 'Content Management', permissionName: 'Create Articles', permissionKey: PERMISSIONS.CREATE_ARTICLES },
  { module: 'Content Management', permissionName: 'Edit Articles', permissionKey: PERMISSIONS.EDIT_ARTICLES },
  { module: 'Content Management', permissionName: 'Delete Articles', permissionKey: PERMISSIONS.DELETE_ARTICLES },
  { module: 'Content Management', permissionName: 'Review Articles', permissionKey: PERMISSIONS.REVIEW_ARTICLES },
  { module: 'Content Management', permissionName: 'Approve Articles', permissionKey: PERMISSIONS.APPROVE_ARTICLES },
  { module: 'Content Management', permissionName: 'Publish Articles', permissionKey: PERMISSIONS.PUBLISH_ARTICLES },

  { module: 'Webinars', permissionName: 'View Webinars', permissionKey: PERMISSIONS.VIEW_WEBINARS },
  { module: 'Webinars', permissionName: 'Create Webinars', permissionKey: PERMISSIONS.CREATE_WEBINARS },
  { module: 'Webinars', permissionName: 'Edit Webinars', permissionKey: PERMISSIONS.EDIT_WEBINARS },
  { module: 'Webinars', permissionName: 'Delete Webinars', permissionKey: PERMISSIONS.DELETE_WEBINARS },
  { module: 'Webinars', permissionName: 'Manage Webinar RSVPs', permissionKey: PERMISSIONS.MANAGE_WEBINAR_RSVPS },

  { module: 'Settings', permissionName: 'Manage Settings', permissionKey: PERMISSIONS.MANAGE_SETTINGS },
];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_DEFINITIONS.map(
  (definition) => definition.permissionKey,
);

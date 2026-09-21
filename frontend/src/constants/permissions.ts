/**
 * Permission keys, kept in step with
 * `backend/shared/src/constants/permissions.ts`.
 *
 * The UI gates on these keys rather than on role names, so reorganising roles
 * on the server does not require a frontend change. Roles are never hard-coded
 * into conditional rendering.
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

  // Podcasts
  VIEW_PODCASTS: 'view_podcasts',
  CREATE_PODCASTS: 'create_podcasts',
  EDIT_PODCASTS: 'edit_podcasts',
  DELETE_PODCASTS: 'delete_podcasts',

  // Associations
  VIEW_ASSOCIATIONS: 'view_associations',
  EDIT_ASSOCIATIONS: 'edit_associations',
  APPROVE_ASSOCIATIONS: 'approve_associations',
  REJECT_ASSOCIATIONS: 'reject_associations',
  DELETE_ASSOCIATIONS: 'delete_associations',
  EXPORT_ASSOCIATIONS: 'export_associations',

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

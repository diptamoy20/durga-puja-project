import { ALL_PERMISSION_KEYS, PERMISSIONS, PermissionKey } from './permissions';

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  PORTAL_ADMINISTRATOR: 'Portal Administrator',
  CONTENT_MANAGER: 'Content Manager',
  COMMITTEE_MANAGER: 'Committee Manager',
  DIASPORA_MANAGER: 'Diaspora Manager',
  MEDIA_MANAGER: 'Media Manager',
  EVENT_MANAGER: 'Event Manager',
  AUTHORIZED_DATA_PROVIDER: 'Authorized Data Provider',
  COMMITTEE_MEMBER: 'Committee Member',
  TOURISM_OFFICER: 'Tourism Officer',
  DISTRICT_OFFICER: 'District Officer',
  REPORT_VIEWER: 'Report Viewer',
  GUEST_USER: 'Guest User',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export interface RoleDefinition {
  name: RoleName;
  slug: string;
  description: string;
  isSystem?: boolean;
  /** `'*'` grants every permission — only Super Admin. */
  permissions: PermissionKey[] | '*';
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    name: ROLES.SUPER_ADMIN,
    slug: 'super-admin',
    description: 'Unrestricted access to every module and setting.',
    isSystem: true,
    permissions: '*',
  },
  {
    name: ROLES.PORTAL_ADMINISTRATOR,
    slug: 'portal-administrator',
    description: 'Day-to-day administration of users, committees and content.',
    isSystem: true,
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.EXPORT_REPORTS,
      PERMISSIONS.VIEW_USERS, PERMISSIONS.CREATE_USERS, PERMISSIONS.EDIT_USERS,
      PERMISSIONS.DELETE_USERS, PERMISSIONS.RESET_USER_PASSWORD, PERMISSIONS.EXPORT_USERS,
      PERMISSIONS.ASSIGN_USER_ROLES, PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.VIEW_ROLES, PERMISSIONS.VIEW_PERMISSIONS,
      PERMISSIONS.VIEW_CATEGORIES, PERMISSIONS.MANAGE_CATEGORIES,
      PERMISSIONS.VIEW_DEPARTMENTS, PERMISSIONS.MANAGE_DEPARTMENTS,
      PERMISSIONS.VIEW_DIASPORA, PERMISSIONS.VERIFY_DIASPORA, PERMISSIONS.REJECT_DIASPORA,
      PERMISSIONS.EXPORT_DIASPORA,
      PERMISSIONS.VIEW_COMMITTEES, PERMISSIONS.EDIT_COMMITTEES, PERMISSIONS.APPROVE_COMMITTEES,
      PERMISSIONS.REJECT_COMMITTEES, PERMISSIONS.EXPORT_COMMITTEES,
      PERMISSIONS.CREATE_COMMITTEE_PORTAL_ACCOUNT, PERMISSIONS.VIEW_COMMITTEE_DOCUMENTS,
      PERMISSIONS.VIEW_PANDAL_ATLAS, PERMISSIONS.MODERATE_PANDAL_ATLAS,
      PERMISSIONS.VIEW_GALLERY, PERMISSIONS.MODERATE_MEDIA, PERMISSIONS.MANAGE_MEDIA,
      PERMISSIONS.VIEW_ALBUMS, PERMISSIONS.MANAGE_ALBUMS,
      PERMISSIONS.VIEW_ARTICLES, PERMISSIONS.REVIEW_ARTICLES, PERMISSIONS.APPROVE_ARTICLES,
      PERMISSIONS.PUBLISH_ARTICLES,
      PERMISSIONS.VIEW_WEBINARS, PERMISSIONS.CREATE_WEBINARS, PERMISSIONS.EDIT_WEBINARS,
      PERMISSIONS.MANAGE_WEBINAR_RSVPS,
      PERMISSIONS.MANAGE_SETTINGS,
    ],
  },
  {
    name: ROLES.CONTENT_MANAGER,
    slug: 'content-manager',
    description: 'Authors, reviews and publishes articles and news.',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_CATEGORIES,
      PERMISSIONS.VIEW_ARTICLES, PERMISSIONS.CREATE_ARTICLES, PERMISSIONS.EDIT_ARTICLES,
      PERMISSIONS.DELETE_ARTICLES, PERMISSIONS.REVIEW_ARTICLES, PERMISSIONS.APPROVE_ARTICLES,
      PERMISSIONS.PUBLISH_ARTICLES,
      PERMISSIONS.MANAGE_MEDIA, PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.VIEW_GALLERY,
    ],
  },
  {
    name: ROLES.COMMITTEE_MANAGER,
    slug: 'committee-manager',
    description: 'Reviews and approves puja committee applications.',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.VIEW_COMMITTEES, PERMISSIONS.EDIT_COMMITTEES, PERMISSIONS.APPROVE_COMMITTEES,
      PERMISSIONS.REJECT_COMMITTEES, PERMISSIONS.EXPORT_COMMITTEES,
      PERMISSIONS.CREATE_COMMITTEE_PORTAL_ACCOUNT, PERMISSIONS.VIEW_COMMITTEE_DOCUMENTS,
      PERMISSIONS.VIEW_PANDAL_ATLAS, PERMISSIONS.MODERATE_PANDAL_ATLAS,
    ],
  },
  {
    name: ROLES.DIASPORA_MANAGER,
    slug: 'diaspora-manager',
    description: 'Verifies diaspora registrations and provisions their accounts.',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.VIEW_DIASPORA, PERMISSIONS.VERIFY_DIASPORA, PERMISSIONS.REJECT_DIASPORA,
      PERMISSIONS.EXPORT_DIASPORA,
    ],
  },
  {
    name: ROLES.MEDIA_MANAGER,
    slug: 'media-manager',
    description: 'Moderates the committee media gallery and curates albums.',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_GALLERY, PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.EDIT_MEDIA,
      PERMISSIONS.DELETE_MEDIA, PERMISSIONS.MODERATE_MEDIA, PERMISSIONS.MANAGE_MEDIA,
      PERMISSIONS.VIEW_ALBUMS, PERMISSIONS.MANAGE_ALBUMS, PERMISSIONS.VIEW_CATEGORIES,
    ],
  },
  {
    name: ROLES.EVENT_MANAGER,
    slug: 'event-manager',
    description: 'Schedules webinars and manages RSVPs.',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_WEBINARS, PERMISSIONS.CREATE_WEBINARS, PERMISSIONS.EDIT_WEBINARS,
      PERMISSIONS.DELETE_WEBINARS, PERMISSIONS.MANAGE_WEBINAR_RSVPS,
    ],
  },
  {
    name: ROLES.AUTHORIZED_DATA_PROVIDER,
    slug: 'authorized-data-provider',
    description: 'Submits pandal atlas and gallery data for moderation.',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_PANDAL_ATLAS, PERMISSIONS.CREATE_PANDAL_ATLAS, PERMISSIONS.EDIT_PANDAL_ATLAS,
      PERMISSIONS.VIEW_GALLERY, PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.EDIT_MEDIA,
      PERMISSIONS.VIEW_ALBUMS, PERMISSIONS.MANAGE_ALBUMS,
    ],
  },
  {
    name: ROLES.COMMITTEE_MEMBER,
    slug: 'committee-member',
    description: 'Committee portal account: manages only its own media and pandal entries.',
    isSystem: true,
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_GALLERY, PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.EDIT_MEDIA,
      PERMISSIONS.VIEW_ALBUMS, PERMISSIONS.MANAGE_ALBUMS,
      PERMISSIONS.VIEW_PANDAL_ATLAS, PERMISSIONS.CREATE_PANDAL_ATLAS, PERMISSIONS.EDIT_PANDAL_ATLAS,
    ],
  },
  {
    name: ROLES.TOURISM_OFFICER,
    slug: 'tourism-officer',
    description: 'Read-only oversight across committees, atlas and gallery.',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.EXPORT_REPORTS,
      PERMISSIONS.VIEW_COMMITTEES, PERMISSIONS.VIEW_PANDAL_ATLAS, PERMISSIONS.VIEW_GALLERY,
      PERMISSIONS.VIEW_ARTICLES, PERMISSIONS.VIEW_WEBINARS,
    ],
  },
  {
    name: ROLES.DISTRICT_OFFICER,
    slug: 'district-officer',
    description: 'District-level review of committees and pandal entries.',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.VIEW_COMMITTEES, PERMISSIONS.VIEW_COMMITTEE_DOCUMENTS,
      PERMISSIONS.VIEW_PANDAL_ATLAS, PERMISSIONS.MODERATE_PANDAL_ATLAS,
    ],
  },
  {
    name: ROLES.REPORT_VIEWER,
    slug: 'report-viewer',
    description: 'Access to dashboards and report exports only.',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.EXPORT_REPORTS,
    ],
  },
  {
    name: ROLES.GUEST_USER,
    slug: 'guest-user',
    description: 'Minimal authenticated access to public-facing modules.',
    permissions: [
      PERMISSIONS.VIEW_GALLERY, PERMISSIONS.VIEW_ARTICLES, PERMISSIONS.VIEW_WEBINARS,
      PERMISSIONS.VIEW_PANDAL_ATLAS,
    ],
  },
];

/** Resolves a role's permission list, expanding the `'*'` wildcard. */
export function permissionsForRole(role: RoleDefinition): PermissionKey[] {
  return role.permissions === '*' ? ALL_PERMISSION_KEYS : role.permissions;
}

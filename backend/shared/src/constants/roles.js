"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_DEFINITIONS = exports.ROLES = void 0;
exports.permissionsForRole = permissionsForRole;
const permissions_1 = require("./permissions");
exports.ROLES = {
    SUPER_ADMIN: 'Super Admin',
    PORTAL_ADMINISTRATOR: 'Portal Administrator',
    CONTENT_MANAGER: 'Content Manager',
    COMMITTEE_MANAGER: 'Committee Manager',
    DIASPORA_MANAGER: 'Diaspora Manager',
    MEDIA_MANAGER: 'Media Manager',
    EVENT_MANAGER: 'Event Manager',
    AUTHORIZED_DATA_PROVIDER: 'Authorized Data Provider',
    COMMITTEE_MEMBER: 'Committee Member',
    DIASPORA_MEMBER: 'Diaspora Member',
    TOURISM_OFFICER: 'Tourism Officer',
    DISTRICT_OFFICER: 'District Officer',
    REPORT_VIEWER: 'Report Viewer',
    GUEST_USER: 'Guest User',
};
exports.ROLE_DEFINITIONS = [
    {
        name: exports.ROLES.SUPER_ADMIN,
        slug: 'super-admin',
        description: 'Unrestricted access to every module and setting.',
        isSystem: true,
        permissions: '*',
    },
    {
        name: exports.ROLES.PORTAL_ADMINISTRATOR,
        slug: 'portal-administrator',
        description: 'Day-to-day administration of users, committees and content.',
        isSystem: true,
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD, permissions_1.PERMISSIONS.VIEW_REPORTS, permissions_1.PERMISSIONS.EXPORT_REPORTS,
            permissions_1.PERMISSIONS.VIEW_USERS, permissions_1.PERMISSIONS.CREATE_USERS, permissions_1.PERMISSIONS.EDIT_USERS,
            permissions_1.PERMISSIONS.DELETE_USERS, permissions_1.PERMISSIONS.RESET_USER_PASSWORD, permissions_1.PERMISSIONS.EXPORT_USERS,
            permissions_1.PERMISSIONS.ASSIGN_USER_ROLES, permissions_1.PERMISSIONS.VIEW_AUDIT_LOGS,
            permissions_1.PERMISSIONS.VIEW_ROLES, permissions_1.PERMISSIONS.VIEW_PERMISSIONS,
            permissions_1.PERMISSIONS.VIEW_CATEGORIES, permissions_1.PERMISSIONS.MANAGE_CATEGORIES,
            permissions_1.PERMISSIONS.VIEW_DEPARTMENTS, permissions_1.PERMISSIONS.MANAGE_DEPARTMENTS,
            permissions_1.PERMISSIONS.VIEW_DIASPORA, permissions_1.PERMISSIONS.VERIFY_DIASPORA, permissions_1.PERMISSIONS.REJECT_DIASPORA,
            permissions_1.PERMISSIONS.EXPORT_DIASPORA,
            permissions_1.PERMISSIONS.VIEW_COMMITTEES, permissions_1.PERMISSIONS.EDIT_COMMITTEES, permissions_1.PERMISSIONS.APPROVE_COMMITTEES,
            permissions_1.PERMISSIONS.REJECT_COMMITTEES, permissions_1.PERMISSIONS.EXPORT_COMMITTEES,
            permissions_1.PERMISSIONS.CREATE_COMMITTEE_PORTAL_ACCOUNT, permissions_1.PERMISSIONS.VIEW_COMMITTEE_DOCUMENTS,
            permissions_1.PERMISSIONS.VIEW_PANDAL_ATLAS, permissions_1.PERMISSIONS.MODERATE_PANDAL_ATLAS,
            permissions_1.PERMISSIONS.VIEW_GALLERY, permissions_1.PERMISSIONS.MODERATE_MEDIA, permissions_1.PERMISSIONS.MANAGE_MEDIA,
            permissions_1.PERMISSIONS.VIEW_ALBUMS, permissions_1.PERMISSIONS.MANAGE_ALBUMS,
            permissions_1.PERMISSIONS.VIEW_ARTICLES, permissions_1.PERMISSIONS.REVIEW_ARTICLES, permissions_1.PERMISSIONS.APPROVE_ARTICLES,
            permissions_1.PERMISSIONS.PUBLISH_ARTICLES,
            permissions_1.PERMISSIONS.VIEW_PODCASTS, permissions_1.PERMISSIONS.CREATE_PODCASTS, permissions_1.PERMISSIONS.EDIT_PODCASTS,
            permissions_1.PERMISSIONS.DELETE_PODCASTS,
            permissions_1.PERMISSIONS.VIEW_WEBINARS, permissions_1.PERMISSIONS.CREATE_WEBINARS, permissions_1.PERMISSIONS.EDIT_WEBINARS,
            permissions_1.PERMISSIONS.MANAGE_WEBINAR_RSVPS,
            permissions_1.PERMISSIONS.MANAGE_SETTINGS,
            permissions_1.PERMISSIONS.VIEW_TOURISM, permissions_1.PERMISSIONS.MANAGE_TOURISM, permissions_1.PERMISSIONS.MANAGE_TOURISM_ENQUIRIES,
            permissions_1.PERMISSIONS.VIEW_INVESTMENTS, permissions_1.PERMISSIONS.CREATE_INVESTMENTS, permissions_1.PERMISSIONS.EDIT_INVESTMENTS,
            permissions_1.PERMISSIONS.DELETE_INVESTMENTS, permissions_1.PERMISSIONS.APPROVE_INVESTMENTS, permissions_1.PERMISSIONS.PUBLISH_INVESTMENTS,
            permissions_1.PERMISSIONS.MANAGE_INVESTMENT_ENQUIRIES, permissions_1.PERMISSIONS.MANAGE_ASSOCIATIONS,
            permissions_1.PERMISSIONS.VIEW_NOMINATIONS, permissions_1.PERMISSIONS.MANAGE_NOMINATIONS,
            permissions_1.PERMISSIONS.REVIEW_NOMINATIONS, permissions_1.PERMISSIONS.SHORTLIST_NOMINATIONS,
            permissions_1.PERMISSIONS.MANAGE_CONTESTS,
        ],
    },
    {
        name: exports.ROLES.CONTENT_MANAGER,
        slug: 'content-manager',
        description: 'Authors, reviews and publishes articles and news.',
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD, permissions_1.PERMISSIONS.VIEW_CATEGORIES,
            permissions_1.PERMISSIONS.VIEW_ARTICLES, permissions_1.PERMISSIONS.CREATE_ARTICLES, permissions_1.PERMISSIONS.EDIT_ARTICLES,
            permissions_1.PERMISSIONS.DELETE_ARTICLES, permissions_1.PERMISSIONS.REVIEW_ARTICLES, permissions_1.PERMISSIONS.APPROVE_ARTICLES,
            permissions_1.PERMISSIONS.PUBLISH_ARTICLES,
            permissions_1.PERMISSIONS.VIEW_PODCASTS, permissions_1.PERMISSIONS.CREATE_PODCASTS, permissions_1.PERMISSIONS.EDIT_PODCASTS,
            permissions_1.PERMISSIONS.DELETE_PODCASTS,
            permissions_1.PERMISSIONS.MANAGE_MEDIA, permissions_1.PERMISSIONS.UPLOAD_MEDIA, permissions_1.PERMISSIONS.VIEW_GALLERY,
            permissions_1.PERMISSIONS.VIEW_INVESTMENTS, permissions_1.PERMISSIONS.CREATE_INVESTMENTS, permissions_1.PERMISSIONS.EDIT_INVESTMENTS,
            permissions_1.PERMISSIONS.VIEW_TOURISM,
        ],
    },
    {
        name: exports.ROLES.COMMITTEE_MANAGER,
        slug: 'committee-manager',
        description: 'Reviews and approves puja committee applications.',
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD, permissions_1.PERMISSIONS.VIEW_REPORTS,
            permissions_1.PERMISSIONS.VIEW_COMMITTEES, permissions_1.PERMISSIONS.EDIT_COMMITTEES, permissions_1.PERMISSIONS.APPROVE_COMMITTEES,
            permissions_1.PERMISSIONS.REJECT_COMMITTEES, permissions_1.PERMISSIONS.EXPORT_COMMITTEES,
            permissions_1.PERMISSIONS.CREATE_COMMITTEE_PORTAL_ACCOUNT, permissions_1.PERMISSIONS.VIEW_COMMITTEE_DOCUMENTS,
            permissions_1.PERMISSIONS.VIEW_PANDAL_ATLAS, permissions_1.PERMISSIONS.MODERATE_PANDAL_ATLAS,
        ],
    },
    {
        name: exports.ROLES.DIASPORA_MANAGER,
        slug: 'diaspora-manager',
        description: 'Verifies diaspora registrations and provisions their accounts.',
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD, permissions_1.PERMISSIONS.VIEW_REPORTS,
            permissions_1.PERMISSIONS.VIEW_DIASPORA, permissions_1.PERMISSIONS.VERIFY_DIASPORA, permissions_1.PERMISSIONS.REJECT_DIASPORA,
            permissions_1.PERMISSIONS.EXPORT_DIASPORA,
        ],
    },
    {
        name: exports.ROLES.MEDIA_MANAGER,
        slug: 'media-manager',
        description: 'Moderates the committee media gallery and curates albums.',
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD,
            permissions_1.PERMISSIONS.VIEW_GALLERY, permissions_1.PERMISSIONS.UPLOAD_MEDIA, permissions_1.PERMISSIONS.EDIT_MEDIA,
            permissions_1.PERMISSIONS.DELETE_MEDIA, permissions_1.PERMISSIONS.MODERATE_MEDIA, permissions_1.PERMISSIONS.MANAGE_MEDIA,
            permissions_1.PERMISSIONS.VIEW_ALBUMS, permissions_1.PERMISSIONS.MANAGE_ALBUMS, permissions_1.PERMISSIONS.VIEW_CATEGORIES,
        ],
    },
    {
        name: exports.ROLES.EVENT_MANAGER,
        slug: 'event-manager',
        description: 'Schedules webinars and manages RSVPs.',
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD,
            permissions_1.PERMISSIONS.VIEW_WEBINARS, permissions_1.PERMISSIONS.CREATE_WEBINARS, permissions_1.PERMISSIONS.EDIT_WEBINARS,
            permissions_1.PERMISSIONS.DELETE_WEBINARS, permissions_1.PERMISSIONS.MANAGE_WEBINAR_RSVPS,
            permissions_1.PERMISSIONS.VIEW_PODCASTS, permissions_1.PERMISSIONS.CREATE_PODCASTS, permissions_1.PERMISSIONS.EDIT_PODCASTS,
            permissions_1.PERMISSIONS.DELETE_PODCASTS,
        ],
    },
    {
        name: exports.ROLES.AUTHORIZED_DATA_PROVIDER,
        slug: 'authorized-data-provider',
        description: 'Submits pandal atlas and gallery data for moderation.',
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD,
            permissions_1.PERMISSIONS.VIEW_PANDAL_ATLAS, permissions_1.PERMISSIONS.CREATE_PANDAL_ATLAS, permissions_1.PERMISSIONS.EDIT_PANDAL_ATLAS,
            permissions_1.PERMISSIONS.VIEW_GALLERY, permissions_1.PERMISSIONS.UPLOAD_MEDIA, permissions_1.PERMISSIONS.EDIT_MEDIA,
            permissions_1.PERMISSIONS.VIEW_ALBUMS, permissions_1.PERMISSIONS.MANAGE_ALBUMS,
        ],
    },
    {
        name: exports.ROLES.COMMITTEE_MEMBER,
        slug: 'committee-member',
        description: 'Committee portal account: manages only its own media and pandal entries.',
        isSystem: true,
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD,
            permissions_1.PERMISSIONS.VIEW_GALLERY, permissions_1.PERMISSIONS.UPLOAD_MEDIA, permissions_1.PERMISSIONS.EDIT_MEDIA,
            permissions_1.PERMISSIONS.VIEW_ALBUMS, permissions_1.PERMISSIONS.MANAGE_ALBUMS,
            permissions_1.PERMISSIONS.VIEW_PANDAL_ATLAS, permissions_1.PERMISSIONS.CREATE_PANDAL_ATLAS, permissions_1.PERMISSIONS.EDIT_PANDAL_ATLAS,
        ],
    },
    {
        name: exports.ROLES.DIASPORA_MEMBER,
        slug: 'diaspora-member',
        description: 'Verified diaspora member with access to public portal features.',
        isSystem: true,
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD,
            permissions_1.PERMISSIONS.VIEW_GALLERY, permissions_1.PERMISSIONS.VIEW_ARTICLES,
            permissions_1.PERMISSIONS.VIEW_WEBINARS, permissions_1.PERMISSIONS.VIEW_PODCASTS, permissions_1.PERMISSIONS.VIEW_PANDAL_ATLAS,
        ],
    },
    {
        name: exports.ROLES.TOURISM_OFFICER,
        slug: 'tourism-officer',
        description: 'Read-only oversight across committees, atlas and gallery.',
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD, permissions_1.PERMISSIONS.VIEW_REPORTS, permissions_1.PERMISSIONS.EXPORT_REPORTS,
            permissions_1.PERMISSIONS.VIEW_COMMITTEES, permissions_1.PERMISSIONS.VIEW_PANDAL_ATLAS, permissions_1.PERMISSIONS.VIEW_GALLERY,
            permissions_1.PERMISSIONS.VIEW_ARTICLES, permissions_1.PERMISSIONS.VIEW_WEBINARS, permissions_1.PERMISSIONS.VIEW_PODCASTS,
            permissions_1.PERMISSIONS.VIEW_TOURISM, permissions_1.PERMISSIONS.MANAGE_TOURISM_ENQUIRIES,
        ],
    },
    {
        name: exports.ROLES.DISTRICT_OFFICER,
        slug: 'district-officer',
        description: 'District-level review of committees and pandal entries.',
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD, permissions_1.PERMISSIONS.VIEW_REPORTS,
            permissions_1.PERMISSIONS.VIEW_COMMITTEES, permissions_1.PERMISSIONS.VIEW_COMMITTEE_DOCUMENTS,
            permissions_1.PERMISSIONS.VIEW_PANDAL_ATLAS, permissions_1.PERMISSIONS.MODERATE_PANDAL_ATLAS,
        ],
    },
    {
        name: exports.ROLES.REPORT_VIEWER,
        slug: 'report-viewer',
        description: 'Access to dashboards and report exports only.',
        permissions: [
            permissions_1.PERMISSIONS.VIEW_DASHBOARD, permissions_1.PERMISSIONS.VIEW_REPORTS, permissions_1.PERMISSIONS.EXPORT_REPORTS,
        ],
    },
    {
        name: exports.ROLES.GUEST_USER,
        slug: 'guest-user',
        description: 'Minimal authenticated access to public-facing modules.',
        permissions: [
            permissions_1.PERMISSIONS.VIEW_GALLERY, permissions_1.PERMISSIONS.VIEW_ARTICLES, permissions_1.PERMISSIONS.VIEW_WEBINARS,
            permissions_1.PERMISSIONS.VIEW_PANDAL_ATLAS,
        ],
    },
];
/** Resolves a role's permission list, expanding the `'*'` wildcard. */
function permissionsForRole(role) {
    return role.permissions === '*' ? permissions_1.ALL_PERMISSION_KEYS : role.permissions;
}

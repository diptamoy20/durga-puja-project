import { PERMISSIONS, type PermissionKey } from './permissions';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  /** Font Awesome class, e.g. `fa-users`. */
  icon: string;
  /**
   * Omitted while the screen has not been built yet: the item renders as a
   * muted placeholder instead of a link, so the menu never points at a 404.
   */
  to?: string;
  /** `end` matches the path exactly, needed for the "/" dashboard link. */
  end?: boolean;
  /** Item is hidden unless the user holds one of these. Omit for everyone. */
  permissions?: PermissionKey[];
  /** Tints the icon, as the original menu did for queue and status links. */
  tone?: 'info' | 'warning' | 'success' | 'danger';
}

export interface NavSection {
  label: string;
  items: NavItem[];
  /** Expanded on first render even when it holds no active route. */
  defaultOpen?: boolean;
  /** Section is hidden unless the user holds one of these. */
  permissions?: PermissionKey[];
  /**
   * Section is hidden *from* holders of these. Used for the committee-member
   * views, which exist only for users without the equivalent admin grant.
   */
  hiddenWhen?: PermissionKey[];
}

/**
 * Single source of truth for the sidebar, mirroring the section layout of the
 * previous portal menu.
 *
 * Gating is by permission, never by role name, so reorganising roles on the
 * server does not require a frontend change. A section whose every item is
 * filtered out is dropped entirely.
 */
export const NAVIGATION: NavSection[] = [
  {
    label: 'Main',
    defaultOpen: true,
    items: [{ label: 'Dashboard', icon: 'fa-gauge-high', to: ROUTES.DASHBOARD, end: true }],
  },

  {
    label: 'Master Management',
    permissions: [PERMISSIONS.VIEW_CATEGORIES],
    items: [
      { label: 'Categories', icon: 'fa-tags', to: ROUTES.CATEGORIES },
      { label: 'Subcategories', icon: 'fa-tag', to: ROUTES.SUBCATEGORIES },
    ],
  },

  {
    label: 'User Management',
    items: [
      {
        label: 'Users',
        icon: 'fa-users',
        to: ROUTES.USERS,
        permissions: [PERMISSIONS.VIEW_USERS],
      },
      {
        label: 'Roles',
        icon: 'fa-id-badge',
        to: ROUTES.ROLES,
        permissions: [PERMISSIONS.VIEW_ROLES],
      },
      {
        label: 'Permissions',
        icon: 'fa-key',
        to: ROUTES.PERMISSIONS,
        end: true,
        permissions: [PERMISSIONS.VIEW_PERMISSIONS],
      },
      {
        // The role x permission grid, which stands in for the per-role
        // assignment screen of the previous portal.
        label: 'Role Permissions',
        icon: 'fa-shield-halved',
        to: ROUTES.PERMISSION_MATRIX,
        permissions: [PERMISSIONS.MANAGE_ROLE_PERMISSIONS],
      },
      {
        label: 'User Role Assignment',
        icon: 'fa-user-gear',
        permissions: [PERMISSIONS.ASSIGN_USER_ROLES],
      },
      {
        label: 'Departments',
        icon: 'fa-sitemap',
        permissions: [PERMISSIONS.VIEW_DEPARTMENTS],
      },
      {
        label: 'User Activity Log',
        icon: 'fa-clock-rotate-left',
        to: ROUTES.AUDIT_LOGS,
        permissions: [PERMISSIONS.VIEW_AUDIT_LOGS],
      },
    ],
  },

  {
    label: 'Diaspora Management',
    permissions: [PERMISSIONS.VIEW_DIASPORA],
    items: [{ label: 'Diaspora Verification', icon: 'fa-circle-check', to: ROUTES.DIASPORA }],
  },

  {
    label: 'Puja Committee Management',
    permissions: [PERMISSIONS.VIEW_COMMITTEES],
    items: [
      { label: 'Committee Applications', icon: 'fa-rectangle-list', to: ROUTES.COMMITTEES },
      { label: 'Approved Committees', icon: 'fa-circle-check', tone: 'success', to: `${ROUTES.COMMITTEES}?status=APPROVED` },
      { label: 'Pending Approvals', icon: 'fa-hourglass-half', tone: 'warning', to: `${ROUTES.COMMITTEES}?status=PENDING` },
      { label: 'Rejected Applications', icon: 'fa-circle-xmark', tone: 'danger', to: `${ROUTES.COMMITTEES}?status=REJECTED` },
    ],
  },

  {
    label: 'Pandal Atlas',
    permissions: [PERMISSIONS.VIEW_PANDAL_ATLAS],
    items: [
      { label: 'All Pandals', icon: 'fa-map', to: ROUTES.PANDAL_ATLAS },
      { label: 'Submitted Queue', icon: 'fa-hourglass-half', tone: 'info', to: `${ROUTES.PANDAL_ATLAS}?status=SUBMITTED` },
      { label: 'Under Review', icon: 'fa-eye', tone: 'warning', to: `${ROUTES.PANDAL_ATLAS}?status=UNDER_REVIEW` },
      { label: 'Approved (Map DB)', icon: 'fa-circle-check', tone: 'success', to: `${ROUTES.PANDAL_ATLAS}?status=APPROVED` },
      { label: 'Rejected', icon: 'fa-circle-xmark', tone: 'danger', to: `${ROUTES.PANDAL_ATLAS}?status=REJECTED` },
      { label: 'Drafts', icon: 'fa-pen-to-square', to: `${ROUTES.PANDAL_ATLAS}?status=DRAFT` },
      { label: 'Add New Pandal', icon: 'fa-circle-plus', to: ROUTES.PANDAL_ATLAS_NEW, end: true },
      { label: 'Public Map View', icon: 'fa-location-dot', tone: 'warning', to: ROUTES.PUBLIC_ATLAS },
    ],
  },

  {
    label: 'Media Gallery',
    // Moderation or album management; a committee member gets "My Media
    // Gallery" below instead.
    permissions: [PERMISSIONS.MODERATE_MEDIA, PERMISSIONS.MANAGE_ALBUMS],
    items: [
      { label: 'Public Gallery', icon: 'fa-arrow-up-right-from-square', to: ROUTES.PUBLIC_GALLERY },
      { label: 'All Media', icon: 'fa-layer-group', permissions: [PERMISSIONS.MODERATE_MEDIA], to: ROUTES.GALLERY_MEDIA },
      {
        label: 'Pending Moderation',
        icon: 'fa-hourglass-half',
        tone: 'warning',
        permissions: [PERMISSIONS.MODERATE_MEDIA],
        to: ROUTES.GALLERY_MODERATION,
      },
      {
        label: 'Approved',
        icon: 'fa-circle-check',
        tone: 'success',
        permissions: [PERMISSIONS.MODERATE_MEDIA],
        to: `${ROUTES.GALLERY_MEDIA}?status=APPROVED`,
      },
      {
        label: 'Rejected',
        icon: 'fa-circle-xmark',
        tone: 'danger',
        permissions: [PERMISSIONS.MODERATE_MEDIA],
        to: `${ROUTES.GALLERY_MEDIA}?status=REJECTED`,
      },
      {
        label: 'Upload Media',
        icon: 'fa-cloud-arrow-up',
        permissions: [PERMISSIONS.UPLOAD_MEDIA],
        to: ROUTES.GALLERY_UPLOAD,
      },
      { label: 'Albums', icon: 'fa-photo-film', permissions: [PERMISSIONS.MANAGE_ALBUMS], to: ROUTES.GALLERY_ALBUMS },
      { label: 'Live Streaming', icon: 'fa-tower-broadcast' },
    ],
  },

  {
    label: 'Webinars & Virtual Events',
    permissions: [PERMISSIONS.VIEW_WEBINARS],
    items: [
      { label: 'All Webinars', icon: 'fa-display', to: ROUTES.WEBINARS },
      {
        label: 'Schedule Webinar',
        icon: 'fa-circle-plus',
        permissions: [PERMISSIONS.CREATE_WEBINARS],
        to: ROUTES.WEBINARS_NEW,
      },
      { label: 'Live Now', icon: 'fa-tower-broadcast', tone: 'danger', to: `${ROUTES.WEBINARS}?status=LIVE` },
      { label: 'Replay Recordings', icon: 'fa-circle-play', tone: 'success', to: `${ROUTES.WEBINARS}?status=RECORDED` },
      { label: 'Public Hub', icon: 'fa-arrow-up-right-from-square', to: ROUTES.PUBLIC_WEBINARS },
    ],
  },

  {
    label: 'Content Management',
    permissions: [PERMISSIONS.VIEW_ARTICLES],
    items: [
      { label: 'Articles', icon: 'fa-newspaper', to: ROUTES.ARTICLES },
      { label: 'Drafts', icon: 'fa-file', to: `${ROUTES.ARTICLES}?status=DRAFT` },
      { label: 'Pending Review', icon: 'fa-hourglass-half', tone: 'warning', to: `${ROUTES.ARTICLES}?status=IN_REVIEW` },
      { label: 'Published', icon: 'fa-tower-broadcast', tone: 'success', to: `${ROUTES.ARTICLES}?status=PUBLISHED` },
      { label: 'Podcasts Library', icon: 'fa-podcast', to: ROUTES.PODCASTS },
      { label: 'Add Podcast', icon: 'fa-circle-plus', to: ROUTES.PODCAST_NEW },
      { label: 'Public Podcast Hub', icon: 'fa-arrow-up-right-from-square', to: ROUTES.PUBLIC_PODCASTS },
    ],
  },

  {
    label: 'Reports',
    permissions: [PERMISSIONS.VIEW_REPORTS],
    items: [
      { label: 'Registration Reports', icon: 'fa-chart-column' },
      { label: 'Tourism Reports', icon: 'fa-chart-line' },
      { label: 'Live Stream Reports', icon: 'fa-video' },
      { label: 'Visitor Analytics', icon: 'fa-wave-square' },
      { label: 'Downloads', icon: 'fa-download' },
    ],
  },

  {
    label: 'Settings',
    permissions: [PERMISSIONS.MANAGE_SETTINGS],
    items: [
      { label: 'General Settings', icon: 'fa-gear' },
      { label: 'Portal Settings', icon: 'fa-sliders' },
      { label: 'Email Settings', icon: 'fa-envelope-open' },
      { label: 'API Settings', icon: 'fa-code' },
      { label: 'Social Media', icon: 'fa-share-nodes' },
    ],
  },

  {
    label: 'My Media Gallery',
    permissions: [PERMISSIONS.VIEW_GALLERY],
    hiddenWhen: [PERMISSIONS.MODERATE_MEDIA],
    items: [
      { label: 'My Media', icon: 'fa-images', to: ROUTES.MY_COMMITTEE_MEDIA },
      {
        label: 'Upload Media',
        icon: 'fa-cloud-arrow-up',
        permissions: [PERMISSIONS.UPLOAD_MEDIA],
        to: ROUTES.MY_COMMITTEE_MEDIA_CREATE,
      },
      { label: 'Pending', icon: 'fa-hourglass-half', tone: 'warning', to: `${ROUTES.MY_COMMITTEE_MEDIA}?status=PENDING` },
      { label: 'Approved', icon: 'fa-circle-check', tone: 'success', to: `${ROUTES.MY_COMMITTEE_MEDIA}?status=APPROVED` },
      { label: 'Rejected', icon: 'fa-circle-xmark', tone: 'danger', to: `${ROUTES.MY_COMMITTEE_MEDIA}?status=REJECTED` },
    ],
  },

  {
    label: 'My Albums',
    permissions: [PERMISSIONS.VIEW_ALBUMS],
    hiddenWhen: [PERMISSIONS.MANAGE_ALBUMS],
    items: [
      { label: 'Albums', icon: 'fa-photo-film', to: ROUTES.MY_COMMITTEE_ALBUMS },
      { label: 'Create Album', icon: 'fa-circle-plus', to: ROUTES.MY_COMMITTEE_ALBUM_NEW },
    ],
  },

  {
    label: 'Account',
    items: [
      { label: 'My Profile', icon: 'fa-circle-user', to: ROUTES.PROFILE },
      { label: 'Change Password', icon: 'fa-key', to: ROUTES.CHANGE_PASSWORD },
    ],
  },
];

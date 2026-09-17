/** Every route path in one place, so links cannot drift from the router. */
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  DASHBOARD: '/',
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/change-password',

  USERS: '/users',
  USER_NEW: '/users/new',
  USER_EDIT: (id: number | string = ':id') => `/users/${id}/edit`,
  USER_DETAIL: (id: number | string = ':id') => `/users/${id}`,

  ROLES: '/roles',
  PERMISSIONS: '/permissions',
  /** The role x permission grid, which the permission list links across to. */
  PERMISSION_MATRIX: '/permissions/matrix',
  AUDIT_LOGS: '/audit-logs',

  // Diaspora
  DIASPORA: '/diaspora',
  DIASPORA_DETAIL: (id: number | string = ':id') => `/diaspora/${id}`,

  // Committees
  COMMITTEES: '/committees',
  COMMITTEE_DETAIL: (id: number | string = ':id') => `/committees/${id}`,
  COMMITTEE_EDIT: (id: number | string = ':id') => `/committees/${id}/edit`,

  // Master / Categories
  CATEGORIES: '/categories',
  SUBCATEGORIES: '/subcategories',

  // Content / Articles
  ARTICLES: '/articles',
  ARTICLE_NEW: '/articles/new',
  ARTICLE_EDIT: (id: number | string = ':id') => `/articles/${id}/edit`,
  ARTICLE_DETAIL: (id: number | string = ':id') => `/articles/${id}`,

  // Gallery
  GALLERY_MEDIA: '/gallery/media',
  GALLERY_UPLOAD: '/gallery/upload',
  GALLERY_DETAIL: (id: number | string = ':id') => `/gallery/media/${id}`,
  GALLERY_MODERATION: '/gallery/moderation',
  GALLERY_ALBUMS: '/gallery/albums',
  GALLERY_ALBUM_NEW: '/gallery/albums/new',
  GALLERY_ALBUM_EDIT: (id: number | string = ':id') => `/gallery/albums/${id}/edit`,

  // Atlas
  PANDAL_ATLAS: '/atlas/pandals',
  PANDAL_ATLAS_NEW: '/atlas/pandals/new',
  PANDAL_ATLAS_EDIT: (id: number | string = ':id') => `/atlas/pandals/${id}/edit`,
  PANDAL_ATLAS_DETAIL: (id: number | string = ':id') => `/atlas/pandals/${id}`,

  // Webinars & Events
  WEBINARS: '/webinars',
  WEBINARS_NEW: '/webinars/new',
  WEBINARS_EDIT: (id: number | string = ':id') => `/webinars/${id}/edit`,
  WEBINARS_DETAIL: (id: number | string = ':id') => `/webinars/${id}`,
  WEBINARS_RSVPS: (id: number | string = ':id') => `/webinars/${id}/rsvps`,

  // Public Facing Pages
  PUBLIC_CHOOSE_TYPE: '/register/choose',
  PUBLIC_REGISTER_DIASPORA: '/register/diaspora',
  PUBLIC_REGISTER_COMMITTEE: '/register/committee',
  PUBLIC_THANK_YOU: (type: string = ':type', id: number | string = ':id') => `/register/thank-you/${type}/${id}`,
  PUBLIC_GALLERY: '/public/gallery',
  PUBLIC_ATLAS: '/public/atlas',
  PUBLIC_WEBINARS: '/public/webinars',

  FORBIDDEN: '/forbidden',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'dpgc.accessToken',
  REFRESH_TOKEN: 'dpgc.refreshToken',
  USER: 'dpgc.user',
} as const;

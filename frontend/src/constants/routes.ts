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

  // Committee member media & albums
  MY_COMMITTEE_MEDIA: '/committee/media',
  MY_COMMITTEE_MEDIA_CREATE: '/committee/media/create',
  MY_COMMITTEE_MEDIA_DETAIL: (id: number | string = ':id') => `/committee/media/${id}`,
  MY_COMMITTEE_MEDIA_EDIT: (id: number | string = ':id') => `/committee/media/${id}/edit`,
  MY_COMMITTEE_ALBUMS: '/committee/albums',
  MY_COMMITTEE_ALBUM_NEW: '/committee/albums/new',
  MY_COMMITTEE_ALBUM_DETAIL: (id: number | string = ':id') => `/committee/albums/${id}`,
  MY_COMMITTEE_ALBUM_EDIT: (id: number | string = ':id') => `/committee/albums/${id}/edit`,

  // Master / Categories
  CATEGORIES: '/categories',
  CATEGORY_NEW: '/categories/new',
  CATEGORY_EDIT: (id: number | string = ':id') => `/categories/${id}/edit`,
  CATEGORY_DETAIL: (id: number | string = ':id') => `/categories/${id}`,
  SUBCATEGORIES: '/subcategories',
  SUBCATEGORY_NEW: '/subcategories/new',
  SUBCATEGORY_EDIT: (id: number | string = ':id') => `/subcategories/${id}/edit`,
  SUBCATEGORY_DETAIL: (id: number | string = ':id') => `/subcategories/${id}`,

  // Content / Articles
  ARTICLES: '/articles',
  ARTICLE_NEW: '/articles/new',
  ARTICLE_EDIT: (id: number | string = ':id') => `/articles/${id}/edit`,
  ARTICLE_DETAIL: (id: number | string = ':id') => `/articles/${id}`,

  // Gallery
  GALLERY_MEDIA: '/gallery/media',
  GALLERY_UPLOAD: '/gallery/upload',
  GALLERY_DETAIL: (id: number | string = ':id') => `/gallery/media/${id}`,
  GALLERY_MEDIA_EDIT: (id: number | string = ':id') => `/gallery/media/${id}/edit`,
  GALLERY_MODERATION: '/gallery/moderation',
  GALLERY_ALBUMS: '/gallery/albums',
  GALLERY_ALBUM_NEW: '/gallery/albums/new',
  GALLERY_ALBUM_DETAIL: (id: number | string = ':id') => `/gallery/albums/${id}`,
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

  // Podcasts
  PODCASTS: '/podcasts',
  PODCAST_NEW: '/podcasts/new',
  PODCAST_EDIT: (id: number | string = ':id') => `/podcasts/${id}/edit`,

  // Public Facing Pages
  PUBLIC_CHOOSE_TYPE: '/register/choose',
  PUBLIC_REGISTER_DIASPORA: '/register/diaspora',
  PUBLIC_REGISTER_COMMITTEE: '/register/committee',
  PUBLIC_THANK_YOU: (type: string = ':type', registrationNo: string = ':registrationNo') =>
    `/register/thank-you/${type}/${registrationNo}`,
  PUBLIC_GALLERY: '/public/gallery',
  PUBLIC_GALLERY_DETAIL: (id: number | string = ':id') => `/public/gallery/${id}`,
  PUBLIC_ATLAS: '/public/atlas',
  PUBLIC_ATLAS_DETAIL: (id: number | string = ':id') => `/public/atlas/${id}`,
  PUBLIC_WEBINARS: '/public/webinars',
  PUBLIC_WEBINAR_REPLAYS: '/public/webinars/replays',
  PUBLIC_WEBINAR_DETAIL: (slug: string = ':slug') => `/public/webinars/${slug}`,
  PUBLIC_WEBINAR_LIVE: (slug: string = ':slug') => `/public/webinars/${slug}/live`,
  PUBLIC_PODCASTS: '/public/podcasts',
  PUBLIC_PODCAST_DETAIL: (slug: string = ':slug') => `/public/podcasts/${slug}`,

  FORBIDDEN: '/forbidden',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'dpgc.accessToken',
  REFRESH_TOKEN: 'dpgc.refreshToken',
  USER: 'dpgc.user',
} as const;

import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { ForbiddenPage, NotFoundPage } from '@/pages/ErrorPages';
import { PERMISSIONS } from '@/constants/permissions';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { ROUTES } from '@/constants/routes';

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// Core Admin pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AuditLogsPage = lazy(() => import('@/pages/AuditLogsPage'));
const UsersListPage = lazy(() => import('@/pages/users/UsersListPage'));
const UserDetailPage = lazy(() => import('@/pages/users/UserDetailPage'));
const UserFormPage = lazy(() => import('@/pages/users/UserFormPage'));
const RolesPage = lazy(() => import('@/pages/roles/RolesPage'));
const PermissionsListPage = lazy(() => import('@/pages/roles/PermissionsListPage'));
const PermissionsPage = lazy(() => import('@/pages/roles/PermissionsPage'));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'));
const ChangePasswordPage = lazy(() => import('@/pages/account/ChangePasswordPage'));

// Diaspora pages
const DiasporaListPage = lazy(() =>
  import('@/pages/diaspora/DiasporaListPage').then((m) => ({ default: m.DiasporaListPage })),
);
const DiasporaDetailPage = lazy(() =>
  import('@/pages/diaspora/DiasporaDetailPage').then((m) => ({ default: m.DiasporaDetailPage })),
);

// Committee pages
const CommitteeListPage = lazy(() =>
  import('@/pages/committees/CommitteeListPage').then((m) => ({ default: m.CommitteeListPage })),
);
const CommitteeDetailPage = lazy(() =>
  import('@/pages/committees/CommitteeDetailPage').then((m) => ({ default: m.CommitteeDetailPage })),
);
const CommitteeEditPage = lazy(() =>
  import('@/pages/committees/CommitteeEditPage').then((m) => ({ default: m.CommitteeEditPage })),
);

// Categories & Subcategories
const CategoriesPage = lazy(() =>
  import('@/pages/categories/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
);
const CategoryFormPage = lazy(() =>
  import('@/pages/categories/CategoryFormPage').then((m) => ({ default: m.CategoryFormPage })),
);
const CategoryDetailPage = lazy(() =>
  import('@/pages/categories/CategoryDetailPage').then((m) => ({ default: m.CategoryDetailPage })),
);
const SubcategoriesPage = lazy(() =>
  import('@/pages/categories/SubcategoriesPage').then((m) => ({ default: m.SubcategoriesPage })),
);
const SubcategoryFormPage = lazy(() =>
  import('@/pages/categories/SubcategoryFormPage').then((m) => ({ default: m.SubcategoryFormPage })),
);
const SubcategoryDetailPage = lazy(() =>
  import('@/pages/categories/SubcategoryDetailPage').then((m) => ({ default: m.SubcategoryDetailPage })),
);

// Articles & Content
const ArticleListPage = lazy(() =>
  import('@/pages/articles/ArticleListPage').then((m) => ({ default: m.ArticleListPage })),
);
const ArticleFormPage = lazy(() =>
  import('@/pages/articles/ArticleFormPage').then((m) => ({ default: m.ArticleFormPage })),
);
const ArticleDetailPage = lazy(() =>
  import('@/pages/articles/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage })),
);
const ArticlePreviewPage = lazy(() =>
  import('@/pages/articles/ArticlePreviewPage').then((m) => ({ default: m.ArticlePreviewPage })),
);
const MediaLibraryPage = lazy(() =>
  import('@/pages/content/MediaLibraryPage').then((m) => ({ default: m.MediaLibraryPage })),
);

// Gallery & Media
const MediaListPage = lazy(() =>
  import('@/pages/gallery/MediaListPage').then((m) => ({ default: m.MediaListPage })),
);
const MediaUploadPage = lazy(() =>
  import('@/pages/gallery/MediaUploadPage').then((m) => ({ default: m.MediaUploadPage })),
);
const MediaDetailPage = lazy(() =>
  import('@/pages/gallery/MediaDetailPage').then((m) => ({ default: m.MediaDetailPage })),
);
const MediaEditPage = lazy(() =>
  import('@/pages/gallery/MediaEditPage').then((m) => ({ default: m.MediaEditPage })),
);
const ModerationQueuePage = lazy(() =>
  import('@/pages/gallery/ModerationQueuePage').then((m) => ({ default: m.ModerationQueuePage })),
);
const AlbumsPage = lazy(() =>
  import('@/pages/gallery/AlbumsPage').then((m) => ({ default: m.AlbumsPage })),
);
const AlbumFormPage = lazy(() =>
  import('@/pages/gallery/AlbumFormPage').then((m) => ({ default: m.AlbumFormPage })),
);
const AlbumDetailPage = lazy(() =>
  import('@/pages/gallery/AlbumDetailPage').then((m) => ({ default: m.AlbumDetailPage })),
);

// Atlas & Pandals
const PandalListPage = lazy(() =>
  import('@/pages/atlas/PandalListPage').then((m) => ({ default: m.PandalListPage })),
);
const PandalFormPage = lazy(() =>
  import('@/pages/atlas/PandalFormPage').then((m) => ({ default: m.PandalFormPage })),
);
const PandalDetailPage = lazy(() =>
  import('@/pages/atlas/PandalDetailPage').then((m) => ({ default: m.PandalDetailPage })),
);

// Webinars & Events
const WebinarListPage = lazy(() =>
  import('@/pages/webinars/WebinarListPage').then((m) => ({ default: m.WebinarListPage })),
);
const WebinarFormPage = lazy(() =>
  import('@/pages/webinars/WebinarFormPage').then((m) => ({ default: m.WebinarFormPage })),
);
const WebinarDetailPage = lazy(() =>
  import('@/pages/webinars/WebinarDetailPage').then((m) => ({ default: m.WebinarDetailPage })),
);
const RsvpManagementPage = lazy(() =>
  import('@/pages/webinars/RsvpManagementPage').then((m) => ({ default: m.RsvpManagementPage })),
);

// Committee member media pages
const MyCommitteeMediaListPage = lazy(() =>
  import('@/pages/committee-media/MyCommitteeMediaListPage').then((m) => ({ default: m.MyCommitteeMediaListPage })),
);
const MyCommitteeMediaUploadPage = lazy(() =>
  import('@/pages/committee-media/MyCommitteeMediaUploadPage').then((m) => ({ default: m.MyCommitteeMediaUploadPage })),
);
const CommitteeAlbumListPage = lazy(() =>
  import('@/pages/committee-albums/CommitteeAlbumListPage').then((m) => ({ default: m.CommitteeAlbumListPage })),
);

// Public Pages
const ChooseAccountTypePage = lazy(() =>
  import('@/pages/public/ChooseAccountTypePage').then((m) => ({ default: m.ChooseAccountTypePage })),
);
const DiasporaRegistrationPage = lazy(() =>
  import('@/pages/public/DiasporaRegistrationPage').then((m) => ({ default: m.DiasporaRegistrationPage })),
);
const CommitteeRegistrationPage = lazy(() =>
  import('@/pages/public/CommitteeRegistrationPage').then((m) => ({ default: m.CommitteeRegistrationPage })),
);
const RegistrationThankYouPage = lazy(() =>
  import('@/pages/public/RegistrationThankYouPage').then((m) => ({ default: m.RegistrationThankYouPage })),
);
const PublicGalleryPage = lazy(() =>
  import('@/pages/public/PublicGalleryPage').then((m) => ({ default: m.PublicGalleryPage })),
);
const PublicGalleryDetailPage = lazy(() =>
  import('@/pages/public/PublicGalleryDetailPage').then((m) => ({ default: m.PublicGalleryDetailPage })),
);
const PublicAtlasPage = lazy(() =>
  import('@/pages/public/PublicAtlasPage').then((m) => ({ default: m.PublicAtlasPage })),
);
const PublicAtlasDetailPage = lazy(() =>
  import('@/pages/public/PublicAtlasDetailPage').then((m) => ({ default: m.PublicAtlasDetailPage })),
);
const PublicWebinarsPage = lazy(() =>
  import('@/pages/public/PublicWebinarsPage').then((m) => ({ default: m.PublicWebinarsPage })),
);
const PublicWebinarDetailPage = lazy(() =>
  import('@/pages/public/PublicWebinarDetailPage').then((m) => ({ default: m.PublicWebinarDetailPage })),
);
const PublicWebinarLivePage = lazy(() =>
  import('@/pages/public/PublicWebinarLivePage').then((m) => ({ default: m.PublicWebinarLivePage })),
);
const PublicWebinarReplaysPage = lazy(() =>
  import('@/pages/public/PublicWebinarReplaysPage').then((m) => ({ default: m.PublicWebinarReplaysPage })),
);
const PublicPodcastsPage = lazy(() =>
  import('@/pages/public/PublicPodcastsPage').then((m) => ({ default: m.PublicPodcastsPage })),
);
const PodcastDetailPage = lazy(() =>
  import('@/pages/public/PodcastDetailPage').then((m) => ({ default: m.PodcastDetailPage })),
);
const PublicArticlesPage = lazy(() =>
  import('@/pages/public/PublicArticlesPage').then((m) => ({ default: m.PublicArticlesPage })),
);
const PublicArticleDetailPage = lazy(() =>
  import('@/pages/public/PublicArticleDetailPage').then((m) => ({ default: m.PublicArticleDetailPage })),
);

// Public Tourism Concierge Pages
const PublicTourismConciergePage = lazy(() =>
  import('@/pages/public/PublicTourismConciergePage').then((m) => ({ default: m.PublicTourismConciergePage })),
);
const PublicTripPlannerPage = lazy(() =>
  import('@/pages/public/PublicTripPlannerPage').then((m) => ({ default: m.PublicTripPlannerPage })),
);
const PublicTourismCircuitsPage = lazy(() =>
  import('@/pages/public/PublicTourismCircuitsPage').then((m) => ({ default: m.PublicTourismCircuitsPage })),
);
const PublicTourismCircuitDetailPage = lazy(() =>
  import('@/pages/public/PublicTourismCircuitDetailPage').then((m) => ({ default: m.PublicTourismCircuitDetailPage })),
);
const PublicTourismItinerariesPage = lazy(() =>
  import('@/pages/public/PublicTourismItinerariesPage').then((m) => ({ default: m.PublicTourismItinerariesPage })),
);
const PublicTourismItineraryDetailPage = lazy(() =>
  import('@/pages/public/PublicTourismItineraryDetailPage').then((m) => ({ default: m.PublicTourismItineraryDetailPage })),
);
const PublicTourismStaysPage = lazy(() =>
  import('@/pages/public/PublicTourismStaysPage').then((m) => ({ default: m.PublicTourismStaysPage })),
);
const PublicTourismTransportsPage = lazy(() =>
  import('@/pages/public/PublicTourismTransportsPage').then((m) => ({ default: m.PublicTourismTransportsPage })),
);
const PublicTourismKnowledgePage = lazy(() =>
  import('@/pages/public/PublicTourismKnowledgePage').then((m) => ({ default: m.PublicTourismKnowledgePage })),
);
const PublicTourismOperatorsPage = lazy(() =>
  import('@/pages/public/PublicTourismOperatorsPage').then((m) => ({ default: m.PublicTourismOperatorsPage })),
);
const PublicTourismEnquiryPage = lazy(() =>
  import('@/pages/public/PublicTourismEnquiryPage').then((m) => ({ default: m.PublicTourismEnquiryPage })),
);

// Podcast Admin Pages
const PodcastListPage = lazy(() =>
  import('@/pages/podcasts/PodcastListPage').then((m) => ({ default: m.PodcastListPage })),
);
const PodcastFormPage = lazy(() =>
  import('@/pages/podcasts/PodcastFormPage').then((m) => ({ default: m.PodcastFormPage })),
);

// Tourism Concierge Admin Pages
const TourismEnquiriesPage = lazy(() =>
  import('@/pages/tourism/TourismEnquiriesPage').then((m) => ({ default: m.TourismEnquiriesPage })),
);
const TourismEnquiryDetailPage = lazy(() =>
  import('@/pages/tourism/TourismEnquiryDetailPage').then((m) => ({ default: m.TourismEnquiryDetailPage })),
);
const TourismCircuitsManagePage = lazy(() =>
  import('@/pages/tourism/TourismCircuitsManagePage').then((m) => ({ default: m.TourismCircuitsManagePage })),
);
const TourismStaysManagePage = lazy(() =>
  import('@/pages/tourism/TourismStaysManagePage').then((m) => ({ default: m.TourismStaysManagePage })),
);
const TourismTransportsManagePage = lazy(() =>
  import('@/pages/tourism/TourismTransportsManagePage').then((m) => ({ default: m.TourismTransportsManagePage })),
);
const TourismItinerariesManagePage = lazy(() =>
  import('@/pages/tourism/TourismItinerariesManagePage').then((m) => ({ default: m.TourismItinerariesManagePage })),
);
const TourismKnowledgeManagePage = lazy(() =>
  import('@/pages/tourism/TourismKnowledgeManagePage').then((m) => ({ default: m.TourismKnowledgeManagePage })),
);
const TourismOperatorsManagePage = lazy(() =>
  import('@/pages/tourism/TourismOperatorsManagePage').then((m) => ({ default: m.TourismOperatorsManagePage })),
);


export function AppRoutes() {
  return (
    <Routes>
      {/* Standalone public atlas (full-screen map layout) */}
      <Route path={ROUTES.PUBLIC_ATLAS} element={<PublicAtlasPage />} />
      <Route path={ROUTES.PUBLIC_ATLAS_DETAIL()} element={<PublicAtlasDetailPage />} />

      {/* Standalone public webinars (custom festival layout) */}
      <Route path={ROUTES.PUBLIC_WEBINARS} element={<PublicWebinarsPage />} />
      <Route path={ROUTES.PUBLIC_WEBINAR_REPLAYS} element={<PublicWebinarReplaysPage />} />
      <Route path={ROUTES.PUBLIC_WEBINAR_DETAIL()} element={<PublicWebinarDetailPage />} />
      <Route path={ROUTES.PUBLIC_WEBINAR_LIVE()} element={<PublicWebinarLivePage />} />

      {/* Public Pages Layout (Outside auth) */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.PUBLIC_CHOOSE_TYPE} element={<ChooseAccountTypePage />} />
        <Route path={ROUTES.PUBLIC_REGISTER_DIASPORA} element={<DiasporaRegistrationPage />} />
        <Route path={ROUTES.PUBLIC_REGISTER_COMMITTEE} element={<CommitteeRegistrationPage />} />
        <Route path={ROUTES.PUBLIC_THANK_YOU()} element={<RegistrationThankYouPage />} />
        <Route path={ROUTES.PUBLIC_GALLERY} element={<PublicGalleryPage />} />
        <Route path={ROUTES.PUBLIC_GALLERY_DETAIL()} element={<PublicGalleryDetailPage />} />
        <Route path={ROUTES.PUBLIC_PODCASTS} element={<PublicPodcastsPage />} />
        <Route path={ROUTES.PUBLIC_PODCAST_DETAIL()} element={<PodcastDetailPage />} />

        {/* Public Tourism Concierge */}
        <Route path={ROUTES.PUBLIC_TOURISM_CONCIERGE} element={<PublicTourismConciergePage />} />
        <Route path={ROUTES.PUBLIC_TRIP_PLANNER} element={<PublicTripPlannerPage />} />
        <Route path={ROUTES.PUBLIC_TOURISM_CIRCUITS} element={<PublicTourismCircuitsPage />} />
        <Route path={ROUTES.PUBLIC_TOURISM_CIRCUIT_DETAIL()} element={<PublicTourismCircuitDetailPage />} />
        <Route path={ROUTES.PUBLIC_TOURISM_ITINERARIES} element={<PublicTourismItinerariesPage />} />
        <Route path={ROUTES.PUBLIC_TOURISM_ITINERARY_DETAIL()} element={<PublicTourismItineraryDetailPage />} />
        <Route path={ROUTES.PUBLIC_TOURISM_STAYS} element={<PublicTourismStaysPage />} />
        <Route path={ROUTES.PUBLIC_TOURISM_TRANSPORTS} element={<PublicTourismTransportsPage />} />
        <Route path={ROUTES.PUBLIC_TOURISM_KNOWLEDGE} element={<PublicTourismKnowledgePage />} />
        <Route path={ROUTES.PUBLIC_TOURISM_OPERATORS} element={<PublicTourismOperatorsPage />} />
        <Route path={ROUTES.PUBLIC_TOURISM_ENQUIRY} element={<PublicTourismEnquiryPage />} />
        <Route path={ROUTES.PUBLIC_NEWS} element={<PublicArticlesPage />} />
        <Route path={ROUTES.PUBLIC_NEWS_DETAIL()} element={<PublicArticleDetailPage />} />
      </Route>

      {/* Unauthenticated area. A signed-in user is sent to the dashboard. */}
      <Route
        element={
          <PublicOnlyRoute>
            <AuthLayout />
          </PublicOnlyRoute>
        }
      >
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>

      {/* Authenticated shell. Individual routes add permission requirements */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_DASHBOARD]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* User Management */}
        <Route
          path={ROUTES.USERS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_USERS]}>
              <UsersListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.USER_NEW}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.CREATE_USERS]}>
              <UserFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.USER_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_USERS]}>
              <UserDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.USER_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.EDIT_USERS]}>
              <UserFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ROLES}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_ROLES]}>
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PERMISSION_MATRIX}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGE_ROLE_PERMISSIONS]}>
              <PermissionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PERMISSIONS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_PERMISSIONS]}>
              <PermissionsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.AUDIT_LOGS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_AUDIT_LOGS]}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />

        {/* Diaspora Management */}
        <Route
          path={ROUTES.DIASPORA}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_DIASPORA]}>
              <DiasporaListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DIASPORA_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_DIASPORA]}>
              <DiasporaDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Committee Management */}
        <Route
          path={ROUTES.COMMITTEES}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_COMMITTEES]}>
              <CommitteeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COMMITTEE_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_COMMITTEES]}>
              <CommitteeDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COMMITTEE_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.EDIT_COMMITTEES]}>
              <CommitteeEditPage />
            </ProtectedRoute>
          }
        />

        {/* Committee member media & albums */}
        <Route
          path={ROUTES.MY_COMMITTEE_MEDIA}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_GALLERY]}>
              <MyCommitteeMediaListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MY_COMMITTEE_MEDIA_CREATE}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.UPLOAD_MEDIA]}>
              <MyCommitteeMediaUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MY_COMMITTEE_MEDIA_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_GALLERY]}>
              <MediaDetailPage mode="committee" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MY_COMMITTEE_MEDIA_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.UPLOAD_MEDIA]}>
              <MediaEditPage mode="committee" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MY_COMMITTEE_ALBUMS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_ALBUMS]}>
              <CommitteeAlbumListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MY_COMMITTEE_ALBUM_NEW}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGE_ALBUMS]}>
              <AlbumFormPage mode="committee" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MY_COMMITTEE_ALBUM_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_ALBUMS]}>
              <AlbumDetailPage mode="committee" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MY_COMMITTEE_ALBUM_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGE_ALBUMS]}>
              <AlbumFormPage mode="committee" />
            </ProtectedRoute>
          }
        />

        {/* Master: Categories & Subcategories */}
        <Route
          path={ROUTES.CATEGORIES}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_CATEGORIES]}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CATEGORY_NEW}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGE_CATEGORIES]}>
              <CategoryFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CATEGORY_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGE_CATEGORIES]}>
              <CategoryFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CATEGORY_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_CATEGORIES]}>
              <CategoryDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SUBCATEGORIES}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_CATEGORIES]}>
              <SubcategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SUBCATEGORY_NEW}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGE_CATEGORIES]}>
              <SubcategoryFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SUBCATEGORY_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGE_CATEGORIES]}>
              <SubcategoryFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SUBCATEGORY_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_CATEGORIES]}>
              <SubcategoryDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Content Management */}
        <Route
          path={ROUTES.ARTICLES}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_ARTICLES]}>
              <ArticleListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ARTICLE_NEW}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.CREATE_ARTICLES]}>
              <ArticleFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ARTICLE_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_ARTICLES]}>
              <ArticleDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ARTICLE_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.EDIT_ARTICLES]}>
              <ArticleFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ARTICLE_PREVIEW()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_ARTICLES]}>
              <ArticlePreviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CONTENT_MEDIA_LIBRARY}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_ARTICLES, PERMISSIONS.MANAGE_MEDIA]}>
              <MediaLibraryPage />
            </ProtectedRoute>
          }
        />

        {/* Podcasts */}
        <Route
          path={ROUTES.PODCASTS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_PODCASTS, PERMISSIONS.VIEW_ARTICLES]}>
              <PodcastListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PODCAST_NEW}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.CREATE_PODCASTS, PERMISSIONS.CREATE_ARTICLES]}>
              <PodcastFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PODCAST_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.EDIT_PODCASTS, PERMISSIONS.EDIT_ARTICLES]}>
              <PodcastFormPage />
            </ProtectedRoute>
          }
        />

        {/* Tourism Concierge Admin */}
        <Route
          path={ROUTES.ADMIN_TOURISM_ENQUIRIES}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_TOURISM]}>
              <TourismEnquiriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_TOURISM_ENQUIRY_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_TOURISM]}>
              <TourismEnquiryDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_TOURISM_CIRCUITS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_TOURISM]}>
              <TourismCircuitsManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_TOURISM_STAYS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_TOURISM]}>
              <TourismStaysManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_TOURISM_TRANSPORTS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_TOURISM]}>
              <TourismTransportsManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_TOURISM_ITINERARIES}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_TOURISM]}>
              <TourismItinerariesManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_TOURISM_KNOWLEDGE}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_TOURISM]}>
              <TourismKnowledgeManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_TOURISM_OPERATORS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_TOURISM]}>
              <TourismOperatorsManagePage />
            </ProtectedRoute>
          }
        />

        {/* Gallery & Media */}
        <Route
          path={ROUTES.GALLERY_MEDIA}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_GALLERY, PERMISSIONS.MODERATE_MEDIA]}>
              <MediaListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GALLERY_UPLOAD}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.MODERATE_MEDIA]}>
              <MediaUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GALLERY_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_GALLERY, PERMISSIONS.MODERATE_MEDIA]}>
              <MediaDetailPage mode="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GALLERY_MEDIA_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MODERATE_MEDIA]}>
              <MediaEditPage mode="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GALLERY_MODERATION}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MODERATE_MEDIA]}>
              <ModerationQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GALLERY_ALBUMS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_ALBUMS, PERMISSIONS.MANAGE_ALBUMS]}>
              <AlbumsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GALLERY_ALBUM_NEW}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGE_ALBUMS]}>
              <AlbumFormPage mode="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GALLERY_ALBUM_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_ALBUMS, PERMISSIONS.MANAGE_ALBUMS]}>
              <AlbumDetailPage mode="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GALLERY_ALBUM_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.MANAGE_ALBUMS]}>
              <AlbumFormPage mode="admin" />
            </ProtectedRoute>
          }
        />

        {/* Atlas & Pandals */}
        <Route
          path={ROUTES.PANDAL_ATLAS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_PANDAL_ATLAS]}>
              <PandalListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PANDAL_ATLAS_NEW}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.CREATE_PANDAL_ATLAS]}>
              <PandalFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PANDAL_ATLAS_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_PANDAL_ATLAS]}>
              <PandalDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PANDAL_ATLAS_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.EDIT_PANDAL_ATLAS]}>
              <PandalFormPage />
            </ProtectedRoute>
          }
        />

        {/* Webinars & Events */}
        <Route
          path={ROUTES.WEBINARS}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_WEBINARS]}>
              <WebinarListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WEBINARS_NEW}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.CREATE_WEBINARS]}>
              <WebinarFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WEBINARS_DETAIL()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_WEBINARS]}>
              <WebinarDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WEBINARS_EDIT()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.EDIT_WEBINARS]}>
              <WebinarFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WEBINARS_RSVPS()}
          element={
            <ProtectedRoute permissions={[PERMISSIONS.VIEW_WEBINARS]}>
              <RsvpManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Account */}
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />

        {/* Error pages */}
        <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}

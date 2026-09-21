import { useNavigate } from 'react-router-dom';

import { MediaUploadForm } from '@/components/gallery/MediaUploadForm';
import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

import '@/styles/gallery-admin.css';

export function MediaUploadPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const isAdmin = can(PERMISSIONS.MODERATE_MEDIA);

  const listRoute = isAdmin ? ROUTES.GALLERY_MEDIA : ROUTES.MY_COMMITTEE_MEDIA;
  const listLabel = isAdmin ? 'All Media' : 'My Media';

  return (
    <div className="page">
      <GalleryModuleHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: listLabel, to: listRoute },
          { label: 'Upload' },
        ]}
        title={isAdmin ? 'Upload Media for Committee' : 'Upload Photo or Video'}
        subtitle={
          isAdmin
            ? 'Select the committee this photo or video belongs to.'
            : 'Upload photos and videos for your committee gallery.'
        }
      />

      <MediaUploadForm
        mode={isAdmin ? 'admin' : 'committee'}
        onCancel={() => navigate(ROUTES.GALLERY_MEDIA)}
        onSuccess={() => navigate(ROUTES.GALLERY_MEDIA)}
      />
    </div>
  );
}

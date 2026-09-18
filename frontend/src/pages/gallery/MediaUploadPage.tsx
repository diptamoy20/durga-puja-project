import { Link, useNavigate } from 'react-router-dom';

import { MediaUploadForm } from '@/components/gallery/MediaUploadForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

import '@/styles/gallery-admin.css';

export function MediaUploadPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const isAdmin = can(PERMISSIONS.MODERATE_MEDIA);

  return (
    <div className="page">
      <PageHeader
        title={isAdmin ? 'Upload Media for Committee' : 'Upload Photo or Video'}
        description={
          isAdmin
            ? 'Select the committee this photo or video belongs to.'
            : 'Upload photos and videos for your committee gallery.'
        }
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Media Gallery', to: ROUTES.GALLERY_MEDIA },
          { label: 'Upload' },
        ]}
        actions={(
          <Link to={ROUTES.GALLERY_MEDIA} className="btn btn--secondary btn--sm">
            ← Back to Gallery
          </Link>
        )}
      />

      <MediaUploadForm
        mode={isAdmin ? 'admin' : 'committee'}
        onCancel={() => navigate(ROUTES.GALLERY_MEDIA)}
        onSuccess={() => navigate(ROUTES.GALLERY_MEDIA)}
      />
    </div>
  );
}

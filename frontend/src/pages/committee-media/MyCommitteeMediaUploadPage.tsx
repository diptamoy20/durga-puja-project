import { useNavigate } from 'react-router-dom';

import { MediaUploadForm } from '@/components/gallery/MediaUploadForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';

import '@/styles/gallery-admin.css';

export function MyCommitteeMediaUploadPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <PageHeader
        title="Upload Photo or Video"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'My Media', to: ROUTES.MY_COMMITTEE_MEDIA },
          { label: 'Upload' },
        ]}
      />

      <MediaUploadForm
        mode="committee"
        onCancel={() => navigate(ROUTES.MY_COMMITTEE_MEDIA)}
        onSuccess={() => navigate(ROUTES.MY_COMMITTEE_MEDIA)}
      />
    </div>
  );
}

export default MyCommitteeMediaUploadPage;

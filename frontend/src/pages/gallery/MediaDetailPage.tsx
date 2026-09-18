import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/constants/permissions';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { adminMediaService, committeeMediaService } from '@/services/galleryService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { mediaStreamUrl } from '@/utils/galleryHelpers';
import type { CommitteeMedia, MediaModerationStatus } from '@/types/gallery';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

function statusTone(status: MediaModerationStatus): 'default' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    case 'PENDING':
    default:
      return 'warning';
  }
}

interface MediaDetailPageProps {
  mode?: 'admin' | 'committee';
}

export function MediaDetailPage({ mode }: MediaDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();

  const isAdmin = mode === 'admin' || can(PERMISSIONS.MODERATE_MEDIA);
  const listRoute = isAdmin ? ROUTES.GALLERY_MEDIA : ROUTES.MY_COMMITTEE_MEDIA;
  const editRoute = isAdmin ? ROUTES.GALLERY_MEDIA_EDIT : ROUTES.MY_COMMITTEE_MEDIA_EDIT;

  const [media, setMedia] = useState<CommitteeMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [moderateAction, setModerateAction] = useState<MediaModerationStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [busy, setBusy] = useState(false);

  const canModerate = can(PERMISSIONS.MODERATE_MEDIA);
  const canEdit = can(PERMISSIONS.UPLOAD_MEDIA) || canModerate;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetcher = isAdmin ? adminMediaService.get : committeeMediaService.get;
    fetcher(Number(id))
      .then(setMedia)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load media.'))
      .finally(() => setLoading(false));
  }, [id, isAdmin]);

  const handleModerate = async () => {
    if (!moderateAction || !media) return;
    setBusy(true);
    try {
      const updated = await adminMediaService.moderate(
        media.id,
        moderateAction,
        rejectionReason || undefined,
      );
      setMedia(updated);
      toast.success(`Media marked as ${moderateAction.toLowerCase()}.`);
      setModerateAction(null);
      setRejectionReason('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Moderation failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !media) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Media not found.'}</Alert>
        <Link to={listRoute} className="btn btn--secondary btn--md">
          Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-300)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', marginBottom: 'var(--space-100)' }}>
            <Link to={listRoute} className="btn btn--secondary btn--sm">
              ← Back
            </Link>
            <StatusBadge tone={statusTone(media.status)}>{media.status}</StatusBadge>
            <span className="badge badge--info">{media.mediaType}</span>
          </div>
          <h1 className="page__title">{media.title || media.originalFilename}</h1>
          <p className="page__subtitle">
            Uploaded by {media.committee?.committeeName ?? 'Puja Committee'} · {dateTimeFormat.format(new Date(media.createdAt))}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
          {canEdit && (
            <Link to={editRoute(media.id)} className="btn btn--secondary btn--md">
              Edit Media
            </Link>
          )}
          {canModerate && media.status === 'PENDING' && (
            <>
              <Button variant="primary" size="md" onClick={() => setModerateAction('APPROVED')}>
                Approve Media
              </Button>
              <Button variant="danger" size="md" onClick={() => setModerateAction('REJECTED')}>
                Reject Media
              </Button>
            </>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--space-400)' }}>
        <Card title="Preview">
          <div style={{ textAlign: 'center', background: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-md)', padding: 'var(--space-300)' }}>
            {media.mediaType === 'PHOTO' ? (
              <img
                src={mediaStreamUrl(media)}
                alt={media.title || media.originalFilename}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
              />
            ) : (
              <video controls style={{ maxWidth: '100%', maxHeight: '500px' }} src={mediaStreamUrl(media)} />
            )}
          </div>

          {media.description && (
            <div style={{ marginTop: 'var(--space-300)' }}>
              <h3 style={{ fontSize: 'var(--font-sm)', marginBottom: 'var(--space-100)' }}>Description</h3>
              <p>{media.description}</p>
            </div>
          )}
        </Card>

        <Card title="Details">
          <dl className="detail-list">
            <div className="detail-list__row">
              <dt>Committee</dt>
              <dd>{media.committee?.committeeName ?? '—'}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Category</dt>
              <dd>{media.category?.name ?? '—'}</dd>
            </div>
            {media.subcategory && (
              <div className="detail-list__row">
                <dt>Subcategory</dt>
                <dd>{media.subcategory.name}</dd>
              </div>
            )}
            <div className="detail-list__row">
              <dt>Original filename</dt>
              <dd>{media.originalFilename}</dd>
            </div>
            {media.rejectionReason && (
              <div className="detail-list__row">
                <dt>Rejection reason</dt>
                <dd>{media.rejectionReason}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      <ConfirmDialog
        open={moderateAction !== null}
        title={`Confirm: ${moderateAction}`}
        message={
          <div>
            <p>Are you sure you want to mark this media item as <strong>{moderateAction}</strong>?</p>
            {moderateAction === 'REJECTED' && (
              <div style={{ marginTop: 'var(--space-200)' }}>
                <label className="field__label" htmlFor="rejectionReasonInput">
                  Rejection Reason (required)
                </label>
                <textarea
                  id="rejectionReasonInput"
                  className="field__control"
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
          </div>
        }
        confirmLabel={moderateAction === 'APPROVED' ? 'Approve' : 'Reject'}
        destructive={moderateAction === 'REJECTED'}
        busy={busy}
        onConfirm={handleModerate}
        onCancel={() => {
          setModerateAction(null);
          setRejectionReason('');
        }}
      />
    </div>
  );
}

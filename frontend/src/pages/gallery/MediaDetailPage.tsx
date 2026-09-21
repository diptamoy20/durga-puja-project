import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { MediaPreviewThumb } from '@/components/gallery/MediaPreviewThumb';
import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { PERMISSIONS } from '@/constants/permissions';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import { adminMediaService, committeeMediaService } from '@/services/galleryService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { mediaDetailRows, mediaStatusTone, mediaStreamUrl } from '@/utils/galleryHelpers';
import type { CommitteeMedia, MediaModerationStatus } from '@/types/gallery';

import '@/styles/gallery-admin.css';

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
  const listLabel = isAdmin ? 'All Media' : 'My Media';

  const [media, setMedia] = useState<CommitteeMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [moderateAction, setModerateAction] = useState<MediaModerationStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [busy, setBusy] = useState(false);

  const canModerate = can(PERMISSIONS.MODERATE_MEDIA);
  const canEdit = can(PERMISSIONS.EDIT_MEDIA) || can(PERMISSIONS.UPLOAD_MEDIA) || canModerate;

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
    if (moderateAction === 'REJECTED' && !rejectionReason.trim()) {
      toast.warning('Rejection reason is required.');
      return;
    }
    setBusy(true);
    try {
      const updated = await adminMediaService.moderate(
        media.id,
        moderateAction,
        rejectionReason.trim() || undefined,
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
        <div className="media-page-footer">
          <Link to={listRoute} className="btn btn--secondary btn--md">
            <i className="fas fa-arrow-left" aria-hidden="true" /> Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const streamUrl = mediaStreamUrl(media);
  const detailRows = mediaDetailRows(media);
  const displayName = media.title || media.originalFilename;
  const pageTitle = displayName.length > 60 ? `${displayName.slice(0, 60)}…` : displayName;

  return (
    <div className="page">
      <GalleryModuleHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: listLabel, to: listRoute },
          { label: pageTitle },
        ]}
        title={media.title || media.originalFilename}
        subtitle={`${media.committee?.committeeName ?? 'Puja Committee'}${
          media.venueName || media.committee?.venueName
            ? ` · ${media.venueName || media.committee?.venueName}`
            : ''
        }`}
        meta={
          <div className="media-detail-header__meta" style={{ marginBottom: 'var(--space-2)' }}>
            <StatusBadge tone={mediaStatusTone(media.status)}>{media.status}</StatusBadge>
            <span className="media-detail-header__type">{media.mediaType}</span>
          </div>
        }
        actions={
          <>
            {canEdit && (
              <Link to={editRoute(media.id)} className="btn btn--outline-secondary btn--md">
                <i className="fas fa-pencil" aria-hidden="true" /> Edit Media
              </Link>
            )}
            {canModerate && media.status === 'PENDING' && (
              <>
                <Button variant="primary" size="md" onClick={() => setModerateAction('APPROVED')}>
                  <i className="fas fa-check" aria-hidden="true" /> Approve
                </Button>
                <Button variant="danger" size="md" onClick={() => setModerateAction('REJECTED')}>
                  <i className="fas fa-xmark" aria-hidden="true" /> Reject
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="media-detail__grid">
        <Card className="media-detail-card" title="Preview">
          <div className="media-detail__preview">
            {media.mediaType === 'PHOTO' ? (
              <img
                src={streamUrl}
                alt={media.title || media.originalFilename}
                className="media-detail__media"
              />
            ) : (
              <video src={streamUrl} controls className="media-detail__media" preload="metadata" />
            )}
          </div>
          {media.description && (
            <div className="media-detail__description">
              <h3>Description</h3>
              <p>{media.description}</p>
            </div>
          )}
        </Card>

        <Card className="media-detail-card" title="Media Details">
          <dl className="media-detail-list">
            {detailRows.map((row) => (
              <div key={row.label} className="media-detail-list__row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="media-detail__thumbnail">
            <h3 className="media-detail__thumbnail-title">Listing Thumbnail</h3>
            <MediaPreviewThumb item={media} size="lg" />
          </div>
        </Card>
      </div>

      <div className="media-page-footer">
        <Link to={listRoute} className="btn btn--secondary btn--sm">
          <i className="fas fa-arrow-left" aria-hidden="true" /> Back to {listLabel}
        </Link>
      </div>

      <ConfirmDialog
        open={moderateAction !== null}
        title={`Confirm: ${moderateAction}`}
        message={
          <div>
            <p>
              Are you sure you want to mark this media item as <strong>{moderateAction}</strong>?
            </p>
            {moderateAction === 'REJECTED' && (
              <div className="field gallery-dialog-field">
                <label className="field__label" htmlFor="rejectionReasonInput">
                  Rejection Reason <span className="field__required">*</span>
                </label>
                <textarea
                  id="rejectionReasonInput"
                  className="field__control"
                  rows={3}
                  required
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

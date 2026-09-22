import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { MediaPreviewModal } from '@/components/gallery/MediaPreviewModal';
import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { MediaPreviewThumb } from '@/components/gallery/MediaPreviewThumb';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import { albumService, committeeAlbumService } from '@/services/galleryService';
import { formatMediaType } from '@/utils/galleryHelpers';
import type { Album, CommitteeMedia } from '@/types/gallery';

import '@/styles/gallery-admin.css';

interface AlbumDetailPageProps {
  mode: 'admin' | 'committee';
}

export function AlbumDetailPage({ mode }: AlbumDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = mode === 'admin';
  const service = isAdmin ? albumService : committeeAlbumService;
  const listRoute = isAdmin ? ROUTES.GALLERY_ALBUMS : ROUTES.MY_COMMITTEE_ALBUMS;
  const editRoute = isAdmin ? ROUTES.GALLERY_ALBUM_EDIT : ROUTES.MY_COMMITTEE_ALBUM_EDIT;
  const mediaDetailRoute = isAdmin ? ROUTES.GALLERY_DETAIL : ROUTES.MY_COMMITTEE_MEDIA_DETAIL;
  const listLabel = isAdmin ? 'Albums' : 'My Albums';

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<CommitteeMedia | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    service
      .get(Number(id))
      .then(setAlbum)
      .catch((err) => setError(err instanceof Error ? err.message : 'Album not found.'))
      .finally(() => setLoading(false));
  }, [id, service]);

  const handleDelete = async () => {
    if (!album) return;
    setDeleting(true);
    try {
      await service.remove(album.id);
      navigate(listRoute);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error || !album) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Album not found.'}</Alert>
        <div className="media-page-footer">
          <Link to={listRoute} className="btn btn--secondary btn--md">
            <i className="fas fa-arrow-left" aria-hidden="true" /> Back to {listLabel}
          </Link>
        </div>
      </div>
    );
  }

  const mediaItems = album.media ?? [];
  const photoCount = mediaItems.filter((item) => item.mediaType === 'PHOTO').length;
  const videoCount = mediaItems.filter((item) => item.mediaType === 'VIDEO').length;
  const pageTitle = album.title.length > 60 ? `${album.title.slice(0, 60)}…` : album.title;

  return (
    <div className="page">
      <GalleryModuleHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: listLabel, to: listRoute },
          { label: pageTitle },
        ]}
        title={album.title}
        subtitle={`${album.description || 'No description provided.'}${
          isAdmin && album.committee?.committeeName ? ` · ${album.committee.committeeName}` : ''
        }`}
        meta={
          <div className="media-detail-header__meta" style={{ marginBottom: 'var(--space-2)' }}>
            <StatusBadge tone={album.status === 'ACTIVE' ? 'success' : 'default'}>
              {album.status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </StatusBadge>
            <span className="media-detail-header__type">
              {album.isPublic ? 'Public' : 'Private'}
            </span>
            <span className="media-detail-header__type">
              {mediaItems.length} item{mediaItems.length === 1 ? '' : 's'}
            </span>
          </div>
        }
        actions={
          <>
            <Link to={editRoute(album.id)} className="btn btn--outline-secondary btn--md">
              <i className="fas fa-pencil" aria-hidden="true" /> Edit Album
            </Link>
            <Button variant="danger" size="md" onClick={() => setDeleteOpen(true)}>
              <i className="fas fa-trash" aria-hidden="true" /> Delete
            </Button>
          </>
        }
      />

      <div className="album-detail__grid">
        <Card className="media-detail-card" title="Album Details">
          <dl className="media-detail-list">
            <div className="media-detail-list__row">
              <dt>Category</dt>
              <dd>
                {album.category?.name ?? '—'}
                {album.subcategory ? ` / ${album.subcategory.name}` : ''}
              </dd>
            </div>
            {isAdmin && (
              <div className="media-detail-list__row">
                <dt>Committee</dt>
                <dd>{album.committee?.committeeName ?? '—'}</dd>
              </div>
            )}
            <div className="media-detail-list__row">
              <dt>Visibility</dt>
              <dd>{album.isPublic ? 'Public' : 'Private'}</dd>
            </div>
            <div className="media-detail-list__row">
              <dt>Status</dt>
              <dd>
                <StatusBadge tone={album.status === 'ACTIVE' ? 'success' : 'default'}>
                  {album.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </StatusBadge>
              </dd>
            </div>
            <div className="media-detail-list__row">
              <dt>Media items</dt>
              <dd>
                {photoCount} photo{photoCount === 1 ? '' : 's'}, {videoCount} video
                {videoCount === 1 ? '' : 's'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="media-detail-card album-detail__media-card" title="Album Media">
          {mediaItems.length === 0 ? (
            <p className="album-detail__empty">No media assigned to this album yet.</p>
          ) : (
            <>
              <div className="album-form__media-toolbar album-detail__media-toolbar">
                <div className="album-form__media-counts">
                  <strong>{photoCount}</strong> image{photoCount === 1 ? '' : 's'},{' '}
                  <strong>{videoCount}</strong> video{videoCount === 1 ? '' : 's'}
                </div>
              </div>
              <div className="album-form__selected-grid">
                {mediaItems.map((item) => (
                  <div key={item.id} className="album-form__selected-card">
                    <MediaPreviewThumb item={item} size="md" onClick={() => setPreviewItem(item)} />
                    <div className="album-form__selected-body">
                      <div className="album-form__selected-title">
                        {item.title || item.originalFilename}
                      </div>
                      <div className="album-form__selected-type">{formatMediaType(item.mediaType)}</div>
                      <div className="album-form__selected-actions">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setPreviewItem(item)}
                        >
                          Preview
                        </Button>
                        <Link
                          to={mediaDetailRoute(item.id)}
                          className="btn btn--outline-secondary btn--sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="media-page-footer">
        <Link to={listRoute} className="btn btn--secondary btn--sm">
          <i className="fas fa-arrow-left" aria-hidden="true" /> Back to {listLabel}
        </Link>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Album"
        message="Are you sure you want to delete this album? This action cannot be undone."
        confirmLabel="Delete Album"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <MediaPreviewModal
        item={previewItem}
        open={previewItem !== null}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
}

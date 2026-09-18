import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import { albumService, committeeAlbumService } from '@/services/galleryService';
import { mediaStreamUrl, mediaThumbnailUrl } from '@/utils/galleryHelpers';
import type { Album } from '@/types/gallery';

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

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    if (!album || !window.confirm('Delete this album?')) return;
    setDeleting(true);
    try {
      await service.remove(album.id);
      navigate(listRoute);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !album) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Album not found.'}</Alert>
        <Link to={listRoute} className="btn btn--secondary btn--md">Back to albums</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-300)' }}>
        <div>
          <Link to={listRoute} className="btn btn--secondary btn--sm" style={{ marginBottom: 'var(--space-200)' }}>
            ← Back to albums
          </Link>
          <h1 className="page__title">{album.title}</h1>
          <p className="page__subtitle">{album.description || 'No description provided.'}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
          <Link to={editRoute(album.id)} className="btn btn--primary btn--md">Edit Album</Link>
          <Button variant="danger" size="md" disabled={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 2fr)', gap: 'var(--space-400)' }}>
        <Card title="Album Details">
          <dl className="detail-list">
            <dt>Category</dt>
            <dd>{album.category?.name ?? '—'}{album.subcategory ? ` / ${album.subcategory.name}` : ''}</dd>
            {isAdmin && (
              <>
                <dt>Committee</dt>
                <dd>{album.committee?.committeeName ?? '—'}</dd>
              </>
            )}
            <dt>Visibility</dt>
            <dd>{album.isPublic ? 'Public' : 'Private'}</dd>
            <dt>Status</dt>
            <dd>
              <StatusBadge tone={album.status === 'ACTIVE' ? 'success' : 'default'}>
                {album.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </StatusBadge>
            </dd>
            <dt>Media items</dt>
            <dd>{album._count?.media ?? album.media?.length ?? 0}</dd>
          </dl>
        </Card>

        <Card title="Album Media">
          {!album.media?.length ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No media assigned to this album yet.</p>
          ) : (
            <div className="public-gallery__grid">
              {album.media.map((item) => (
                <div key={item.id} className="public-gallery-card" style={{ pointerEvents: 'none' }}>
                  <div className="public-gallery-card__media">
                    {item.mediaType === 'PHOTO' ? (
                      <img src={mediaThumbnailUrl(item)} alt={item.title || item.originalFilename} className="public-gallery-card__thumb" />
                    ) : (
                      <div className="public-gallery-card__video-placeholder"><span>▶</span></div>
                    )}
                  </div>
                  <div className="public-gallery-card__body">
                    <h2 className="public-gallery-card__title">{item.title || item.originalFilename}</h2>
                    {item.mediaType === 'VIDEO' && (
                      <video controls style={{ width: '100%', marginTop: 'var(--space-150)' }} src={mediaStreamUrl(item)} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

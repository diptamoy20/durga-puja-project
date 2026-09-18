import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { publicGalleryService } from '@/services/galleryService';
import { formatMediaType, mediaStreamUrl } from '@/utils/galleryHelpers';
import type { CommitteeMedia } from '@/types/gallery';

import '@/styles/public-gallery.css';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function PublicGalleryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<CommitteeMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    publicGalleryService
      .get(Number(id))
      .then(setMedia)
      .catch((err) => setError(err instanceof Error ? err.message : 'Media not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (error || !media) {
    return (
      <div className="public-gallery">
        <Alert tone="danger">{error ?? 'Media not found.'}</Alert>
        <Link to={ROUTES.PUBLIC_GALLERY} className="public-gallery__back">
          ← Back to gallery
        </Link>
      </div>
    );
  }

  const publishedAt = media.moderatedAt ?? media.createdAt;
  const pandalName = media.venueName || media.committee?.venueName || '—';
  const location = [media.committee?.city, media.committee?.state].filter(Boolean).join(', ') || '—';

  return (
    <div className="public-gallery">
      <Link to={ROUTES.PUBLIC_GALLERY} className="public-gallery__back">
        ← Back to gallery
      </Link>

      <div className="public-gallery-detail">
        <div className="public-gallery-detail__media">
          {media.mediaType === 'PHOTO' ? (
            <img src={mediaStreamUrl(media)} alt={media.title || media.originalFilename} />
          ) : (
            <video controls src={mediaStreamUrl(media)} />
          )}
        </div>

        <aside className="public-gallery-detail__sidebar">
          <span className="public-gallery-card__badge">{formatMediaType(media.mediaType)}</span>
          <h1>{media.title || media.originalFilename}</h1>
          {media.description && <p className="public-gallery-detail__description">{media.description}</p>}
          <hr />
          <dl className="public-gallery-detail__meta">
            <dt>Committee</dt>
            <dd>{media.committee?.committeeName ?? '—'}</dd>
            <dt>Pandal</dt>
            <dd>{pandalName}</dd>
            <dt>Location</dt>
            <dd>{location}</dd>
            <dt>Published</dt>
            <dd>{dateFormat.format(new Date(publishedAt))}</dd>
          </dl>
        </aside>
      </div>
    </div>
  );
}

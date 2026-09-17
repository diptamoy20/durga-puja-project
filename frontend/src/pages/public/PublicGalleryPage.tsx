import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { publicGalleryService } from '@/services/galleryService';
import type { CommitteeMedia, MediaType } from '@/types/gallery';
import type { PaginationMeta } from '@/types';

export function PublicGalleryPage() {
  const [media, setMedia] = useState<CommitteeMedia[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [mediaType, setMediaType] = useState<MediaType | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<CommitteeMedia | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await publicGalleryService.list({
        page,
        perPage: 16,
        mediaType: mediaType || undefined,
        status: 'APPROVED',
      });
      setMedia(res.items);
      setPagination(res.pagination);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, mediaType]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-800)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, marginBottom: 'var(--space-200)' }}>
          Durga Puja Festival Gallery
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Explore vibrant festival captures, artistic pandal architecture, traditional rituals, and celebration highlights.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
          <button
            type="button"
            className={`btn btn--${mediaType === '' ? 'primary' : 'secondary'} btn--sm`}
            onClick={() => {
              setMediaType('');
              setPage(1);
            }}
          >
            All Media
          </button>
          <button
            type="button"
            className={`btn btn--${mediaType === 'PHOTO' ? 'primary' : 'secondary'} btn--sm`}
            onClick={() => {
              setMediaType('PHOTO');
              setPage(1);
            }}
          >
            📷 Photos
          </button>
          <button
            type="button"
            className={`btn btn--${mediaType === 'VIDEO' ? 'primary' : 'secondary'} btn--sm`}
            onClick={() => {
              setMediaType('VIDEO');
              setPage(1);
            }}
          >
            🎬 Videos
          </button>
        </div>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-800)' }}>Loading gallery…</div>
        ) : media.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-800)', color: 'var(--color-text-muted)' }}>
            No media found in this gallery category.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 'var(--space-400)',
            }}
          >
            {media.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  transition: 'transform 0.15s ease',
                }}
                onClick={() => setSelectedMedia(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedMedia(item);
                }}
              >
                <div style={{ height: '200px', background: 'var(--color-surface-sunken)', position: 'relative' }}>
                  {item.mediaType === 'PHOTO' ? (
                    <img
                      src={item.thumbnailPath || item.storedPath}
                      alt={item.title || 'Festival Capture'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                      <span style={{ fontSize: '2.5rem' }}>▶</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: 'var(--space-300)' }}>
                  <h4 style={{ margin: '0 0 var(--space-100) 0', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                    {item.title || item.originalFilename}
                  </h4>
                  <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                    {item.committee?.committeeName ?? 'Puja Committee'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.lastPage > 1 && (
          <Pagination meta={pagination} onPageChange={(p) => setPage(p)} />
        )}
      </Card>

      <Modal
        open={selectedMedia !== null}
        title={selectedMedia?.title || selectedMedia?.originalFilename || 'Media Preview'}
        onClose={() => setSelectedMedia(null)}
      >
        {selectedMedia && (
          <div>
            <div style={{ textAlign: 'center', background: '#000', borderRadius: 'var(--radius-md)', padding: 'var(--space-200)', marginBottom: 'var(--space-300)' }}>
              {selectedMedia.mediaType === 'PHOTO' ? (
                <img
                  src={selectedMedia.storedPath}
                  alt={selectedMedia.title || ''}
                  style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
                />
              ) : (
                <video controls autoPlay style={{ maxWidth: '100%', maxHeight: '600px' }} src={selectedMedia.storedPath} />
              )}
            </div>

            {selectedMedia.description && <p>{selectedMedia.description}</p>}

            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
              {selectedMedia.committee?.committeeName && <span>Committee: {selectedMedia.committee.committeeName} · </span>}
              {selectedMedia.venueName && <span>Venue: {selectedMedia.venueName}</span>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

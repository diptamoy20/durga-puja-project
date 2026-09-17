import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ROUTES } from '@/constants/routes';
import { adminMediaService } from '@/services/galleryService';
import { useToast } from '@/hooks/useToast';
import type { CommitteeMedia, MediaModerationStatus } from '@/types/gallery';
import type { PaginationMeta } from '@/types';

export function ModerationQueuePage() {
  const toast = useToast();

  const [items, setItems] = useState<CommitteeMedia[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionItem, setActionItem] = useState<{ id: number; title: string; decision: MediaModerationStatus } | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminMediaService.moderationQueue({ page, perPage: 12 });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load moderation queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDecision = async () => {
    if (!actionItem) return;
    setBusy(true);
    try {
      await adminMediaService.moderate(actionItem.id, actionItem.decision, reason || undefined);
      toast.success(`Media marked as ${actionItem.decision.toLowerCase()}.`);
      setActionItem(null);
      setReason('');
      load(pagination?.page ?? 1);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ marginBottom: 'var(--space-100)' }}>
            <Link to={ROUTES.GALLERY_MEDIA} className="btn btn--secondary btn--sm">
              ← Back to All Media
            </Link>
          </div>
          <h1 className="page__title">Media Moderation Queue</h1>
          <p className="page__subtitle">Review and approve uploaded photos and videos before they appear in public galleries.</p>
        </div>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-800)' }}>Loading queue…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-800)', color: 'var(--color-text-muted)' }}>
            ✓ The moderation queue is empty! No pending media items to review.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-400)',
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: '180px', background: 'var(--color-surface-sunken)' }}>
                  {item.mediaType === 'PHOTO' ? (
                    <img
                      src={item.thumbnailPath || item.storedPath}
                      alt={item.title || item.originalFilename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span>▶ Video Clip</span>
                    </div>
                  )}
                </div>

                <div style={{ padding: 'var(--space-300)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 var(--space-100) 0', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                      {item.title || item.originalFilename}
                    </h4>
                    <p style={{ margin: '0 0 var(--space-100) 0', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                      Committee: <strong>{item.committee?.committeeName ?? '—'}</strong>
                    </p>
                    {item.venueName && (
                      <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                        Venue: {item.venueName}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
                    <Link to={ROUTES.GALLERY_DETAIL(item.id)} className="btn btn--secondary btn--sm" style={{ flex: 1, textAlign: 'center' }}>
                      Detail
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActionItem({ id: item.id, title: item.title || item.originalFilename, decision: 'APPROVED' })}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setActionItem({ id: item.id, title: item.title || item.originalFilename, decision: 'REJECTED' })}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.lastPage > 1 && (
          <Pagination meta={pagination} onPageChange={(page) => load(page)} />
        )}
      </Card>

      <ConfirmDialog
        open={actionItem !== null}
        title={`Confirm ${actionItem?.decision}: ${actionItem?.title}`}
        message={
          <div>
            <p>Are you sure you want to <strong>{actionItem?.decision}</strong> this item?</p>
            {actionItem?.decision === 'REJECTED' && (
              <div style={{ marginTop: 'var(--space-200)' }}>
                <label className="field__label" htmlFor="queueReason">
                  Rejection Reason (required)
                </label>
                <textarea
                  id="queueReason"
                  className="field__control"
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            )}
          </div>
        }
        confirmLabel={actionItem?.decision === 'APPROVED' ? 'Approve' : 'Reject'}
        destructive={actionItem?.decision === 'REJECTED'}
        busy={busy}
        onConfirm={handleDecision}
        onCancel={() => {
          setActionItem(null);
          setReason('');
        }}
      />
    </div>
  );
}

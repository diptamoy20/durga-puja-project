import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { adminMediaService, committeeMediaService } from '@/services/galleryService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { mediaThumbnailUrl } from '@/utils/galleryHelpers';
import type { CommitteeMedia, MediaListQuery, MediaModerationStatus, MediaType } from '@/types/gallery';
import type { PaginationMeta } from '@/types';

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

export function MediaListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { can } = useAuth();

  const statusParam = searchParams.get('status') as MediaModerationStatus | null;
  const statusFilter = statusParam ?? undefined;

  const [media, setMedia] = useState<CommitteeMedia[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [query, setQuery] = useState<MediaListQuery>({
    page: 1,
    perPage: 16,
    sortDir: 'desc',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Moderation action
  const [moderateAction, setModerateAction] = useState<{ id: number; decision: MediaModerationStatus } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [busy, setBusy] = useState(false);

  const canModerate = can(PERMISSIONS.MODERATE_MEDIA);
  const canUpload = can(PERMISSIONS.UPLOAD_MEDIA);
  const showUpload = canModerate || canUpload;
  const uploadRoute = canModerate ? ROUTES.GALLERY_UPLOAD : ROUTES.MY_COMMITTEE_MEDIA_CREATE;

  const listQuery = useMemo(
    () => ({ ...query, status: statusFilter }),
    [query, statusFilter],
  );

  useEffect(() => {
    setQuery((q) => ({ ...q, page: 1 }));
  }, [statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = canModerate
        ? await adminMediaService.list(listQuery)
        : await committeeMediaService.list(listQuery);
      setMedia(res.items);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load media.');
    } finally {
      setLoading(false);
    }
  }, [listQuery, canModerate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleModerate = async () => {
    if (!moderateAction) return;
    setBusy(true);
    try {
      await adminMediaService.moderate(
        moderateAction.id,
        moderateAction.decision,
        rejectionReason || undefined,
      );
      toast.success(`Media ${moderateAction.decision.toLowerCase()}.`);
      setModerateAction(null);
      setRejectionReason('');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Moderation action failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page__title">Media Gallery</h1>
          <p className="page__subtitle">Browse and manage photos and videos uploaded by puja committees.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
          {canModerate && (
            <Link to={ROUTES.GALLERY_MODERATION} className="btn btn--secondary btn--md">
              Moderation Queue
            </Link>
          )}
          {showUpload && (
            <Link to={uploadRoute} className="btn btn--primary btn--md">
              + Upload Media
            </Link>
          )}
        </div>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="filter-bar">
          <div className="filter-bar__filters" style={{ display: 'flex', gap: 'var(--space-300)', flexWrap: 'wrap' }}>
            <select
              className="field__control"
              value={statusFilter ?? ''}
              onChange={(e) => {
                const s = (e.target.value as MediaModerationStatus) || undefined;
                setQuery((q) => ({ ...q, page: 1 }));
                setSearchParams(s ? { status: s } : {});
              }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              className="field__control"
              value={query.mediaType ?? ''}
              onChange={(e) =>
                setQuery((q) => ({
                  ...q,
                  mediaType: (e.target.value as MediaType) || undefined,
                  page: 1,
                }))
              }
            >
              <option value="">All Media Types</option>
              <option value="PHOTO">Photos</option>
              <option value="VIDEO">Videos</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-800)' }}>Loading media…</div>
        ) : media.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-800)', color: 'var(--color-text-muted)' }}>
            No media found matching current filters.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 'var(--space-400)',
              marginTop: 'var(--space-300)',
            }}
          >
            {media.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--color-surface)',
                }}
              >
                <div style={{ height: '160px', background: 'var(--color-surface-sunken)', position: 'relative' }}>
                  {item.mediaType === 'PHOTO' ? (
                    <img
                      src={mediaThumbnailUrl(item)}
                      alt={item.title || item.originalFilename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                      <span style={{ fontSize: '2rem' }}>▶</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
                  </div>
                </div>

                <div style={{ padding: 'var(--space-300)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 var(--space-100) 0', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                      {item.title || item.originalFilename}
                    </h4>
                    <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                      {item.committee?.committeeName ?? 'General Upload'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-150)', marginTop: 'var(--space-300)' }}>
                    <Link to={ROUTES.GALLERY_DETAIL(item.id)} className="btn btn--secondary btn--sm" style={{ flex: 1, textAlign: 'center' }}>
                      View
                    </Link>
                    {canModerate && item.status === 'PENDING' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setModerateAction({ id: item.id, decision: 'APPROVED' })}
                        >
                          ✓
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setModerateAction({ id: item.id, decision: 'REJECTED' })}
                        >
                          ✕
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.lastPage > 1 && (
          <Pagination
            meta={pagination}
            onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
          />
        )}
      </Card>

      <ConfirmDialog
        open={moderateAction !== null}
        title={`Moderate Media: ${moderateAction?.decision}`}
        message={
          <div>
            <p>Are you sure you want to mark this media as <strong>{moderateAction?.decision}</strong>?</p>
            {moderateAction?.decision === 'REJECTED' && (
              <div style={{ marginTop: 'var(--space-200)' }}>
                <label className="field__label" htmlFor="galleryRejection">
                  Rejection Reason (required)
                </label>
                <textarea
                  id="galleryRejection"
                  className="field__control"
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
          </div>
        }
        confirmLabel={moderateAction?.decision === 'APPROVED' ? 'Approve' : 'Reject'}
        destructive={moderateAction?.decision === 'REJECTED'}
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

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { MediaFiltersBar } from '@/components/gallery/MediaFiltersBar';
import { MediaPreviewModal } from '@/components/gallery/MediaPreviewModal';
import { MediaTable } from '@/components/gallery/MediaTable';
import { ROUTES } from '@/constants/routes';
import { adminMediaService } from '@/services/galleryService';
import { categoryService, subcategoryService } from '@/services/contentService';
import { useToast } from '@/hooks/useToast';
import type { CommitteeMedia, MediaListQuery, MediaModerationStatus, MediaType } from '@/types/gallery';
import type { Category, Subcategory } from '@/types/content';
import type { PaginationMeta } from '@/types';

import '@/styles/gallery-admin.css';

export function ModerationQueuePage() {
  const toast = useToast();

  const [items, setItems] = useState<CommitteeMedia[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState<MediaListQuery>({
    page: 1,
    perPage: 15,
    sortDir: 'desc',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [previewItem, setPreviewItem] = useState<CommitteeMedia | null>(null);
  const [actionItem, setActionItem] = useState<{
    id: number;
    title: string;
    decision: MediaModerationStatus;
  } | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (query.categoryId) {
      subcategoryService
        .list({ categoryId: query.categoryId, perPage: 100, sortDir: 'asc' })
        .then((res) => setSubcategories(res.items))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [query.categoryId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminMediaService.moderationQueue({
        ...query,
        status: 'PENDING',
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load moderation queue.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setQuery((q) => ({ ...q, search: search.trim() || undefined, page: 1 }));
  };

  const handleDecision = async () => {
    if (!actionItem) return;
    if (actionItem.decision === 'REJECTED' && !reason.trim()) {
      toast.warning('Rejection reason is required.');
      return;
    }
    setBusy(true);
    try {
      await adminMediaService.moderate(actionItem.id, actionItem.decision, reason.trim() || undefined);
      toast.success(`Media marked as ${actionItem.decision.toLowerCase()}.`);
      setActionItem(null);
      setReason('');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <Link to={ROUTES.GALLERY_MEDIA} className="btn btn--secondary btn--sm" style={{ marginBottom: 'var(--space-200)' }}>
            ← Back to All Media
          </Link>
          <h1 className="page__title">Pending Moderation</h1>
          <p className="page__subtitle">
            Review and approve uploaded photos and videos before they appear in public galleries.
          </p>
        </div>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <MediaFiltersBar
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          showStatusFilter={false}
          mediaType={query.mediaType}
          onMediaTypeChange={(mediaType: MediaType | undefined) =>
            setQuery((q) => ({ ...q, mediaType, page: 1 }))
          }
          categoryId={query.categoryId}
          onCategoryChange={(categoryId) =>
            setQuery((q) => ({ ...q, categoryId, subcategoryId: undefined, page: 1 }))
          }
          subcategoryId={query.subcategoryId}
          onSubcategoryChange={(subcategoryId) =>
            setQuery((q) => ({ ...q, subcategoryId, page: 1 }))
          }
          categories={categories}
          subcategories={subcategories}
        />

        <MediaTable
          items={items}
          loading={loading}
          detailRoute={ROUTES.GALLERY_DETAIL}
          editRoute={ROUTES.GALLERY_MEDIA_EDIT}
          canEdit
          canModerate
          onPreview={setPreviewItem}
          onApprove={(item) =>
            setActionItem({
              id: item.id,
              title: item.title || item.originalFilename,
              decision: 'APPROVED',
            })
          }
          onReject={(item) =>
            setActionItem({
              id: item.id,
              title: item.title || item.originalFilename,
              decision: 'REJECTED',
            })
          }
          emptyMessage="The moderation queue is empty. No pending media items to review."
        />

        {pagination && pagination.lastPage > 1 && (
          <Pagination meta={pagination} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
        )}
      </Card>

      <MediaPreviewModal
        item={previewItem}
        open={previewItem !== null}
        onClose={() => setPreviewItem(null)}
      />

      <ConfirmDialog
        open={actionItem !== null}
        title={`Confirm ${actionItem?.decision}: ${actionItem?.title}`}
        message={
          <div>
            <p>
              Are you sure you want to <strong>{actionItem?.decision}</strong> this item?
            </p>
            {actionItem?.decision === 'REJECTED' && (
              <div className="field" style={{ marginTop: 'var(--space-200)' }}>
                <label className="field__label" htmlFor="queueReason">
                  Rejection Reason *
                </label>
                <textarea
                  id="queueReason"
                  className="field__control"
                  rows={3}
                  required
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

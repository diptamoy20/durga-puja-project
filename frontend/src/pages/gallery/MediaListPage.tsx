import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { MediaFiltersBar } from '@/components/gallery/MediaFiltersBar';
import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { MediaPreviewModal } from '@/components/gallery/MediaPreviewModal';
import { MediaTable } from '@/components/gallery/MediaTable';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { adminMediaService, committeeMediaService } from '@/services/galleryService';
import { categoryService, subcategoryService } from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { CommitteeMedia, MediaListQuery, MediaModerationStatus } from '@/types/gallery';
import type { Category, Subcategory } from '@/types/content';
import type { PaginationMeta } from '@/types';

import '@/styles/gallery-admin.css';

export function MediaListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { can } = useAuth();

  const statusParam = searchParams.get('status') as MediaModerationStatus | null;
  const statusFilter = statusParam ?? undefined;

  const [media, setMedia] = useState<CommitteeMedia[]>([]);
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
  const [moderateAction, setModerateAction] = useState<{ id: number; decision: MediaModerationStatus } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [busy, setBusy] = useState(false);

  const canModerate = can(PERMISSIONS.MODERATE_MEDIA);
  const canUpload = can(PERMISSIONS.UPLOAD_MEDIA);
  const canEdit = can(PERMISSIONS.EDIT_MEDIA) || can(PERMISSIONS.UPLOAD_MEDIA) || canModerate;
  const showUpload = canModerate || canUpload;
  const uploadRoute = canModerate ? ROUTES.GALLERY_UPLOAD : ROUTES.MY_COMMITTEE_MEDIA_CREATE;
  const editRoute = canModerate ? ROUTES.GALLERY_MEDIA_EDIT : ROUTES.MY_COMMITTEE_MEDIA_EDIT;

  const pageTitle = statusFilter
    ? `${statusFilter.charAt(0)}${statusFilter.slice(1).toLowerCase()} Media`
    : 'All Media';

  const listQuery = useMemo(
    () => ({ ...query, status: statusFilter }),
    [query, statusFilter],
  );

  useEffect(() => {
    setQuery((q) => ({ ...q, page: 1 }));
  }, [statusFilter]);

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

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setQuery((q) => ({ ...q, search: search.trim() || undefined, page: 1 }));
  };

  const handleModerate = async () => {
    if (!moderateAction) return;
    if (moderateAction.decision === 'REJECTED' && !rejectionReason.trim()) {
      toast.warning('Rejection reason is required.');
      return;
    }
    setBusy(true);
    try {
      await adminMediaService.moderate(
        moderateAction.id,
        moderateAction.decision,
        rejectionReason.trim() || undefined,
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
      <GalleryModuleHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'All Media' },
        ]}
        title={pageTitle}
        subtitle={
          statusFilter
            ? `Showing ${statusFilter.charAt(0)}${statusFilter.slice(1).toLowerCase()} media submissions.`
            : 'Browse and manage photos and videos uploaded by puja committees.'
        }
        actions={
          <>
            {canModerate && (
              <Link to={ROUTES.GALLERY_MODERATION} className="btn btn--outline-primary btn--md">
                <i className="fas fa-clock" aria-hidden="true" /> Moderation Queue
              </Link>
            )}
            {showUpload && (
              <Link to={uploadRoute} className="btn btn--primary btn--md">
                <i className="fas fa-cloud-arrow-up" aria-hidden="true" /> Upload Media
              </Link>
            )}
          </>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="media-list-card">
        <MediaFiltersBar
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          status={statusFilter}
          onStatusChange={(status) => {
            setQuery((q) => ({ ...q, page: 1 }));
            setSearchParams(status ? { status } : {});
          }}
          mediaType={query.mediaType}
          onMediaTypeChange={(mediaType) => setQuery((q) => ({ ...q, mediaType, page: 1 }))}
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
          items={media}
          loading={loading}
          detailRoute={canModerate ? ROUTES.GALLERY_DETAIL : ROUTES.MY_COMMITTEE_MEDIA_DETAIL}
          editRoute={editRoute}
          canEdit={canEdit}
          canModerate={canModerate}
          onPreview={setPreviewItem}
          onApprove={(item) => setModerateAction({ id: item.id, decision: 'APPROVED' })}
          onReject={(item) => setModerateAction({ id: item.id, decision: 'REJECTED' })}
        />

        {pagination && pagination.lastPage > 1 && (
          <div className="media-list-card__pagination">
            <Pagination
              meta={pagination}
              onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
            />
          </div>
        )}
      </Card>

      <MediaPreviewModal
        item={previewItem}
        open={previewItem !== null}
        onClose={() => setPreviewItem(null)}
      />

      <ConfirmDialog
        open={moderateAction !== null}
        title={`Moderate Media: ${moderateAction?.decision}`}
        message={
          <div>
            <p>
              Are you sure you want to mark this media as{' '}
              <strong>{moderateAction?.decision}</strong>?
            </p>
            {moderateAction?.decision === 'REJECTED' && (
              <div className="field gallery-dialog-field">
                <label className="field__label" htmlFor="galleryRejection">
                  Rejection Reason <span className="field__required">*</span>
                </label>
                <textarea
                  id="galleryRejection"
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

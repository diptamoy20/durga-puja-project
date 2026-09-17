import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { formatCommitteeStatus } from '@/constants/committee';
import { categoryService, subcategoryService } from '@/services/contentService';
import { committeeMediaService } from '@/services/galleryService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Category, Subcategory } from '@/types/content';
import type { CommitteeMedia, MediaListQuery, MediaModerationStatus, MediaType } from '@/types/gallery';
import type { PaginationMeta } from '@/types';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function mediaStatusTone(status: MediaModerationStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    default:
      return 'warning';
  }
}

export function MyCommitteeMediaListPage() {
  const toast = useToast();
  const { can } = useAuth();
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState<CommitteeMedia[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [query, setQuery] = useState<MediaListQuery>({
    page: 1,
    perPage: 12,
    sortDir: 'desc',
    status: (searchParams.get('status') as MediaModerationStatus) || undefined,
  });
  const [draftSearch, setDraftSearch] = useState('');
  const [draftPandal, setDraftPandal] = useState('');
  const [draftMediaType, setDraftMediaType] = useState<MediaType | ''>('');
  const [draftCategoryId, setDraftCategoryId] = useState<number | ''>('');
  const [draftSubcategoryId, setDraftSubcategoryId] = useState<number | ''>('');
  const [draftStatus, setDraftStatus] = useState<MediaModerationStatus | ''>(query.status ?? '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canUpload = can(PERMISSIONS.UPLOAD_MEDIA);

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (draftCategoryId) {
      subcategoryService
        .list({ categoryId: Number(draftCategoryId), perPage: 100, sortDir: 'asc' })
        .then((res) => setSubcategories(res.items))
        .catch(() => {});
    } else {
      setSubcategories([]);
    }
  }, [draftCategoryId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await committeeMediaService.list(query);
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load media.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((current) => ({
      ...current,
      search: draftSearch.trim() || undefined,
      mediaType: draftMediaType || undefined,
      categoryId: draftCategoryId ? Number(draftCategoryId) : undefined,
      subcategoryId: draftSubcategoryId ? Number(draftSubcategoryId) : undefined,
      status: draftStatus || undefined,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setDraftSearch('');
    setDraftPandal('');
    setDraftMediaType('');
    setDraftCategoryId('');
    setDraftSubcategoryId('');
    setDraftStatus('');
    setQuery({ page: 1, perPage: 12, sortDir: 'desc' });
  };

  const handleDelete = async (media: CommitteeMedia) => {
    if (!window.confirm('Delete this media item?')) return;
    try {
      await committeeMediaService.remove(media.id);
      toast.success('Media deleted.');
      void load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="My Media"
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'My Media' }]}
        actions={
          canUpload ? (
            <Link to={ROUTES.MY_COMMITTEE_MEDIA_CREATE} className="btn btn--primary btn--md">
              Upload Media
            </Link>
          ) : undefined
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="mb-4">
        <form className="form-grid form-grid--3" onSubmit={applyFilters}>
          <div className="field">
            <label className="field__label" htmlFor="mediaSearch">Search</label>
            <input id="mediaSearch" className="field__control" value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="mediaPandal">Pandal</label>
            <input id="mediaPandal" className="field__control" value={draftPandal} onChange={(e) => setDraftPandal(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="mediaType">Media type</label>
            <select id="mediaType" className="field__control" value={draftMediaType} onChange={(e) => setDraftMediaType(e.target.value as MediaType | '')}>
              <option value="">All types</option>
              <option value="PHOTO">Photo</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="mediaCategory">Category</label>
            <select id="mediaCategory" className="field__control" value={draftCategoryId} onChange={(e) => setDraftCategoryId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="mediaSubcategory">Subcategory</label>
            <select id="mediaSubcategory" className="field__control" value={draftSubcategoryId} onChange={(e) => setDraftSubcategoryId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">All subcategories</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="mediaStatus">Status</label>
            <select id="mediaStatus" className="field__control" value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as MediaModerationStatus | '')}>
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="field" style={{ alignSelf: 'end' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button type="submit" variant="primary" size="md">Filter</Button>
              <Button type="button" variant="secondary" size="md" onClick={resetFilters}>Reset</Button>
            </div>
          </div>
        </form>
      </Card>

      <Card title="Media uploads">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Type</th>
                <th>Pandal</th>
                <th>Status</th>
                <th>Processing</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="detail-empty">Loading media…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9} className="detail-empty">No media uploads yet.</td></tr>
              ) : (
                items.map((media) => (
                  <tr key={media.id}>
                    <td>{media.title || media.originalFilename}</td>
                    <td>{media.category?.name ?? '—'}</td>
                    <td>{media.subcategory?.name ?? '—'}</td>
                    <td>{media.mediaType.charAt(0) + media.mediaType.slice(1).toLowerCase()}</td>
                    <td>{media.venueName ?? '—'}</td>
                    <td><StatusBadge tone={mediaStatusTone(media.status)}>{formatCommitteeStatus(media.status)}</StatusBadge></td>
                    <td>{formatCommitteeStatus(media.processingStatus ?? 'PENDING')}</td>
                    <td>{dateFormat.format(new Date(media.createdAt))}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Link to={ROUTES.MY_COMMITTEE_MEDIA_DETAIL(media.id)} className="btn btn--secondary btn--sm">View</Link>
                        {(media.status === 'PENDING' || media.status === 'REJECTED') && (
                          <Button variant="danger" size="sm" onClick={() => void handleDelete(media)}>Delete</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.lastPage > 1 && (
          <Pagination meta={pagination} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
        )}
      </Card>
    </div>
  );
}

export default MyCommitteeMediaListPage;

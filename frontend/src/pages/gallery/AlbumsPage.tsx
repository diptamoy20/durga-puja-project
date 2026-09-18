import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import { albumService } from '@/services/galleryService';
import { categoryService, subcategoryService } from '@/services/contentService';
import { adminAtlasService } from '@/services/atlasService';
import { useToast } from '@/hooks/useToast';
import type { Album, MediaListQuery } from '@/types/gallery';
import type { Category, Subcategory } from '@/types/content';
import type { AtlasFormCommitteeOption } from '@/types/atlas';
import type { PaginationMeta } from '@/types';

export function AlbumsPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [committees, setCommittees] = useState<AtlasFormCommitteeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Album | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [query, setQuery] = useState<MediaListQuery>({ page: 1, perPage: 15, sortDir: 'desc' });
  const [draftSearch, setDraftSearch] = useState(searchParams.get('search') ?? '');
  const [draftCommitteeId, setDraftCommitteeId] = useState(searchParams.get('puja_committee_id') ?? '');
  const [draftCategoryId, setDraftCategoryId] = useState(searchParams.get('category_id') ?? '');
  const [draftSubcategoryId, setDraftSubcategoryId] = useState(searchParams.get('subcategory_id') ?? '');
  const [draftStatus, setDraftStatus] = useState(searchParams.get('status') ?? '');
  const [draftVisibility, setDraftVisibility] = useState(searchParams.get('visibility') ?? '');

  const listQuery = useMemo(
    () => ({
      ...query,
      search: searchParams.get('search') || undefined,
      pujaCommitteeId: searchParams.get('puja_committee_id') ? Number(searchParams.get('puja_committee_id')) : undefined,
      categoryId: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined,
      subcategoryId: searchParams.get('subcategory_id') ? Number(searchParams.get('subcategory_id')) : undefined,
      albumStatus: (searchParams.get('status') as 'ACTIVE' | 'INACTIVE' | null) || undefined,
      visibility: (searchParams.get('visibility') as 'public' | 'private' | null) || undefined,
    }),
    [query, searchParams],
  );

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.items)).catch(() => {});
    adminAtlasService.formOptions().then((opts) => setCommittees(opts.committees)).catch(() => {});
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
      const res = await albumService.list(listQuery);
      setAlbums(res.items);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load albums.');
    } finally {
      setLoading(false);
    }
  }, [listQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (draftSearch.trim()) params.search = draftSearch.trim();
    if (draftCommitteeId) params.puja_committee_id = draftCommitteeId;
    if (draftCategoryId) params.category_id = draftCategoryId;
    if (draftSubcategoryId) params.subcategory_id = draftSubcategoryId;
    if (draftStatus) params.status = draftStatus;
    if (draftVisibility) params.visibility = draftVisibility;
    setSearchParams(params);
    setQuery((q) => ({ ...q, page: 1 }));
  };

  const resetFilters = () => {
    setDraftSearch('');
    setDraftCommitteeId('');
    setDraftCategoryId('');
    setDraftSubcategoryId('');
    setDraftStatus('');
    setDraftVisibility('');
    setSearchParams({});
    setQuery({ page: 1, perPage: 15, sortDir: 'desc' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await albumService.remove(deleteTarget.id);
      toast.success('Album deleted.');
      setDeleteTarget(null);
      void load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-300)' }}>
        <div>
          <h1 className="page__title">Albums</h1>
          <p className="page__subtitle">Organize approved committee media into albums.</p>
        </div>
        <Link to={ROUTES.GALLERY_ALBUM_NEW} className="btn btn--primary btn--md">
          + Create Album
        </Link>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="filter-bar">
          <form className="filter-bar__search" onSubmit={applyFilters}>
            <input
              type="search"
              className="field__control"
              placeholder="Search title or description"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
            <select className="field__control" value={draftCommitteeId} onChange={(e) => setDraftCommitteeId(e.target.value)}>
              <option value="">All committees</option>
              {committees.map((c) => <option key={c.id} value={c.id}>{c.committeeName}</option>)}
            </select>
            <select className="field__control" value={draftCategoryId} onChange={(e) => setDraftCategoryId(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <select className="field__control" value={draftSubcategoryId} onChange={(e) => setDraftSubcategoryId(e.target.value)}>
              <option value="">All subcategories</option>
              {subcategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
            <select className="field__control" value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <select className="field__control" value={draftVisibility} onChange={(e) => setDraftVisibility(e.target.value)}>
              <option value="">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <Button type="submit" variant="secondary" size="md">Filter</Button>
            <Button type="button" variant="secondary" size="md" onClick={resetFilters}>Reset</Button>
          </form>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Committee</th>
                <th>Media</th>
                <th>Visibility</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>Loading albums…</td></tr>
              ) : albums.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>No albums found.</td></tr>
              ) : (
                albums.map((album) => (
                  <tr key={album.id}>
                    <td>
                      <strong>{album.title}</strong>
                      {album.description && (
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>{album.description}</div>
                      )}
                    </td>
                    <td>
                      {album.category?.name ?? '—'}
                      {album.subcategory && <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>{album.subcategory.name}</div>}
                    </td>
                    <td>{album.committee?.committeeName ?? '—'}</td>
                    <td>{album._count?.media ?? album.media?.length ?? 0}</td>
                    <td>{album.isPublic ? 'Public' : 'Private'}</td>
                    <td>
                      <StatusBadge tone={album.status === 'ACTIVE' ? 'success' : 'default'}>
                        {album.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="committee-row-actions">
                        <Link to={ROUTES.GALLERY_ALBUM_DETAIL(album.id)} className="btn btn--secondary btn--sm">View</Link>
                        <Link to={ROUTES.GALLERY_ALBUM_EDIT(album.id)} className="btn btn--secondary btn--sm">Edit</Link>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(album)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.lastPage > 1 && (
          <Pagination meta={pagination} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
        )}
      </Card>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Album"
        message={`Delete album "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

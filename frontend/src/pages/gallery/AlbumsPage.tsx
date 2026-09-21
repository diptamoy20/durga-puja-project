import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/Badge';
import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { albumService } from '@/services/galleryService';
import { categoryService, subcategoryService } from '@/services/contentService';
import { adminAtlasService } from '@/services/atlasService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Album, MediaListQuery } from '@/types/gallery';
import type { Category, Subcategory } from '@/types/content';
import type { AtlasFormCommitteeOption } from '@/types/atlas';
import type { PaginationMeta } from '@/types';

import '@/styles/gallery-admin.css';

export function AlbumsPage() {
  const toast = useToast();
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_ALBUMS);
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
      pujaCommitteeId: searchParams.get('puja_committee_id')
        ? Number(searchParams.get('puja_committee_id'))
        : undefined,
      categoryId: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined,
      subcategoryId: searchParams.get('subcategory_id')
        ? Number(searchParams.get('subcategory_id'))
        : undefined,
      albumStatus: (searchParams.get('status') as 'ACTIVE' | 'INACTIVE' | null) || undefined,
      visibility: (searchParams.get('visibility') as 'public' | 'private' | null) || undefined,
    }),
    [query, searchParams],
  );

  const hasActiveFilters = Boolean(
    searchParams.get('search') ||
      searchParams.get('puja_committee_id') ||
      searchParams.get('category_id') ||
      searchParams.get('subcategory_id') ||
      searchParams.get('status') ||
      searchParams.get('visibility'),
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
        .catch(() => setDraftSubcategoryId(''));
    } else {
      setSubcategories([]);
      setDraftSubcategoryId('');
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
      <GalleryModuleHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Albums' },
        ]}
        title="Albums"
        subtitle="Organize approved committee media into curated albums for public galleries."
        actions={
          canManage ? (
            <Link to={ROUTES.GALLERY_ALBUM_NEW} className="btn btn--primary btn--md">
              <i className="fas fa-circle-plus" aria-hidden="true" /> Create Album
            </Link>
          ) : undefined
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="media-list-card">
        <form className="media-filters media-filters--albums" onSubmit={applyFilters}>
          <div className="media-filters__field media-filters__field--search">
            <label className="media-filters__label" htmlFor="album-search">
              Search
            </label>
            <div className="media-filters__search-group">
              <span className="media-filters__search-icon" aria-hidden="true">
                <i className="fas fa-search" />
              </span>
              <input
                id="album-search"
                type="search"
                className="field__control media-filters__search-input"
                placeholder="Search title or description…"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="media-filters__field">
            <label className="media-filters__label" htmlFor="album-committee">
              Committee
            </label>
            <select
              id="album-committee"
              className="field__control"
              value={draftCommitteeId}
              onChange={(e) => setDraftCommitteeId(e.target.value)}
            >
              <option value="">All Committees</option>
              {committees.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.committeeName}
                </option>
              ))}
            </select>
          </div>

          <div className="media-filters__field">
            <label className="media-filters__label" htmlFor="album-category">
              Category
            </label>
            <select
              id="album-category"
              className="field__control"
              value={draftCategoryId}
              onChange={(e) => setDraftCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {subcategories.length > 0 && (
            <div className="media-filters__field">
              <label className="media-filters__label" htmlFor="album-subcategory">
                Subcategory
              </label>
              <select
                id="album-subcategory"
                className="field__control"
                value={draftSubcategoryId}
                onChange={(e) => setDraftSubcategoryId(e.target.value)}
              >
                <option value="">All Subcategories</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="media-filters__field">
            <label className="media-filters__label" htmlFor="album-status">
              Status
            </label>
            <select
              id="album-status"
              className="field__control"
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="media-filters__field">
            <label className="media-filters__label" htmlFor="album-visibility">
              Visibility
            </label>
            <select
              id="album-visibility"
              className="field__control"
              value={draftVisibility}
              onChange={(e) => setDraftVisibility(e.target.value)}
            >
              <option value="">All Visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="media-filters__actions">
            <Button type="submit" variant="primary" size="md">
              <i className="fas fa-filter" aria-hidden="true" /> Filter
            </Button>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn--secondary btn--md"
                onClick={resetFilters}
                title="Reset filters"
              >
                <i className="fas fa-rotate-left" aria-hidden="true" />
              </button>
            )}
          </div>
        </form>

        <div className="table-wrapper media-table-wrapper">
          <table className="table media-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Committee</th>
                <th>Media</th>
                <th>Visibility</th>
                <th>Status</th>
                <th className="table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="table__placeholder">
                    Loading albums…
                  </td>
                </tr>
              ) : albums.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table__placeholder">
                    No albums found matching current filters.
                  </td>
                </tr>
              ) : (
                albums.map((album) => (
                  <tr key={album.id}>
                    <td>
                      <span className="table__primary">{album.title}</span>
                      {album.description && (
                        <span className="table__secondary media-table__description">
                          {album.description}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="table__primary">{album.category?.name ?? '—'}</span>
                      {album.subcategory && (
                        <span className="table__secondary">{album.subcategory.name}</span>
                      )}
                    </td>
                    <td className="media-table__committee">{album.committee?.committeeName ?? '—'}</td>
                    <td>
                      <span className="album-media-count">{album._count?.media ?? album.media?.length ?? 0}</span>
                    </td>
                    <td>
                      <StatusBadge tone={album.isPublic ? 'info' : 'default'}>
                        {album.isPublic ? 'Public' : 'Private'}
                      </StatusBadge>
                    </td>
                    <td>
                      <StatusBadge tone={album.status === 'ACTIVE' ? 'success' : 'default'}>
                        {album.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </td>
                    <td className="table__actions">
                      <div className="media-table__actions">
                        <div className="media-action-group">
                          <Link
                            to={ROUTES.GALLERY_ALBUM_DETAIL(album.id)}
                            className="media-action-btn"
                            title="View album"
                          >
                            <i className="fas fa-eye" aria-hidden="true" />
                          </Link>
                          {canManage && (
                            <>
                              <Link
                                to={ROUTES.GALLERY_ALBUM_EDIT(album.id)}
                                className="media-action-btn"
                                title="Edit album"
                              >
                                <i className="fas fa-pencil" aria-hidden="true" />
                              </Link>
                              <button
                                type="button"
                                className="media-action-btn media-action-btn--danger"
                                title="Delete album"
                                onClick={() => setDeleteTarget(album)}
                              >
                                <i className="fas fa-trash" aria-hidden="true" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.lastPage > 1 && (
          <div className="media-list-card__pagination">
            <Pagination meta={pagination} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
          </div>
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

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
import { committeeAlbumService } from '@/services/galleryService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Category, Subcategory } from '@/types/content';
import type { Album } from '@/types/gallery';
import type { MediaListQuery } from '@/types/gallery';
import type { PaginationMeta } from '@/types';

export function CommitteeAlbumListPage() {
  const toast = useToast();
  const { can } = useAuth();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [query, setQuery] = useState<MediaListQuery>({ page: 1, perPage: 12, sortDir: 'desc' });
  const [draftSearch, setDraftSearch] = useState('');
  const [draftCategoryId, setDraftCategoryId] = useState<number | ''>('');
  const [draftSubcategoryId, setDraftSubcategoryId] = useState<number | ''>('');
  const [draftStatus, setDraftStatus] = useState<'ACTIVE' | 'INACTIVE' | ''>('');
  const [draftVisibility, setDraftVisibility] = useState<'public' | 'private' | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManage = can(PERMISSIONS.MANAGE_ALBUMS);

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
      const result = await committeeAlbumService.list(query);
      setAlbums(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load albums.');
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
      categoryId: draftCategoryId ? Number(draftCategoryId) : undefined,
      subcategoryId: draftSubcategoryId ? Number(draftSubcategoryId) : undefined,
      albumStatus: draftStatus || undefined,
      page: 1,
    }));
  };

  const handleDelete = async (album: Album) => {
    if (!window.confirm('Delete this album?')) return;
    try {
      await committeeAlbumService.remove(album.id);
      toast.success('Album deleted.');
      void load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const filteredAlbums = albums.filter((album) => {
    if (draftVisibility === 'public') return album.isPublic;
    if (draftVisibility === 'private') return !album.isPublic;
    return true;
  });

  return (
    <div className="page">
      <PageHeader
        title="My Albums"
        description="Organize approved committee media into albums."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'My Albums' }]}
        actions={
          canManage ? (
            <Link to={ROUTES.MY_COMMITTEE_ALBUM_NEW} className="btn btn--primary btn--md">
              Create Album
            </Link>
          ) : undefined
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="mb-4">
        <form className="form-grid form-grid--3" onSubmit={applyFilters}>
          <div className="field">
            <label className="field__label" htmlFor="albumSearch">Search</label>
            <input id="albumSearch" className="field__control" placeholder="Search title or description" value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="albumCategory">Category</label>
            <select id="albumCategory" className="field__control" value={draftCategoryId} onChange={(e) => setDraftCategoryId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="albumSubcategory">Subcategory</label>
            <select id="albumSubcategory" className="field__control" value={draftSubcategoryId} onChange={(e) => setDraftSubcategoryId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">All</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="albumStatus">Status</label>
            <select id="albumStatus" className="field__control" value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | '')}>
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="albumVisibility">Visibility</label>
            <select id="albumVisibility" className="field__control" value={draftVisibility} onChange={(e) => setDraftVisibility(e.target.value as 'public' | 'private' | '')}>
              <option value="">All</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="field" style={{ alignSelf: 'end' }}>
            <Button type="submit" variant="primary" size="md">Filter</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Media</th>
                <th>Visibility</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="detail-empty">Loading albums…</td></tr>
              ) : filteredAlbums.length === 0 ? (
                <tr><td colSpan={6} className="detail-empty">No albums found.</td></tr>
              ) : (
                filteredAlbums.map((album) => (
                  <tr key={album.id}>
                    <td>
                      <strong>{album.title}</strong>
                      {album.description && (
                        <div className="detail-field__label">{album.description.slice(0, 60)}{album.description.length > 60 ? '…' : ''}</div>
                      )}
                    </td>
                    <td>
                      {album.category?.name ?? '—'}
                      {album.subcategory && <div className="detail-field__label">{album.subcategory.name}</div>}
                    </td>
                    <td><span className="badge badge--info">{album._count?.media ?? album.media?.length ?? 0}</span></td>
                    <td>{album.isPublic ? 'Public' : 'Private'}</td>
                    <td><StatusBadge tone={album.status === 'ACTIVE' ? 'success' : 'default'}>{formatCommitteeStatus(album.status)}</StatusBadge></td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Link to={ROUTES.MY_COMMITTEE_ALBUM_DETAIL(album.id)} className="btn btn--secondary btn--sm">View</Link>
                        {canManage && (
                          <>
                            <Link to={ROUTES.MY_COMMITTEE_ALBUM_EDIT(album.id)} className="btn btn--secondary btn--sm">Edit</Link>
                            <Button variant="danger" size="sm" onClick={() => void handleDelete(album)}>Delete</Button>
                          </>
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

export default CommitteeAlbumListPage;

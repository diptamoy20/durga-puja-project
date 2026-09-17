import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { categoryService, subcategoryService } from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Category, RecordStatusType, Subcategory, SubcategoryListQuery } from '@/types/content';
import type { PaginationMeta } from '@/types';

const STATUS_OPTIONS: Array<{ value: RecordStatusType | ''; label: string }> = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

function truncate(text: string | null | undefined, max = 60): string {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

export function SubcategoriesPage() {
  const toast = useToast();
  const { can } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [query, setQuery] = useState<SubcategoryListQuery>({ page: 1, perPage: 10, sortDir: 'asc' });
  const [draftSearch, setDraftSearch] = useState('');
  const [draftCategoryId, setDraftCategoryId] = useState<number | ''>('');
  const [draftStatus, setDraftStatus] = useState<RecordStatusType | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingSub, setDeletingSub] = useState<Subcategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = can(PERMISSIONS.MANAGE_CATEGORIES);

  useEffect(() => {
    categoryService
      .list({ perPage: 100, sortDir: 'asc' })
      .then((res) => setCategories(res.items))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subcategoryService.list(query);
      setSubcategories(res.items);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subcategories.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((current) => ({
      ...current,
      search: draftSearch.trim() || undefined,
      categoryId: draftCategoryId || undefined,
      status: draftStatus || undefined,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setDraftSearch('');
    setDraftCategoryId('');
    setDraftStatus('');
    setQuery({ page: 1, perPage: 10, sortDir: 'asc' });
  };

  const handleDelete = async () => {
    if (!deletingSub) return;
    setDeleting(true);
    try {
      await subcategoryService.remove(deletingSub.id);
      toast.success('Subcategory deleted successfully.');
      setDeletingSub(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete subcategory.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Subcategories"
        description="Manage subcategories under master categories."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Subcategories' }]}
        actions={
          canManage ? (
            <Link to={ROUTES.SUBCATEGORY_NEW} className="btn btn--primary btn--md">
              Create Subcategory
            </Link>
          ) : undefined
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="mb-4">
        <form className="form-grid form-grid--3" onSubmit={applyFilters}>
          <div className="field">
            <label className="field__label" htmlFor="subSearch">
              Search
            </label>
            <input
              id="subSearch"
              type="search"
              className="field__control"
              placeholder="Search by name, slug, description..."
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="subCategoryFilter">
              Category
            </label>
            <select
              id="subCategoryFilter"
              className="field__control"
              value={draftCategoryId}
              onChange={(e) => setDraftCategoryId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="subStatusFilter">
              Status
            </label>
            <select
              id="subStatusFilter"
              className="field__control"
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value as RecordStatusType | '')}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ alignSelf: 'end' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button type="submit" variant="primary" size="md">
                Filter
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <Card>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Slug</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Loading subcategories…
                  </td>
                </tr>
              ) : subcategories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    No subcategories found.
                  </td>
                </tr>
              ) : (
                subcategories.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sub.name}</div>
                      {sub.description && (
                        <div className="detail-subtitle">{truncate(sub.description)}</div>
                      )}
                    </td>
                    <td>{sub.category?.name ?? categories.find((c) => c.id === sub.categoryId)?.name ?? '—'}</td>
                    <td>
                      <code>{sub.slug}</code>
                    </td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-150)', justifyContent: 'flex-end' }}>
                        <Link to={ROUTES.SUBCATEGORY_DETAIL(sub.id)} className="btn btn--secondary btn--sm">
                          View
                        </Link>
                        {canManage && (
                          <>
                            <Link to={ROUTES.SUBCATEGORY_EDIT(sub.id)} className="btn btn--secondary btn--sm">
                              Edit
                            </Link>
                            <Button variant="danger" size="sm" onClick={() => setDeletingSub(sub)}>
                              Delete
                            </Button>
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

        <Pagination pagination={pagination} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
      </Card>

      <ConfirmDialog
        open={deletingSub !== null}
        title="Delete Subcategory"
        message={`Are you sure you want to delete subcategory "${deletingSub?.name}"?`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingSub(null)}
      />
    </div>
  );
}

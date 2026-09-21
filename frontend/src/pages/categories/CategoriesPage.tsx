import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { categoryService } from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Category, CategoryListQuery, RecordStatusType } from '@/types/content';
import type { PaginationMeta } from '@/types';

const STATUS_OPTIONS: Array<{ value: RecordStatusType | ''; label: string }> = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function truncate(text: string | null | undefined, max = 60): string {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

export function CategoriesPage() {
  const toast = useToast();
  const { can } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [query, setQuery] = useState<CategoryListQuery>({ page: 1, perPage: 10, sortDir: 'asc' });
  const [draftSearch, setDraftSearch] = useState('');
  const [draftStatus, setDraftStatus] = useState<RecordStatusType | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = can(PERMISSIONS.MANAGE_CATEGORIES);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.list(query);
      setCategories(res.items);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load categories.');
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
      status: draftStatus || undefined,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setDraftSearch('');
    setDraftStatus('');
    setQuery({ page: 1, perPage: 10, sortDir: 'asc' });
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      await categoryService.remove(deletingCategory.id);
      toast.success('Category deleted successfully.');
      setDeletingCategory(null);
      load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to delete category.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Categories"
        description="Manage master categories for the portal."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Categories' }]}
        actions={
          canManage ? (
            <Link to={ROUTES.CATEGORY_NEW} className="btn btn--primary btn--md">
              Create Category
            </Link>
          ) : undefined
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="mb-4">
        <form className="form-grid form-grid--3" onSubmit={applyFilters}>
          <div className="field">
            <label className="field__label" htmlFor="catSearch">
              Search
            </label>
            <input
              id="catSearch"
              type="search"
              className="field__control"
              placeholder="Search by name, slug, description..."
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="catStatusFilter">
              Status
            </label>
            <select
              id="catStatusFilter"
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
                <th>Slug</th>
                <th>Subcategories</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Loading categories…
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{cat.name}</div>
                      {cat.description && (
                        <div className="detail-subtitle">{truncate(cat.description)}</div>
                      )}
                    </td>
                    <td>
                      <code>{cat.slug}</code>
                    </td>
                    <td>
                      <Badge variant="info">{cat._count?.subcategories ?? 0}</Badge>
                    </td>
                    <td>
                      <StatusBadge status={cat.status} />
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-150)', justifyContent: 'flex-end' }}>
                        <Link to={ROUTES.CATEGORY_DETAIL(cat.id)} className="btn btn--secondary btn--sm">
                          View
                        </Link>
                        {canManage && (
                          <>
                            <Link to={ROUTES.CATEGORY_EDIT(cat.id)} className="btn btn--secondary btn--sm">
                              Edit
                            </Link>
                            <Button variant="danger" size="sm" onClick={() => setDeletingCategory(cat)}>
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
        open={deletingCategory !== null}
        title="Delete Category"
        message={
          deletingCategory?._count?.subcategories && deletingCategory._count.subcategories > 0
            ? `Are you sure you want to delete category "${deletingCategory.name}"? This will also delete its ${deletingCategory._count.subcategories} subcategory(ies).`
            : `Are you sure you want to delete category "${deletingCategory?.name}"?`
        }
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}

export function formatCategoryDate(value: string): string {
  return dateFormat.format(new Date(value));
}

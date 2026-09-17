import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { articleService } from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Article, ArticleListQuery, ArticleStatus } from '@/types/content';
import type { PaginationMeta } from '@/types';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const STATUS_OPTIONS: Array<{ value: ArticleStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ARCHIVED', label: 'Archived' },
];

function statusTone(status: ArticleStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted' {
  switch (status) {
    case 'PUBLISHED':
      return 'success';
    case 'APPROVED':
      return 'info';
    case 'PENDING_REVIEW':
    case 'IN_REVIEW':
      return 'warning';
    case 'REJECTED':
      return 'danger';
    case 'ARCHIVED':
    case 'DRAFT':
    default:
      return 'muted';
  }
}

export function ArticleListPage() {
  const toast = useToast();
  const { can } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [query, setQuery] = useState<ArticleListQuery>({ page: 1, perPage: 15, sortDir: 'desc' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = can(PERMISSIONS.CREATE_ARTICLES);
  const canEdit = can(PERMISSIONS.EDIT_ARTICLES);
  const canDelete = can(PERMISSIONS.DELETE_ARTICLES);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, statsRes] = await Promise.all([
        articleService.list(query),
        articleService.stats().catch(() => ({})),
      ]);
      setArticles(res.items);
      setPagination(res.pagination);
      setStats(statsRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load articles.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((q) => ({ ...q, search: search.trim() || undefined, page: 1 }));
  };

  const handleDelete = async () => {
    if (!deletingArticle) return;
    setDeleting(true);
    try {
      await articleService.remove(deletingArticle.id);
      toast.success('Article deleted.');
      setDeletingArticle(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete article.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page__title">Articles & News</h1>
          <p className="page__subtitle">Create, review, and publish festival content.</p>
        </div>
        {canCreate && (
          <Link to={ROUTES.ARTICLE_NEW} className="btn btn--primary btn--md">
            + New Article
          </Link>
        )}
      </header>

      {stats && Object.keys(stats).length > 0 && (
        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-card__label">Total Articles</p>
            <p className="stat-card__value">{Object.values(stats).reduce((a, b) => a + b, 0)}</p>
          </div>
          <div className="stat-card stat-card--success">
            <p className="stat-card__label">Published</p>
            <p className="stat-card__value">{stats.PUBLISHED ?? 0}</p>
          </div>
          <div className="stat-card stat-card--warning">
            <p className="stat-card__label">In Review / Pending</p>
            <p className="stat-card__value">{(stats.IN_REVIEW ?? 0) + (stats.PENDING_REVIEW ?? 0)}</p>
          </div>
          <div className="stat-card stat-card--info">
            <p className="stat-card__label">Drafts</p>
            <p className="stat-card__value">{stats.DRAFT ?? 0}</p>
          </div>
        </div>
      )}

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="filter-bar">
          <form className="filter-bar__search" onSubmit={handleSearch}>
            <input
              type="search"
              className="field__control"
              placeholder="Search articles by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="secondary" size="md">
              Search
            </Button>
          </form>

          <div className="filter-bar__filters">
            <select
              className="field__control"
              value={query.status ?? ''}
              onChange={(e) =>
                setQuery((q) => ({
                  ...q,
                  status: (e.target.value as ArticleStatus) || undefined,
                  page: 1,
                }))
              }
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    Loading articles…
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    No articles found.
                  </td>
                </tr>
              ) : (
                articles.map((art) => (
                  <tr key={art.id}>
                    <td>
                      <div>
                        <strong>{art.title}</strong>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                          /{art.slug}
                        </div>
                      </div>
                    </td>
                    <td>{art.subcategory?.name ?? '—'}</td>
                    <td>{art.author?.name ?? '—'}</td>
                    <td>
                      <StatusBadge tone={statusTone(art.status)}>{art.status}</StatusBadge>
                    </td>
                    <td>{art.publishedAt ? dateTimeFormat.format(new Date(art.publishedAt)) : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-150)' }}>
                        <Link to={ROUTES.ARTICLE_DETAIL(art.id)} className="btn btn--secondary btn--sm">
                          View
                        </Link>
                        {canEdit && (
                          <Link to={ROUTES.ARTICLE_EDIT(art.id)} className="btn btn--secondary btn--sm">
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <Button variant="danger" size="sm" onClick={() => setDeletingArticle(art)}>
                            Delete
                          </Button>
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
          <Pagination
            meta={pagination}
            onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
          />
        )}
      </Card>

      <ConfirmDialog
        open={deletingArticle !== null}
        title="Delete Article"
        message={`Are you sure you want to delete "${deletingArticle?.title}"?`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingArticle(null)}
      />
    </div>
  );
}

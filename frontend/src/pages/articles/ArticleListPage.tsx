import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { articleService, categoryService } from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import type { Article, ArticleListQuery, ArticleStatus, Category } from '@/types/content';
import type { PaginationMeta } from '@/types';
import {
  ARTICLE_LIST_LABEL,
  ARTICLE_STAT_CARDS,
  articleFileUrl,
  articleListRoute,
  articleListSubtitle,
  articleListTitle,
  articleStatusTone,
  formatArticleStatus,
  formatDateTime,
  type ArticleStats,
} from '@/utils/articleHelpers';

import '@/styles/articles-admin.css';

const STATUS_OPTIONS: Array<{ value: ArticleStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'APPROVED', label: 'Pending Approval' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export function ArticleListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = useAuth();

  const statusParam = searchParams.get('status') as ArticleStatus | null;
  const statusFilter = statusParam ?? undefined;

  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState<ArticleListQuery>({ page: 1, perPage: 15, sortDir: 'desc' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreate = can(PERMISSIONS.CREATE_ARTICLES);
  const canEdit = can(PERMISSIONS.EDIT_ARTICLES);

  const listQuery = useMemo(
    () => ({ ...query, status: statusFilter }),
    [query, statusFilter],
  );

  useEffect(() => {
    setQuery((q) => ({ ...q, page: 1, search: undefined }));
    setSearch('');
  }, [statusFilter]);

  useEffect(() => {
    categoryService.listActive().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, statsRes] = await Promise.all([
        articleService.list(listQuery),
        articleService.stats().catch(() => null),
      ]);
      setArticles(res.items);
      setPagination(res.pagination);
      if (statsRes) {
        setStats(statsRes as unknown as ArticleStats);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load articles.');
    } finally {
      setLoading(false);
    }
  }, [listQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((q) => ({ ...q, search: search.trim() || undefined, page: 1 }));
  };

  const resetFilters = () => {
    setSearch('');
    setQuery({ page: 1, perPage: 15, sortDir: 'desc' });
    setSearchParams(statusFilter ? { status: statusFilter } : {});
  };

  const filteredArticles = useMemo(() => {
    if (!query.categoryId) return articles;
    return articles.filter((a) => a.subcategory?.category?.id === query.categoryId);
  }, [articles, query.categoryId]);

  return (
    <div className="page">
      <GalleryModuleHeader
        breadcrumbs={
          statusFilter
            ? [
                { label: 'Dashboard', to: ROUTES.DASHBOARD },
                { label: ARTICLE_LIST_LABEL, to: ROUTES.ARTICLES },
                { label: articleListTitle(statusFilter) },
              ]
            : [
                { label: 'Dashboard', to: ROUTES.DASHBOARD },
                { label: ARTICLE_LIST_LABEL },
              ]
        }
        title={articleListTitle(statusFilter)}
        subtitle={articleListSubtitle(statusFilter)}
        actions={
          canCreate ? (
            <Link to={ROUTES.ARTICLE_NEW} className="btn btn--primary btn--md">
              <i className="fas fa-circle-plus" aria-hidden="true" /> New Article
            </Link>
          ) : undefined
        }
      />

      {stats && (
        <div className="articles-admin__stats">
          {ARTICLE_STAT_CARDS.map((card) => {
            const value = stats[card.key] ?? 0;
            const active = card.status ? statusFilter === card.status : !statusFilter;
            const href = card.status ? articleListRoute(card.status) : ROUTES.ARTICLES;
            return (
              <Link
                key={card.key}
                to={href}
                className={`articles-stat-card${active ? ' is-active' : ''}`}
              >
                <div className={`articles-stat-card__icon${card.tone ? ` articles-stat-card__icon--${card.tone}` : ''}`}>
                  <i className={`fas ${card.icon}`} aria-hidden="true" />
                </div>
                <div>
                  <p className="articles-stat-card__label">{card.label}</p>
                  <p className="articles-stat-card__value">{value}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="articles-filter-card">
        <form className="articles-filters" onSubmit={handleFilterSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="artSearch">Search</label>
            <div className="articles-filters__search-wrap">
              <span className="articles-filters__search-icon" aria-hidden="true">
                <i className="fas fa-search" />
              </span>
              <input
                id="artSearch"
                type="search"
                className="field__control articles-filters__search-input"
                placeholder="Title, slug, or author…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="artCategory">Category</label>
            <select
              id="artCategory"
              className="field__control"
              value={query.categoryId ?? ''}
              onChange={(e) =>
                setQuery((q) => ({
                  ...q,
                  categoryId: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                }))
              }
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="artStatus">Status</label>
            <select
              id="artStatus"
              className="field__control"
              value={statusFilter ?? ''}
              onChange={(e) => {
                const s = (e.target.value as ArticleStatus) || undefined;
                setQuery((q) => ({ ...q, page: 1 }));
                setSearchParams(s ? { status: s } : {});
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="artCreated">Created Date</label>
            <input
              id="artCreated"
              type="date"
              className="field__control"
              value={query.createdDate ?? ''}
              onChange={(e) =>
                setQuery((q) => ({ ...q, createdDate: e.target.value || undefined, page: 1 }))
              }
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="artPublished">Published Date</label>
            <input
              id="artPublished"
              type="date"
              className="field__control"
              value={query.publishedDate ?? ''}
              onChange={(e) =>
                setQuery((q) => ({ ...q, publishedDate: e.target.value || undefined, page: 1 }))
              }
            />
          </div>

          <div className="field articles-filters__actions-wrap">
            <span className="field__label articles-filters__actions-label" aria-hidden="true">
              &nbsp;
            </span>
            <div className="articles-filters__actions">
              <button type="submit" className="btn btn--primary btn--md" title="Apply filters">
                <i className="fas fa-filter" aria-hidden="true" />
              </button>
              <button type="button" className="btn btn--outline-secondary btn--md" title="Reset filters" onClick={resetFilters}>
                <i className="fas fa-rotate-left" aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <Card className="articles-list-card">
        <div className="articles-table-wrapper">
          <table className="articles-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Thumbnail</th>
                <th>Article Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Published</th>
                <th>Scheduled</th>
                <th>Last Updated</th>
                <th className="text-end" style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="articles-table__empty">Loading articles…</td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="articles-table__empty">
                      <div className="articles-table__empty-icon" aria-hidden="true">
                        <i className="fas fa-newspaper" />
                      </div>
                      <strong>No articles found</strong>
                      <p>Try adjusting your search criteria or create a new article.</p>
                      {canCreate && (
                        <Link to={ROUTES.ARTICLE_NEW} className="btn btn--primary btn--sm">
                          <i className="fas fa-circle-plus" aria-hidden="true" /> New Article
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => {
                  const thumb = art.featuredImage ? articleFileUrl(art.featuredImage) : '';
                  return (
                    <tr key={art.id}>
                      <td>
                        {thumb ? (
                          <img src={thumb} alt="" className="articles-table__thumb" />
                        ) : (
                          <div className="articles-table__thumb-placeholder" aria-hidden="true">
                            <i className="fas fa-image" />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="articles-table__title">{art.title}</div>
                        <div className="articles-table__slug">{art.slug}</div>
                      </td>
                      <td>
                        <span className="articles-table__category">
                          <i className="fas fa-tag" aria-hidden="true" />
                          {art.subcategory?.category?.name ?? art.subcategory?.name ?? 'Uncategorized'}
                        </span>
                      </td>
                      <td>{art.author?.name ?? 'Unknown'}</td>
                      <td>
                        <StatusBadge tone={articleStatusTone(art.status)}>
                          {formatArticleStatus(art.status)}
                        </StatusBadge>
                      </td>
                      <td className="articles-table__date">{formatDateTime(art.publishedAt)}</td>
                      <td className="articles-table__date">{formatDateTime(art.scheduledAt)}</td>
                      <td className="articles-table__date">{formatDateTime(art.updatedAt ?? art.createdAt)}</td>
                      <td>
                        <div className="articles-table__actions">
                          <Link
                            to={ROUTES.ARTICLE_DETAIL(art.id)}
                            className="articles-action-btn"
                            title="View details"
                            aria-label={`View ${art.title}`}
                          >
                            <i className="fas fa-eye" aria-hidden="true" />
                          </Link>
                          <Link
                            to={ROUTES.ARTICLE_PREVIEW(art.id)}
                            target="_blank"
                            className="articles-action-btn"
                            title="Preview article"
                            aria-label={`Preview ${art.title}`}
                          >
                            <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
                          </Link>
                          {canEdit && (
                            <Link
                              to={ROUTES.ARTICLE_EDIT(art.id)}
                              className="articles-action-btn articles-action-btn--primary"
                              title="Edit article"
                              aria-label={`Edit ${art.title}`}
                            >
                              <i className="fas fa-pencil" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.lastPage > 1 && (
          <div className="articles-list-card__pagination">
            <Pagination meta={pagination} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
          </div>
        )}
      </Card>
    </div>
  );
}

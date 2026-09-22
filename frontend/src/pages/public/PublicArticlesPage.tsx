import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Pagination } from '@/components/ui/Pagination';
import { ROUTES } from '@/constants/routes';
import { publicNewsService } from '@/services/contentService';
import type { Article } from '@/types/content';
import type { PaginationMeta } from '@/types';
import { articleCategoryName, articleFeaturedImageUrl, formatArticleDate } from '@/utils/articleHelpers';

import '@/styles/public-articles.css';

export function PublicArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('category_id') ?? '';
  const page = Number(searchParams.get('page') ?? '1') || 1;

  const [draftSearch, setDraftSearch] = useState(search);
  const [draftCategoryId, setDraftCategoryId] = useState(categoryId);

  useEffect(() => {
    setDraftSearch(search);
    setDraftCategoryId(categoryId);
  }, [search, categoryId]);

  const listQuery = useMemo(
    () => ({
      page,
      perPage: 12,
      search: search || undefined,
      sortBy: 'publishedAt' as const,
      sortDir: 'desc' as const,
    }),
    [page, search],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await publicNewsService.list(listQuery);
      setArticles(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load news articles:', err);
      setArticles([]);
      setPagination(undefined);
      setError('Unable to load news articles at this time.');
    } finally {
      setLoading(false);
    }
  }, [listQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryOptions = useMemo(() => {
    const map = new Map<number, string>();
    articles.forEach((article) => {
      const cat = article.subcategory?.category;
      if (cat) map.set(cat.id, cat.name);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [articles]);

  const visibleArticles = useMemo(() => {
    if (!categoryId) return articles;
    const selectedId = Number(categoryId);
    if (!selectedId) return articles;
    return articles.filter((article) => article.subcategory?.category?.id === selectedId);
  }, [articles, categoryId]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (draftSearch.trim()) params.search = draftSearch.trim();
    if (draftCategoryId) params.category_id = draftCategoryId;
    setSearchParams(params);
  };

  return (
    <div className="public-articles">
      <section className="public-articles__hero">
        <div className="public-articles__hero-watermark" aria-hidden="true">
          📰
        </div>
        <div className="public-articles__hero-inner">
          <div className="public-articles__eyebrow">
            <span aria-hidden="true">🌺</span> Dept. of Tourism, Govt. of West Bengal
          </div>
          <h1 className="public-articles__title">News &amp; Stories</h1>
          <p className="public-articles__lead">
            Published articles on Durga Puja heritage, pandals, artisans, diaspora homecomings, and festival culture
            from across Bengal and the world.
          </p>
        </div>
      </section>

      <div className="public-articles__filter-card">
        <form className="public-articles__filter-form" onSubmit={applyFilters}>
          <div className="public-articles__filter-field">
            <label htmlFor="newsSearch">Search</label>
            <input
              id="newsSearch"
              type="search"
              className="field__control"
              placeholder="Search titles and excerpts"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
          </div>
          {categoryOptions.length > 0 && (
            <div className="public-articles__filter-field">
              <label htmlFor="newsCategory">Category</label>
              <select
                id="newsCategory"
                className="field__control"
                value={draftCategoryId}
                onChange={(e) => setDraftCategoryId(e.target.value)}
              >
                <option value="">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="public-articles__filter-actions">
            <button type="submit" className="btn btn--primary btn--md">
              Filter
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="public-articles__state">
          <div className="public-articles__state-icon" aria-hidden="true">
            📰
          </div>
          <div>Loading articles…</div>
        </div>
      ) : error ? (
        <div className="public-articles__state">{error}</div>
      ) : visibleArticles.length === 0 ? (
        <div className="public-articles__empty">
          No published articles found for the selected filters.
        </div>
      ) : (
        <div className="public-articles__grid">
          {visibleArticles.map((article) => (
            <Link
              key={article.id}
              to={ROUTES.PUBLIC_NEWS_DETAIL(article.slug)}
              className="public-articles-card"
            >
              <div className="public-articles-card__media">
                <img
                  src={articleFeaturedImageUrl(article.featuredImage)}
                  alt={article.title}
                  className="public-articles-card__thumb"
                />
              </div>
              <div className="public-articles-card__body">
                <span className="public-articles-card__category">{articleCategoryName(article)}</span>
                <h2 className="public-articles-card__title">{article.title}</h2>
                {article.excerpt && <p className="public-articles-card__excerpt">{article.excerpt}</p>}
                <p className="public-articles-card__meta">
                  {article.author?.name ?? 'Editorial'} · {formatArticleDate(article.publishedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.lastPage > 1 && !categoryId && (
        <div className="public-articles__pagination">
          <Pagination
            meta={pagination}
            onPageChange={(nextPage) => {
              const params = Object.fromEntries(searchParams.entries());
              params.page = String(nextPage);
              setSearchParams(params);
            }}
          />
        </div>
      )}
    </div>
  );
}

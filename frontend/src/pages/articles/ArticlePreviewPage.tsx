import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { articleService } from '@/services/contentService';
import type { Article } from '@/types/content';
import { articleFileUrl, formatDateTime } from '@/utils/articleHelpers';

import '@/styles/articles-admin.css';

export function ArticlePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    articleService
      .get(Number(id))
      .then(setArticle)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load article preview.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (error || !article) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Article not found.'}</Alert>
        <Link to={ROUTES.ARTICLES} className="btn btn--secondary btn--md">Back to Articles</Link>
      </div>
    );
  }

  const featuredUrl = article.featuredImage ? articleFileUrl(article.featuredImage) : '';
  const categoryLabel = article.subcategory?.category?.name ?? article.subcategory?.name ?? 'Uncategorized';
  const dateLabel = article.scheduledAt
    ? formatDateTime(article.scheduledAt)
    : formatDateTime(article.publishedAt);

  return (
    <div className="page">
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link to={ROUTES.ARTICLE_DETAIL(article.id)} className="btn btn--outline-secondary btn--sm">
          <i className="fas fa-arrow-left" aria-hidden="true" /> Back to Article
        </Link>
      </div>

      <article className="gallery-widget-card article-preview-page">
        <div className="gallery-widget-card__body" style={{ padding: 'var(--space-5)' }}>
          {featuredUrl && (
            <img src={featuredUrl} alt={article.title} className="article-preview-page__featured" />
          )}

          <p className="article-preview-page__meta">
            {categoryLabel} | {article.author?.name ?? 'Unknown'} | {dateLabel}
          </p>

          <h1 className="article-preview-page__title">{article.title}</h1>

          {article.excerpt && (
            <p style={{ color: 'var(--colour-ink-soft)', fontSize: '1.0625rem', marginBottom: 'var(--space-4)' }}>
              {article.excerpt}
            </p>
          )}

          <div
            className="article-content-preview"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>
    </div>
  );
}

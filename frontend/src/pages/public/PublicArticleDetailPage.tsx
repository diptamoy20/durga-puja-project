import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { publicNewsService } from '@/services/contentService';
import type { Article } from '@/types/content';
import { articleCategoryName, articleFeaturedImageUrl, formatArticleDate } from '@/utils/articleHelpers';

import '@/styles/public-articles.css';

export function PublicArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    void loadArticle(slug);
  }, [slug]);

  const loadArticle = async (articleSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await publicNewsService.getBySlug(articleSlug);
      setArticle(data);
    } catch (err) {
      console.error('Failed to load article:', err);
      setError('Unable to load this article. It may have been moved or removed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="public-articles-detail">
        <div className="public-articles-detail__state">
          <div className="public-articles__state-icon" aria-hidden="true">
            📰
          </div>
          <div>Loading article…</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="public-articles-detail">
        <div className="public-articles-detail__state">
          <h2>Article Not Found</h2>
          <p>{error ?? 'The requested article could not be retrieved.'}</p>
          <Link to={ROUTES.PUBLIC_NEWS} className="btn btn--primary btn--md">
            ← Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="public-articles-detail">
      <nav className="public-articles-detail__breadcrumb" aria-label="Breadcrumb">
        <Link to={ROUTES.PUBLIC_NEWS}>News</Link>
        <span aria-hidden="true">/</span>
        <span>{article.title}</span>
      </nav>

      {article.featuredImage && (
        <div className="public-articles-detail__featured">
          <img src={articleFeaturedImageUrl(article.featuredImage)} alt={article.title} />
        </div>
      )}

      <p className="public-articles-detail__meta">
        {articleCategoryName(article)} | {article.author?.name ?? 'Editorial'} |{' '}
        {formatArticleDate(article.publishedAt)}
      </p>

      <h1 className="public-articles-detail__title">{article.title}</h1>

      {article.excerpt && <p className="public-articles-detail__excerpt">{article.excerpt}</p>}

      <div
        className="public-articles-detail__content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}

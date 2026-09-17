import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/constants/permissions';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { articleService } from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Article, ArticleStatus, ArticleWorkflowAction } from '@/types/content';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

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

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [workflowAction, setWorkflowAction] = useState<ArticleWorkflowAction | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const canEdit = can(PERMISSIONS.EDIT_ARTICLES);
  const canPublish = can(PERMISSIONS.PUBLISH_ARTICLES);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    articleService
      .get(Number(id))
      .then(setArticle)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load article.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleWorkflow = async () => {
    if (!workflowAction || !article) return;
    setBusy(true);
    try {
      const updated = await articleService.workflow(article.id, workflowAction, { comment: comment || undefined });
      setArticle(updated);
      toast.success(`Article state changed to ${updated.status}.`);
      setWorkflowAction(null);
      setComment('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Workflow action failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !article) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Article not found.'}</Alert>
        <Link to={ROUTES.ARTICLES} className="btn btn--secondary btn--md">
          Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-300)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', marginBottom: 'var(--space-100)' }}>
            <Link to={ROUTES.ARTICLES} className="btn btn--secondary btn--sm">
              ← Back
            </Link>
            <StatusBadge tone={statusTone(article.status)}>{article.status}</StatusBadge>
            {article.isFeatured && <span className="badge badge--warning">★ Featured</span>}
          </div>
          <h1 className="page__title">{article.title}</h1>
          <p className="page__subtitle">
            Slug: <code>{article.slug}</code> · Subcategory: <strong>{article.subcategory?.name}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
          {canEdit && (
            <Link to={ROUTES.ARTICLE_EDIT(article.id)} className="btn btn--secondary btn--md">
              Edit Article
            </Link>
          )}

          {article.status === 'DRAFT' && (
            <Button variant="primary" size="md" onClick={() => setWorkflowAction('submit_for_review')}>
              Submit for Review
            </Button>
          )}

          {canPublish && article.status === 'PENDING_REVIEW' && (
            <Button variant="primary" size="md" onClick={() => setWorkflowAction('start_review')}>
              Start Review
            </Button>
          )}

          {canPublish && article.status === 'IN_REVIEW' && (
            <>
              <Button variant="primary" size="md" onClick={() => setWorkflowAction('approve')}>
                Approve
              </Button>
              <Button variant="danger" size="md" onClick={() => setWorkflowAction('reject')}>
                Reject
              </Button>
            </>
          )}

          {canPublish && article.status === 'APPROVED' && (
            <Button variant="primary" size="md" onClick={() => setWorkflowAction('publish')}>
              Publish Now
            </Button>
          )}

          {canPublish && article.status === 'PUBLISHED' && (
            <Button variant="secondary" size="md" onClick={() => setWorkflowAction('archive')}>
              Archive
            </Button>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--space-400)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
          <Card title="Article Content">
            {article.featuredImage && (
              <div style={{ marginBottom: 'var(--space-400)' }}>
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  style={{ width: '100%', maxHeight: '360px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
              </div>
            )}

            {article.excerpt && (
              <p style={{ fontSize: 'var(--font-md)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-300)' }}>
                {article.excerpt}
              </p>
            )}

            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {article.content}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
          <Card title="Metadata & Publishing">
            <dl className="detail-list">
              <div><dt>Author</dt><dd>{article.author?.name ?? '—'}</dd></div>
              <div><dt>Status</dt><dd><StatusBadge tone={statusTone(article.status)}>{article.status}</StatusBadge></dd></div>
              <div><dt>Created</dt><dd>{dateTimeFormat.format(new Date(article.createdAt))}</dd></div>
              <div><dt>Published At</dt><dd>{article.publishedAt ? dateTimeFormat.format(new Date(article.publishedAt)) : 'Not Published'}</dd></div>
              <div><dt>Allow Comments</dt><dd>{article.allowComments ? 'Yes' : 'No'}</dd></div>
            </dl>
          </Card>

          {(article.seoTitle || article.seoKeywords || article.seoDescription) && (
            <Card title="SEO Settings">
              <dl className="detail-list">
                <div><dt>SEO Title</dt><dd>{article.seoTitle || '—'}</dd></div>
                <div><dt>Keywords</dt><dd>{article.seoKeywords || '—'}</dd></div>
                <div><dt>Description</dt><dd>{article.seoDescription || '—'}</dd></div>
              </dl>
            </Card>
          )}

          {article.histories && article.histories.length > 0 && (
            <Card title="Workflow History">
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Status</th>
                      <th>Comment</th>
                      <th>By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {article.histories.map((h) => (
                      <tr key={h.id}>
                        <td><strong>{h.action}</strong></td>
                        <td>{h.newStatus ?? '—'}</td>
                        <td>{h.comment ?? '—'}</td>
                        <td>{h.user?.name ?? 'System'}</td>
                        <td>{dateTimeFormat.format(new Date(h.createdAt))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={workflowAction !== null}
        title={`Confirm Workflow: ${workflowAction}`}
        message={
          <div>
            <p>Perform <strong>{workflowAction}</strong> on article "{article.title}"?</p>
            <div style={{ marginTop: 'var(--space-200)' }}>
              <label className="field__label" htmlFor="wfComment">Comment / Reason (optional)</label>
              <textarea
                id="wfComment"
                className="field__control"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        }
        confirmLabel="Confirm"
        destructive={workflowAction === 'reject'}
        busy={busy}
        onConfirm={handleWorkflow}
        onCancel={() => {
          setWorkflowAction(null);
          setComment('');
        }}
      />
    </div>
  );
}

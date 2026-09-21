import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { articleService } from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Article, ArticleWorkflowAction } from '@/types/content';
import {
  articleFileUrl,
  articleListRoute,
  ARTICLE_LIST_LABEL,
  articleStatusTone,
  formatArticleStatus,
  formatDateTime,
} from '@/utils/articleHelpers';

import '@/styles/articles-admin.css';

interface WorkflowConfig {
  action: ArticleWorkflowAction;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  requiresComment?: boolean;
  requiresSchedule?: boolean;
  hideComment?: boolean;
}

function getWorkflowActions(
  article: Article,
  canEdit: boolean,
  canReview: boolean,
  canApprove: boolean,
  canPublish: boolean,
): WorkflowConfig[] {
  const actions: WorkflowConfig[] = [];
  const { status } = article;

  if ((status === 'DRAFT' || status === 'REJECTED') && canEdit) {
    actions.push({ action: 'submit_for_review', label: 'Submit for Review', variant: 'primary', hideComment: true });
  }

  if (status === 'PENDING_REVIEW' && canReview) {
    actions.push({ action: 'start_review', label: 'Start Review', variant: 'secondary', hideComment: true });
  }

  if (status === 'PENDING_REVIEW' || status === 'IN_REVIEW') {
    if (canReview) {
      actions.push(
        { action: 'return_to_draft', label: 'Send Back to Draft', variant: 'secondary', requiresComment: true },
        { action: 'reject', label: 'Reject', variant: 'danger', requiresComment: true },
      );
    }
    if (canApprove) {
      actions.push({ action: 'approve', label: 'Approve', variant: 'primary', hideComment: true });
    }
  }

  if (status === 'APPROVED' && canPublish) {
    actions.push(
      { action: 'publish', label: 'Publish Now', variant: 'primary', hideComment: true },
      { action: 'schedule', label: 'Schedule', variant: 'secondary', requiresSchedule: true },
    );
  }

  if (status === 'SCHEDULED' && canPublish) {
    actions.push({ action: 'publish', label: 'Publish Now', variant: 'primary', hideComment: true });
  }

  if (status === 'PUBLISHED' && canPublish) {
    actions.push({ action: 'archive', label: 'Archive', variant: 'secondary', hideComment: true });
  }

  return actions;
}

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig | null>(null);
  const [comment, setComment] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [busy, setBusy] = useState(false);

  const canEdit = can(PERMISSIONS.EDIT_ARTICLES);
  const canReview = can(PERMISSIONS.REVIEW_ARTICLES);
  const canApprove = can(PERMISSIONS.APPROVE_ARTICLES);
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

  const workflowActions = useMemo(
    () =>
      article ? getWorkflowActions(article, canEdit, canReview, canApprove, canPublish) : [],
    [article, canEdit, canReview, canApprove, canPublish],
  );

  const handleWorkflow = async () => {
    if (!workflowConfig || !article) return;

    if (workflowConfig.requiresComment && !comment.trim()) {
      toast.warning('A reason or comment is required for this action.');
      return;
    }

    let scheduledAt: string | undefined;
    if (workflowConfig.requiresSchedule) {
      if (!scheduleDate || !scheduleTime) {
        toast.warning('Please set a publish date and time.');
        return;
      }
      scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    }

    setBusy(true);
    try {
      const updated = await articleService.workflow(article.id, workflowConfig.action, {
        comment: comment.trim() || undefined,
        scheduledAt,
      });
      setArticle(updated);
      toast.success(`Article ${formatArticleStatus(updated.status).toLowerCase()}.`);
      setWorkflowConfig(null);
      setComment('');
      setScheduleDate('');
      setScheduleTime('');
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
        <Link to={ROUTES.ARTICLES} className="btn btn--secondary btn--md">Back to Articles</Link>
      </div>
    );
  }

  const featuredUrl = article.featuredImage ? articleFileUrl(article.featuredImage) : '';
  const categoryLabel = article.subcategory?.category?.name ?? article.subcategory?.name ?? 'Uncategorized';

  return (
    <div className="page">
      <GalleryModuleHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: ARTICLE_LIST_LABEL, to: articleListRoute(article.status) },
          { label: article.title.length > 48 ? `${article.title.slice(0, 48)}…` : article.title },
        ]}
        title={article.title}
        subtitle={`${categoryLabel} · ${article.author?.name ?? 'Unknown author'}`}
        meta={
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <StatusBadge tone={articleStatusTone(article.status)}>
              {formatArticleStatus(article.status)}
            </StatusBadge>
            {article.isFeatured && (
              <span className="badge badge--warning" style={{ marginLeft: 'var(--space-2)' }}>★ Featured</span>
            )}
          </div>
        }
        actions={
          <>
            <Link
              to={ROUTES.ARTICLE_PREVIEW(article.id)}
              target="_blank"
              className="btn btn--outline-secondary btn--md"
            >
              <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" /> Preview
            </Link>
            {canEdit && (
              <Link to={ROUTES.ARTICLE_EDIT(article.id)} className="btn btn--primary btn--md">
                <i className="fas fa-pencil" aria-hidden="true" /> Edit
              </Link>
            )}
          </>
        }
      />

      {article.status === 'REJECTED' && article.rejectionReason && (
        <Alert tone="danger">
          <strong>Rejection reason:</strong> {article.rejectionReason}
        </Alert>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: 'var(--space-4)' }}>
        <Card title="Article Content">
          {featuredUrl && (
            <img
              src={featuredUrl}
              alt={article.title}
              style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}
            />
          )}

          {article.excerpt && (
            <p style={{ color: 'var(--colour-ink-soft)', fontWeight: 500, marginBottom: 'var(--space-3)' }}>
              {article.excerpt}
            </p>
          )}

          <div
            className="article-content-preview"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Card>

        <div>
          <div className="article-workflow-card">
            <h3 className="article-workflow-card__title">Workflow</h3>
            <p style={{ marginBottom: 'var(--space-3)' }}>
              <StatusBadge tone={articleStatusTone(article.status)}>
                {formatArticleStatus(article.status)}
              </StatusBadge>
            </p>
            {workflowActions.length > 0 ? (
              <div className="article-workflow-card__actions">
                {workflowActions.map((cfg) => (
                  <Button
                    key={cfg.action}
                    variant={cfg.variant ?? 'secondary'}
                    size="sm"
                    onClick={() => {
                      setWorkflowConfig(cfg);
                      setComment('');
                      setScheduleDate('');
                      setScheduleTime('');
                    }}
                  >
                    {cfg.label}
                  </Button>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--colour-ink-soft)', fontSize: '0.875rem' }}>
                No workflow actions available for this status.
              </p>
            )}
          </div>

          <Card title="Metadata">
            <dl className="detail-list">
              <div><dt>Author</dt><dd>{article.author?.name ?? '—'}</dd></div>
              <div><dt>Slug</dt><dd><code>{article.slug}</code></dd></div>
              <div><dt>Category</dt><dd>{categoryLabel}</dd></div>
              <div><dt>Subcategory</dt><dd>{article.subcategory?.name ?? '—'}</dd></div>
              <div><dt>Created</dt><dd>{formatDateTime(article.createdAt)}</dd></div>
              <div><dt>Last Updated</dt><dd>{formatDateTime(article.updatedAt)}</dd></div>
              <div><dt>Published</dt><dd>{formatDateTime(article.publishedAt)}</dd></div>
              <div><dt>Scheduled</dt><dd>{formatDateTime(article.scheduledAt)}</dd></div>
              <div><dt>Allow Comments</dt><dd>{article.allowComments ? 'Yes' : 'No'}</dd></div>
              {article.reviewComment && (
                <div><dt>Review Comment</dt><dd>{article.reviewComment}</dd></div>
              )}
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

          <Card title="History">
            {article.histories && article.histories.length > 0 ? (
              <ul className="article-history-list">
                {article.histories.map((h) => (
                  <li key={h.id}>
                    <strong>{h.action.replace(/_/g, ' ')}</strong>
                    {h.newStatus && (
                      <span style={{ color: 'var(--colour-ink-soft)', marginLeft: 'var(--space-2)' }}>
                        → {formatArticleStatus(h.newStatus as Article['status'])}
                      </span>
                    )}
                    <div style={{ fontSize: '0.8125rem', color: 'var(--colour-ink-soft)', marginTop: 'var(--space-1)' }}>
                      {h.user?.name ?? 'System'} · {formatDateTime(h.createdAt)}
                    </div>
                    {h.comment && <div style={{ marginTop: 'var(--space-1)' }}>{h.comment}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: 'var(--colour-ink-soft)' }}>No history available.</p>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={workflowConfig !== null}
        title={workflowConfig?.label ?? 'Confirm Workflow'}
        message={
          <div>
            <p>
              Perform <strong>{workflowConfig?.label}</strong> on &ldquo;{article.title}&rdquo;?
            </p>

            {!workflowConfig?.hideComment && (
              <div className="field" style={{ marginTop: 'var(--space-3)' }}>
                <label className="field__label" htmlFor="wfComment">
                  Reason / Comment
                  {workflowConfig?.requiresComment && <span className="field__required"> *</span>}
                </label>
                <textarea
                  id="wfComment"
                  className="field__control"
                  rows={3}
                  required={workflowConfig?.requiresComment}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            )}

            {workflowConfig?.requiresSchedule && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <div className="field">
                  <label className="field__label" htmlFor="wfDate">Publish Date</label>
                  <input
                    id="wfDate"
                    type="date"
                    className="field__control"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="wfTime">Publish Time</label>
                  <input
                    id="wfTime"
                    type="time"
                    className="field__control"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>
        }
        confirmLabel="Confirm"
        destructive={workflowConfig?.action === 'reject'}
        busy={busy}
        onConfirm={handleWorkflow}
        onCancel={() => {
          setWorkflowConfig(null);
          setComment('');
          setScheduleDate('');
          setScheduleTime('');
        }}
      />
    </div>
  );
}

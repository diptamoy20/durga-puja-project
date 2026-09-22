import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { adminInvestmentService } from '@/services/investmentService';
import type { InvestmentOpportunity, InvestmentWorkflowAction } from '@/types/investments';

import '@/styles/articles-admin.css';
import '@/styles/investments-admin.css';

const classMap: Record<string, string> = {
  DRAFT: 'status-badge--draft',
  PENDING_APPROVAL: 'status-badge--pending_approval',
  APPROVED: 'status-badge--approved',
  REJECTED: 'status-badge--rejected',
  PUBLISHED: 'status-badge--published',
  ARCHIVED: 'status-badge--archived',
};

const labelMap: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved (Unpublished)',
  REJECTED: 'Rejected',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

interface WorkflowDialogConfig {
  action: InvestmentWorkflowAction;
  title: string;
  description: string;
  variant: 'primary' | 'secondary' | 'danger';
  requiresReason?: boolean;
}

export function InvestmentOpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();

  const [opportunity, setOpportunity] = useState<InvestmentOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workflow Dialog State
  const [dialogConfig, setDialogConfig] = useState<WorkflowDialogConfig | null>(null);
  const [comment, setComment] = useState('');
  const [executing, setExecuting] = useState(false);

  const canEdit = can(PERMISSIONS.EDIT_INVESTMENTS);
  const canApprove = can(PERMISSIONS.APPROVE_INVESTMENTS);
  const canPublish = can(PERMISSIONS.PUBLISH_INVESTMENTS);

  const loadData = () => {
    if (!id) return;
    setLoading(true);
    adminInvestmentService.opportunities
      .get(Number(id))
      .then(setOpportunity)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load opportunity.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleWorkflowSubmit = async () => {
    if (!dialogConfig || !opportunity) return;
    if (dialogConfig.requiresReason && !comment.trim()) {
      toast.error('Please provide a reason for this action.');
      return;
    }

    setExecuting(true);
    try {
      await adminInvestmentService.opportunities.workflow(
        Number(opportunity.id),
        dialogConfig.action,
        comment.trim() || undefined,
      );
      toast.success(`Action "${dialogConfig.title}" executed successfully.`);
      setDialogConfig(null);
      setComment('');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Workflow transition failed.');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading opportunity details..." />;
  }

  if (error || !opportunity) {
    return (
      <div className="page">
        <Alert tone="danger">{error || 'Opportunity not found.'}</Alert>
        <div style={{ marginTop: '16px' }}>
          <Link to={ROUTES.ADMIN_INVESTMENTS} className="btn btn--secondary">
            ← Back to Opportunities List
          </Link>
        </div>
      </div>
    );
  }

  const { status } = opportunity;

  return (
    <div className="page">
      {/* Standard Header */}
      <header className="page__header">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
            </li>
            <li>
              <Link to={ROUTES.ADMIN_INVESTMENTS}>Investor Showcase</Link>
            </li>
            <li>
              <span aria-current="page">#{opportunity.id} {opportunity.title}</span>
            </li>
          </ol>
        </nav>

        <div className="page__header-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                }}
                className={classMap[status] || 'status-badge--draft'}
              >
                {labelMap[status] || status}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--colour-ink-soft)' }}>
                Sector: <strong>{opportunity.sector}</strong>
              </span>
            </div>
            <h1 className="page__title">{opportunity.title}</h1>
            <p className="page__subtitle">
              📍 {opportunity.location} {opportunity.district ? `(${opportunity.district})` : ''} • Scale: <strong>{opportunity.scaleOrRange || opportunity.investmentRange || 'Flexible'}</strong>
            </p>
          </div>

          <div className="page__header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link to={ROUTES.ADMIN_INVESTMENTS} className="btn btn--secondary btn--sm">
              ← Back
            </Link>

            {canEdit && (
              <Link to={ROUTES.ADMIN_INVESTMENT_EDIT(opportunity.id)} className="btn btn--outline btn--sm">
                ✏️ Edit
              </Link>
            )}

            {status === 'PUBLISHED' && (
              <Link
                to={ROUTES.PUBLIC_INVESTOR_OPPORTUNITY_DETAIL(opportunity.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--secondary btn--sm"
              >
                Live Showcase ↗
              </Link>
            )}

            {/* Workflow Action Buttons */}
            {(status === 'DRAFT' || status === 'REJECTED') && canEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  setDialogConfig({
                    action: 'submit_for_approval',
                    title: 'Submit for Approval',
                    description: 'Are you sure you want to submit this opportunity for administrative review and approval?',
                    variant: 'primary',
                  })
                }
              >
                📤 Submit for Approval
              </Button>
            )}

            {status === 'PENDING_APPROVAL' && (
              <>
                {canApprove && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setDialogConfig({
                          action: 'approve',
                          title: 'Approve Opportunity',
                          description: 'Approve this investment opportunity. Once approved, it can be published to the public showcase.',
                          variant: 'primary',
                        })
                      }
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setDialogConfig({
                          action: 'reject',
                          title: 'Reject Opportunity',
                          description: 'Please specify the rejection reason or required changes so the author can revise it.',
                          variant: 'danger',
                          requiresReason: true,
                        })
                      }
                    >
                      ✕ Reject
                    </Button>
                  </>
                )}
                {canEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setDialogConfig({
                        action: 'return_to_draft',
                        title: 'Return to Draft',
                        description: 'Pull this submission back into Draft status for further changes?',
                        variant: 'secondary',
                      })
                    }
                  >
                    Return to Draft
                  </Button>
                )}
              </>
            )}

            {status === 'APPROVED' && canPublish && (
              <Button
                variant="primary"
                size="sm"
                style={{ background: '#059669', borderColor: '#059669' }}
                onClick={() =>
                  setDialogConfig({
                    action: 'publish',
                    title: 'Publish to Showcase',
                    description: 'Publish this opportunity now. It will immediately become visible to investors on the public showcase.',
                    variant: 'primary',
                  })
                }
              >
                🚀 Publish Now
              </Button>
            )}

            {status === 'PUBLISHED' && canPublish && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setDialogConfig({
                    action: 'archive',
                    title: 'Archive Opportunity',
                    description: 'Archive this project. It will be delisted from the public showcase.',
                    variant: 'secondary',
                  })
                }
              >
                📦 Archive
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Rejection Alert */}
      {status === 'REJECTED' && opportunity.rejectionReason && (
        <Alert tone="danger">
          <strong>Submission Rejected:</strong> {opportunity.rejectionReason}
        </Alert>
      )}

      {/* Approved Status Notice */}
      {status === 'APPROVED' && (
        <Alert tone="info">
          <strong>Opportunity Approved:</strong> This opportunity has been approved by reviewers, but is NOT yet visible publicly. Click <strong>Publish Now</strong> when ready to release.
        </Alert>
      )}

      <div className="article-form-grid" style={{ marginTop: 'var(--space-4, 16px)' }}>
        {/* Left Column (2fr): Specifications & Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 20px)' }}>
          {/* Main Specs Card */}
          <Card title="Opportunity Specifications">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #6b7280)', textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
                <div style={{ marginTop: '4px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                    }}
                    className={classMap[status] || 'status-badge--draft'}
                  >
                    {labelMap[status] || status}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #6b7280)', textTransform: 'uppercase', fontWeight: 600 }}>Sector</div>
                <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--colour-ink)' }}>{opportunity.sector}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #6b7280)', textTransform: 'uppercase', fontWeight: 600 }}>Location / District</div>
                <div style={{ marginTop: '4px', fontWeight: 600 }}>
                  📍 {opportunity.location} {opportunity.district ? `(${opportunity.district})` : ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #6b7280)', textTransform: 'uppercase', fontWeight: 600 }}>Investment Scale</div>
                <div style={{ marginTop: '4px', fontWeight: 700, color: '#059669' }}>
                  💰 {opportunity.scaleOrRange || opportunity.investmentRange || 'Flexible'}
                </div>
              </div>

              {opportunity.projectType && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #6b7280)', textTransform: 'uppercase', fontWeight: 600 }}>Project Model</div>
                  <div style={{ marginTop: '4px', fontWeight: 600 }}>{opportunity.projectType}</div>
                </div>
              )}

              {opportunity.expectedRoi && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #6b7280)', textTransform: 'uppercase', fontWeight: 600 }}>Expected Yield / ROI</div>
                  <div style={{ marginTop: '4px', fontWeight: 600 }}>📈 {opportunity.expectedRoi}</div>
                </div>
              )}
            </div>

            {opportunity.summary && (
              <div style={{ borderTop: '1px solid var(--colour-border, #e5e7eb)', paddingTop: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #6b7280)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  Executive Summary
                </div>
                <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--colour-ink-soft, #4b5563)', lineHeight: 1.6 }}>
                  {opportunity.summary}
                </p>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--colour-border, #e5e7eb)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #6b7280)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
                Detailed Project Description
              </div>
              <div
                className="article-content"
                style={{ lineHeight: 1.7, color: 'var(--colour-ink)' }}
                dangerouslySetInnerHTML={{ __html: opportunity.description }}
              />
            </div>

            {opportunity.highlights && opportunity.highlights.length > 0 && (
              <div style={{ borderTop: '1px solid var(--colour-border, #e5e7eb)', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #6b7280)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
                  Key Strategic Highlights
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {opportunity.highlights.map((h, idx) => (
                    <li key={idx} style={{ color: 'var(--colour-ink)' }}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {opportunity.incentives && (
              <div style={{ borderTop: '1px solid var(--colour-border, #e5e7eb)', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #6b7280)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                  Fiscal & Policy Incentives
                </div>
                <p style={{ margin: 0, color: '#065f46', background: '#ecfdf5', padding: '12px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                  {opportunity.incentives}
                </p>
              </div>
            )}
          </Card>

          {/* Documents & Files Card */}
          <Card
            title="Attached Documents & Dossiers"
            actions={
              canEdit ? (
                <Link
                  to={ROUTES.ADMIN_INVESTMENT_EDIT(opportunity.id)}
                  className="btn btn--secondary btn--sm"
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  ➕ Add / Edit Documents
                </Link>
              ) : undefined
            }
          >
            {opportunity.documents && opportunity.documents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {opportunity.documents.map((doc, idx) => {
                  const isPdf = (doc.fileType || '').toUpperCase().includes('PDF');
                  const isXls = (doc.fileType || '').toUpperCase().includes('XLS');
                  const isPpt = (doc.fileType || '').toUpperCase().includes('PPT');
                  const iconColor = isPdf ? '#dc2626' : isXls ? '#16a34a' : isPpt ? '#ea580c' : '#4f46e5';
                  const iconBadge = isPdf ? '📕 PDF' : isXls ? '📊 XLS' : isPpt ? '📽️ PPT' : '📄 DOC';

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 14px',
                        background: 'var(--colour-canvas, #f8fafc)',
                        borderRadius: 'var(--radius-md, 8px)',
                        border: '1px solid var(--colour-border, #e2e8f0)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            background: '#ffffff',
                            color: iconColor,
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: `1px solid ${iconColor}33`,
                          }}
                        >
                          {iconBadge}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--colour-ink, #0f172a)' }}>{doc.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft, #64748b)' }}>
                            {doc.fileType || 'Document'} {doc.fileSize ? `• ${doc.fileSize}` : ''}
                          </div>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--outline btn--sm"
                        style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                      >
                        Download / View ↗
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 16px',
                  background: 'var(--colour-canvas, #f8fafc)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px dashed var(--colour-border, #cbd5e1)',
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '8px' }}>📁</div>
                <div style={{ fontWeight: 600, color: 'var(--colour-ink, #334155)', fontSize: '0.9rem', marginBottom: '4px' }}>
                  No documents attached to this opportunity
                </div>
                <p style={{ margin: '0 0 14px', color: 'var(--colour-ink-soft, #64748b)', fontSize: '0.825rem' }}>
                  You can attach Detailed Project Reports (DPRs), investor decks, financial models, or policy briefs.
                </p>
                {canEdit && (
                  <Link to={ROUTES.ADMIN_INVESTMENT_EDIT(opportunity.id)} className="btn btn--primary btn--sm">
                    ➕ Attach Document / Project Dossier
                  </Link>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1fr): Chamber, Timestamps & Audit History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 20px)' }}>
          {/* Chamber Card */}
          <Card title="Assigned Industry Chamber">
            {opportunity.association ? (
              <div>
                <h4 style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '1rem', color: 'var(--colour-ink)' }}>
                  {opportunity.association.name}
                </h4>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', marginBottom: '10px' }}>
                  Acronym: {opportunity.association.code}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--colour-ink-soft)', lineHeight: 1.5 }}>
                  {opportunity.association.description}
                </div>

                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--colour-border, #e5e7eb)', fontSize: '0.825rem' }}>
                  {opportunity.association.contactPerson && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Contact:</strong> {opportunity.association.contactPerson}
                    </div>
                  )}
                  {opportunity.association.email && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Email:</strong> <a href={`mailto:${opportunity.association.email}`}>{opportunity.association.email}</a>
                    </div>
                  )}
                  {opportunity.association.phone && (
                    <div>
                      <strong>Phone:</strong> {opportunity.association.phone}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--colour-ink-soft)', fontSize: '0.875rem' }}>
                No Industry Association / Chamber assigned to this opportunity yet.
              </div>
            )}
          </Card>

          {/* Direct Opportunity Contact */}
          {(opportunity.contactEmail || opportunity.contactPhone) && (
            <Card title="Opportunity Inquiries Desk">
              {opportunity.contactEmail && (
                <div style={{ marginBottom: '6px', fontSize: '0.875rem' }}>
                  ✉️ <a href={`mailto:${opportunity.contactEmail}`}>{opportunity.contactEmail}</a>
                </div>
              )}
              {opportunity.contactPhone && (
                <div style={{ fontSize: '0.875rem' }}>
                  📞 {opportunity.contactPhone}
                </div>
              )}
            </Card>
          )}

          {/* Audit & Workflow History */}
          <Card title="Audit & Workflow History">
            {opportunity.histories && opportunity.histories.length > 0 ? (
              <div className="audit-timeline">
                {opportunity.histories.map((h) => (
                  <div key={h.id} className="audit-timeline__item">
                    <span className="audit-timeline__dot" />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--colour-ink)' }}>
                      {h.action.replace(/_/g, ' ')}
                    </div>
                    {h.user && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)' }}>
                        by {h.user.name}
                      </div>
                    )}
                    {h.comment && (
                      <div style={{ fontSize: '0.8rem', background: 'var(--colour-canvas, #f3f4f6)', padding: '6px 10px', borderRadius: '4px', marginTop: '4px', fontStyle: 'italic' }}>
                        "{h.comment}"
                      </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: 'var(--colour-ink-soft)' }}>
                      {new Date(h.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--colour-ink-soft)' }}>No workflow history recorded.</div>
            )}
          </Card>
        </div>
      </div>

      {/* Workflow Modal Dialog */}
      {dialogConfig && (
        <Modal
          open={Boolean(dialogConfig)}
          onClose={() => setDialogConfig(null)}
          title={dialogConfig.title}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, color: 'var(--colour-ink-soft)' }}>{dialogConfig.description}</p>

            <Textarea
              label={dialogConfig.requiresReason ? 'Rejection Reason / Required Changes *' : 'Audit Note / Comment (Optional)'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                dialogConfig.requiresReason
                  ? 'Please specify what needs to be changed before this opportunity can be approved...'
                  : 'Add any optional review comments or remarks...'
              }
              rows={3}
              required={dialogConfig.requiresReason}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setDialogConfig(null)}>
                Cancel
              </Button>
              <Button
                variant={dialogConfig.variant === 'danger' ? 'danger' : 'primary'}
                onClick={handleWorkflowSubmit}
                loading={executing}
              >
                Confirm {dialogConfig.title}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default InvestmentOpportunityDetailPage;

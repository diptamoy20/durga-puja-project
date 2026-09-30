import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminInvestmentService } from '@/services/investmentService';
import type {
  InvestmentEnquiry,
  InvestmentEnquiryStatus,
  IndustryAssociation,
} from '@/types/investments';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import '@/styles/articles-admin.css';
import '@/styles/investments-admin.css';

const ENQUIRY_STATUS_OPTIONS = [
  { value: 'NEW', label: 'NEW - Newly Received' },
  { value: 'IN_REVIEW', label: 'IN_REVIEW - Under Assessment' },
  { value: 'FORWARDED_TO_CHAMBER', label: 'FORWARDED_TO_CHAMBER - Routed to Nodal Chamber' },
  { value: 'CONTACTED', label: 'CONTACTED - Investor Contacted' },
  { value: 'CLOSED', label: 'CLOSED - Completed / Archived' },
];

export const InvestmentEnquiryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [enquiry, setEnquiry] = useState<InvestmentEnquiry | null>(null);
  const [associations, setAssociations] = useState<IndustryAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status & Assignment update state
  const [status, setStatus] = useState<InvestmentEnquiryStatus>('NEW');
  const [assignedAssociationId, setAssignedAssociationId] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (enquiryId: string) => {
    try {
      setLoading(true);
      setError(null);
      const [enqData, assocData] = await Promise.all([
        adminInvestmentService.getEnquiryById(enquiryId),
        adminInvestmentService.getAssociations(),
      ]);
      setEnquiry(enqData);
      setAssociations(assocData);
      setStatus(enqData.status);
      setAssignedAssociationId(enqData.assignedAssociationId ? String(enqData.assignedAssociationId) : '');
      setAdminNotes(enqData.adminNotes || '');
    } catch (err: any) {
      setError(err?.message || 'Failed to load enquiry details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setUpdating(true);
      const updated = await adminInvestmentService.updateEnquiryStatus(id, {
        status,
        assignedAssociationId: assignedAssociationId || undefined,
        adminNotes: adminNotes || undefined,
        comment: comment.trim() || undefined,
      });
      setEnquiry(updated);
      setComment('');
      toast.success('Enquiry updated successfully.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update enquiry');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading enquiry details..." />;
  }

  if (error || !enquiry) {
    return (
      <div className="page">
        <Alert tone="danger">{error || 'Enquiry not found'}</Alert>
        <div style={{ marginTop: '16px' }}>
          <Button variant="secondary" onClick={() => navigate(ROUTES.ADMIN_INVESTMENT_ENQUIRIES)}>
            ← Back to Enquiries
          </Button>
        </div>
      </div>
    );
  }

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
              <Link to={ROUTES.ADMIN_INVESTMENT_ENQUIRIES}>Investor Leads</Link>
            </li>
            <li>
              <span aria-current="page">#{enquiry.enquiryCode}</span>
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
                  background: 'var(--colour-canvas, #f1f5f9)',
                  color: 'var(--colour-ink)',
                }}
              >
                {enquiry.status}
              </span>
            </div>
            <h1 className="page__title">Enquiry #{enquiry.enquiryCode}</h1>
            <p className="page__subtitle">
              Lead from <strong>{enquiry.investorName}</strong> ({enquiry.organizationName || 'Individual Investor'})
            </p>
          </div>

          <div className="page__header-actions">
            <Link to={ROUTES.ADMIN_INVESTMENT_ENQUIRIES} className="btn btn--secondary btn--sm">
              ← Back to Enquiries
            </Link>
          </div>
        </div>
      </header>

      <div className="article-form-grid" style={{ marginTop: 'var(--space-4, 16px)' }}>
        {/* Left Column (2fr): Lead Info & Proposal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 20px)' }}>
          <Card title="Investor & Organization Details">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Investor Name</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--colour-ink)', marginTop: '2px' }}>
                  {enquiry.investorName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Organization / Enterprise</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--colour-ink)', marginTop: '2px' }}>
                  {enquiry.organizationName || 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                <div style={{ marginTop: '2px' }}>
                  <a href={`mailto:${enquiry.email}`} style={{ color: 'var(--colour-brand, #2563eb)', fontWeight: 600 }}>
                    ✉️ {enquiry.email}
                  </a>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</div>
                <div style={{ marginTop: '2px', fontWeight: 600 }}>
                  📞 {enquiry.phone || 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Investor Type</div>
                <div style={{ textTransform: 'capitalize', marginTop: '2px', fontWeight: 600 }}>
                  {enquiry.investorType?.replace(/_/g, ' ') || 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Country / Region</div>
                <div style={{ marginTop: '2px', fontWeight: 600 }}>
                  🌐 {enquiry.country || 'India'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Indicative Investment Scale</div>
                <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem', marginTop: '2px' }}>
                  💰 {enquiry.indicativeBudget || 'Undisclosed'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Target Sector</div>
                <div style={{ marginTop: '2px', fontWeight: 600 }}>
                  {enquiry.targetSector || 'Cross-Sector / Not Specified'}
                </div>
              </div>
            </div>

            {enquiry.opportunity && (
              <div
                style={{
                  background: 'var(--colour-canvas, #f8fafc)',
                  border: '1px solid var(--colour-border, #e2e8f0)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '14px',
                  marginTop: '16px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  Linked Investment Opportunity
                </div>
                <div style={{ fontWeight: 700, color: 'var(--colour-ink)' }}>
                  <Link
                    to={ROUTES.ADMIN_INVESTMENT_DETAIL(enquiry.opportunity.id)}
                    style={{ color: 'var(--colour-brand, #2563eb)' }}
                  >
                    {enquiry.opportunity.title} &rarr;
                  </Link>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--colour-ink-soft)', marginTop: '4px' }}>
                  Sector: {enquiry.opportunity.sector} | Scale: {enquiry.opportunity.scaleOrRange || 'Flexible'}
                </div>
              </div>
            )}

            <div style={{ marginTop: '16px', borderTop: '1px solid var(--colour-border, #e5e7eb)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                Investor Message / Specific Proposal Details
              </div>
              <div
                style={{
                  background: 'var(--colour-canvas, #f8fafc)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--colour-border, #e2e8f0)',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--colour-ink)',
                  lineHeight: '1.6',
                }}
              >
                {enquiry.message || 'No additional message provided.'}
              </div>
            </div>
          </Card>

          {/* Audit History Card */}
          <Card title="Enquiry Progress & Audit Trail">
            {enquiry.history && enquiry.history.length > 0 ? (
              <div className="audit-timeline">
                {enquiry.history.map((hist) => (
                  <div key={hist.id} className="audit-timeline__item">
                    <span className="audit-timeline__dot" />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--colour-ink)' }}>
                      {hist.action.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)' }}>
                      {new Date(hist.createdAt).toLocaleString()} • By {hist.actor?.name || hist.actor?.email || 'System'}
                    </div>
                    {hist.comment && (
                      <div style={{ fontSize: '0.8rem', background: 'var(--colour-canvas, #f3f4f6)', padding: '6px 10px', borderRadius: '4px', marginTop: '4px', fontStyle: 'italic' }}>
                        "{hist.comment}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--colour-ink-soft)', fontStyle: 'italic', margin: 0 }}>No audit records found.</p>
            )}
          </Card>
        </div>

        {/* Right Column (1fr): Workflow Action & Assignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 20px)' }}>
          <Card title="Workflow & Assignment">
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Select
                label="Lead Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as InvestmentEnquiryStatus)}
                options={ENQUIRY_STATUS_OPTIONS}
              />

              <Select
                label="Assigned Chamber / Association"
                value={assignedAssociationId}
                onChange={(e) => setAssignedAssociationId(e.target.value)}
                options={[
                  { value: '', label: '-- No Chamber Assigned --' },
                  ...associations.map((assoc) => ({
                    value: String(assoc.id),
                    label: `${assoc.code} - ${assoc.name}`,
                  })),
                ]}
              />

              <Textarea
                label="Internal Admin Notes"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Notes for internal coordination and committee review..."
              />

              <Input
                label="Action Log / Transition Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Forwarded dossier to BCCI investment desk"
              />

              <Button
                type="submit"
                variant="primary"
                loading={updating}
                style={{ width: '100%', marginTop: '8px' }}
              >
                Save & Update Lead
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvestmentEnquiryDetailPage;

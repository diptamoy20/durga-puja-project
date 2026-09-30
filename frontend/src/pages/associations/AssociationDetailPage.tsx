import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { RejectAssociationModal } from '@/components/associations/RejectAssociationModal';
import { ROUTES } from '@/constants/routes';
import { associationService, type AssociationDetail, type AssociationStatus } from '@/services/associationService';
import { useToast } from '@/hooks/useToast';

const TRANSITIONS: Record<AssociationStatus, Array<{ status: AssociationStatus; label: string; variant: 'success' | 'danger' | 'secondary' }>> = {
  PENDING: [
    { status: 'UNDER_REVIEW', label: 'Start Review', variant: 'secondary' },
    { status: 'REJECTED', label: 'Reject', variant: 'danger' },
  ],
  UNDER_REVIEW: [
    { status: 'APPROVED', label: 'Approve', variant: 'success' },
    { status: 'REJECTED', label: 'Reject', variant: 'danger' },
  ],
  APPROVED: [
    { status: 'INACTIVE', label: 'Deactivate', variant: 'secondary' },
    { status: 'REJECTED', label: 'Reject', variant: 'danger' },
  ],
  REJECTED: [{ status: 'PENDING', label: 'Reopen', variant: 'secondary' }],
  INACTIVE: [
    { status: 'PENDING', label: 'Reactivate', variant: 'secondary' },
    { status: 'APPROVED', label: 'Reactivate & Approve', variant: 'success' },
  ],
};

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function AssociationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { success: toastSuccess, error: toastError } = useToast();
  const [association, setAssociation] = useState<AssociationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setAssociation(await associationService.adminGet(Number(id)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Association not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = async (newStatus: AssociationStatus) => {
    if (!association) return;
    if (newStatus === 'REJECTED') {
      setRejectOpen(true);
      return;
    }
    setSubmitting(true);
    try {
      await associationService.changeStatus(association.id, newStatus);
      toastSuccess(`Association moved to ${newStatus.toLowerCase().replace('_', ' ')}.`);
      void load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!association) return;
    setSubmitting(true);
    try {
      await associationService.changeStatus(association.id, 'REJECTED', reason);
      toastSuccess('Association rejected.');
      setRejectOpen(false);
      void load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !association) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Association not found.'}</Alert>
        <Link to={ROUTES.ASSOCIATIONS} className="btn btn--secondary btn--md" style={{ marginTop: 'var(--space-300)' }}>
          Back to directory
        </Link>
      </div>
    );
  }

  const logoUrl = association.logoImage ? associationService.fileUrl(association.logoImage) : null;
  const coverUrl = association.coverImage ? associationService.fileUrl(association.coverImage) : null;

  return (
    <div className="page">
      <header className="page__header">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link to={ROUTES.ASSOCIATIONS}>Association Directory</Link></li>
            <li><span>{association.name}</span></li>
          </ol>
        </nav>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-300)' }}>
          <div>
            <h1 className="page__title">{association.name}</h1>
            <p className="page__subtitle" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
              <StatusBadge status={association.status} />
              <span style={{ fontSize: 'var(--font-xs)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', color: 'var(--color-text-muted)' }}>
                {association.registrationNo}
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
            <Link to={ROUTES.ASSOCIATION_EDIT(association.id)} className="btn btn--secondary btn--md">Edit</Link>
            {TRANSITIONS[association.status].map((action) => (
              <Button key={action.status} variant={action.variant} disabled={submitting} onClick={() => handleStatusChange(action.status)}>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 'var(--space-400)', alignItems: 'start' }}>
        <Card title="Profile" style={{ alignSelf: 'start' }}>
          <dl className="detail-list">
            <div><dt>Description</dt><dd>{association.description}</dd></div>
            {association.establishedYear && <div><dt>Established</dt><dd>{association.establishedYear}</dd></div>}
            <div><dt>Country</dt><dd>{association.country}</dd></div>
            <div><dt>State / Region</dt><dd>{association.state}</dd></div>
            <div><dt>City</dt><dd>{association.city}</dd></div>
            <div><dt>Postal Code</dt><dd>{association.postalCode}</dd></div>
            <div><dt>Address</dt><dd>{association.address}</dd></div>
          </dl>
        </Card>

        <div style={{ display: 'grid', gap: 'var(--space-400)', alignSelf: 'start' }}>
          <Card title="Contact">
            <dl className="detail-list">
              <div><dt>Contact Person</dt><dd>{association.contactPersonName}</dd></div>
              {association.designation && <div><dt>Designation</dt><dd>{association.designation}</dd></div>}
              <div><dt>Email</dt><dd><a href={`mailto:${association.email}`}>{association.email}</a></dd></div>
              <div><dt>Mobile</dt><dd><a href={`tel:${association.mobile}`}>{association.mobile}</a></dd></div>
              {association.website && (
                <div><dt>Website</dt><dd><a href={association.website} target="_blank" rel="noopener noreferrer">{association.website}</a></dd></div>
              )}
              {association.socialLinks && Object.keys(association.socialLinks).length > 0 && (
                <div>
                  <dt>Social</dt>
                  <dd>
                    {Object.entries(association.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginRight: 'var(--space-200)' }}
                      >
                        {platform}
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {(logoUrl || coverUrl) && (
            <Card title="Images">
              {logoUrl && (
                <div style={{ marginBottom: 'var(--space-200)' }}>
                  <strong style={{ display: 'block', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-100)' }}>Logo</strong>
                  <img src={logoUrl} alt="Logo" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                </div>
              )}
              {coverUrl && (
                <div>
                  <strong style={{ display: 'block', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-100)' }}>Cover</strong>
                  <img src={coverUrl} alt="Cover" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      <Card title="Review / Approval" style={{ marginTop: 'var(--space-400)' }}>
        <dl className="detail-list">
          {association.approvedAt && (
            <div>
              <dt>Approved</dt>
              <dd>{`${dateFormat.format(new Date(association.approvedAt))}${association.approvedBy?.name ? ` by ${association.approvedBy.name}` : ''}`}</dd>
            </div>
          )}
          {association.rejectedAt && (
            <div>
              <dt>Rejected</dt>
              <dd>{`${dateFormat.format(new Date(association.rejectedAt))}${association.rejectedBy?.name ? ` by ${association.rejectedBy.name}` : ''}`}</dd>
            </div>
          )}
          {association.reviewedAt && (
            <div>
              <dt>Reviewed</dt>
              <dd>{`${dateFormat.format(new Date(association.reviewedAt))}${association.reviewedBy?.name ? ` by ${association.reviewedBy.name}` : ''}`}</dd>
            </div>
          )}
          {association.rejectionReason && <div><dt>Rejection Reason</dt><dd>{association.rejectionReason}</dd></div>}
          <div><dt>Created</dt><dd>{dateFormat.format(new Date(association.createdAt))}</dd></div>
        </dl>
      </Card>

      {association.histories && association.histories.length > 0 && (
        <Card title={`Status History (${association.histories.length})`} style={{ marginTop: 'var(--space-400)' }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Previous Status</th>
                  <th>New Status</th>
                  <th>Changed By</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {association.histories.map((h) => (
                  <tr key={h.id}>
                    <td>{dateFormat.format(new Date(h.createdAt))}</td>
                    <td><StatusBadge status={h.previousStatus || ''}>{h.previousStatus || '—'}</StatusBadge></td>
                    <td><StatusBadge status={h.newStatus}>{h.newStatus}</StatusBadge></td>
                    <td>{h.changedBy?.name ?? '—'}</td>
                    <td>{h.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <RejectAssociationModal
        open={rejectOpen}
        associationName={association.name}
        busy={submitting}
        onConfirm={handleReject}
        onCancel={() => setRejectOpen(false)}
      />
    </div>
  );
}
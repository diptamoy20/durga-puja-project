import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
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

function MetaList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ margin: '0 0 var(--space-200)', fontSize: 'var(--font-sm)', fontWeight: 700 }}>{title}</h2>
      <dl style={{ margin: 0, fontSize: 'var(--font-sm)' }}>
        {children}
      </dl>
    </section>
  );
}

function Row({ dt, dd }: { dt: string; dd: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '10rem 1fr', gap: 'var(--space-200)', padding: 'var(--space-100) 0', borderBottom: '1px solid var(--color-border)' }}>
      <dt style={{ color: 'var(--color-text-muted)' }}>{dt}</dt>
      <dd style={{ margin: 0 }}>{dd}</dd>
    </div>
  );
}

export function AssociationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { success: toastSuccess, error: toastError } = useToast();
  const [association, setAssociation] = useState<AssociationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    let reason: string | undefined;
    if (newStatus === 'REJECTED') {
      reason = window.prompt('Reason for rejection:') ?? undefined;
      if (!reason) return;
    }
    setSubmitting(true);
    try {
      await associationService.changeStatus(association.id, newStatus, reason);
      toastSuccess(`Association moved to ${newStatus.toLowerCase().replace('_', ' ')}.`);
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
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Alert tone="danger">{error ?? 'Association not found.'}</Alert>
        <Link to={ROUTES.ASSOCIATIONS} style={{ display: 'inline-block', marginTop: 'var(--space-300)' }}>
          Back to directory
        </Link>
      </div>
    );
  }

  const logoUrl = association.logoImage ? associationService.fileUrl(association.logoImage) : null;
  const coverUrl = association.coverImage ? associationService.fileUrl(association.coverImage) : null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-300)', marginBottom: 'var(--space-400)' }}>
        <div>
          <Link to={ROUTES.ASSOCIATIONS} style={{ display: 'inline-block', marginBottom: 'var(--space-200)' }}>
            ← Back to directory
          </Link>
          <h1 style={{ margin: '0 0 var(--space-100)', fontSize: 'var(--font-xl)' }}>{association.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
            <StatusBadge status={association.status} />
            <span style={{ fontSize: 'var(--font-xs)', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{association.registrationNo}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
          <Link to={ROUTES.ASSOCIATION_EDIT(association.id)} className="btn btn--secondary btn--md">Edit</Link>
          {TRANSITIONS[association.status].map((action) => (
            <Button key={action.status} variant={action.variant} disabled={submitting} onClick={() => handleStatusChange(action.status)}>
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 'var(--space-400)' }}>
        <Card style={{ alignSelf: 'start' }}>
          <MetaList title="Profile">
            <Row dt="Description" dd={association.description} />
            {association.establishedYear && <Row dt="Established" dd={association.establishedYear} />}
            <Row dt="Country" dd={association.country} />
            <Row dt="State / Region" dd={association.state} />
            <Row dt="City" dd={association.city} />
            <Row dt="Postal Code" dd={association.postalCode} />
            <Row dt="Address" dd={association.address} />
          </MetaList>
        </Card>

        <div style={{ display: 'grid', gap: 'var(--space-400)', alignSelf: 'start' }}>
          <Card>
            <MetaList title="Contact">
              <Row dt="Contact Person" dd={association.contactPersonName} />
              {association.designation && <Row dt="Designation" dd={association.designation} />}
              <Row dt="Email" dd={<a href={`mailto:${association.email}`}>{association.email}</a>} />
              <Row dt="Mobile" dd={<a href={`tel:${association.mobile}`}>{association.mobile}</a>} />
              {association.website && <Row dt="Website" dd={<a href={association.website} target="_blank" rel="noopener noreferrer">{association.website}</a>} />}
              {association.socialLinks && Object.keys(association.socialLinks).length > 0 && (
                <Row
                  dt="Social"
                  dd={Object.entries(association.socialLinks).map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" style={{ marginRight: 'var(--space-200)' }}>
                      {platform}
                    </a>
                  ))}
                />
              )}
            </MetaList>
          </Card>

          {(logoUrl || coverUrl) && (
            <Card>
              <MetaList title="Images">
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
              </MetaList>
            </Card>
          )}
        </div>
      </div>

      <Card style={{ marginTop: 'var(--space-400)' }}>
        <MetaList title="Review / Approval">
          {association.approvedAt && (
            <Row dt="Approved" dd={`${dateFormat.format(new Date(association.approvedAt))}${association.approvedBy?.name ? ` by ${association.approvedBy.name}` : ''}`} />
          )}
          {association.rejectedAt && (
            <Row dt="Rejected" dd={`${dateFormat.format(new Date(association.rejectedAt))}${association.rejectedBy?.name ? ` by ${association.rejectedBy.name}` : ''}`} />
          )}
          {association.reviewedAt && (
            <Row dt="Reviewed" dd={`${dateFormat.format(new Date(association.reviewedAt))}${association.reviewedBy?.name ? ` by ${association.reviewedBy.name}` : ''}`} />
          )}
          {association.rejectionReason && <Row dt="Rejection Reason" dd={association.rejectionReason} />}
          <Row dt="Created" dd={dateFormat.format(new Date(association.createdAt))} />
        </MetaList>
      </Card>

      {association.histories && association.histories.length > 0 && (
        <Card style={{ marginTop: 'var(--space-400)' }}>
          <MetaList title={`Status History (${association.histories.length})`}>
            {association.histories.map((h) => (
              <Row
                key={h.id}
                dt={dateFormat.format(new Date(h.createdAt))}
                dd={
<>
                  <StatusBadge status={h.previousStatus || ''}>{h.previousStatus || '—'}</StatusBadge>
                  {' → '}
                  <StatusBadge status={h.newStatus}>{h.newStatus}</StatusBadge>
                  {h.reason && <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-xs)' }}>{h.reason}</div>}
                  {h.changedBy?.name && <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-xs)' }}>by {h.changedBy.name}</div>}
                </>
                }
              />
            ))}
          </MetaList>
        </Card>
      )}
    </div>
  );
}
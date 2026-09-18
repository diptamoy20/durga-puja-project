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
import { canTransitionCommittee, formatCommitteeStatus, formatPujaValue } from '@/constants/committee';
import { committeeService } from '@/services/registrationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { CommitteeStatus, PujaCommittee } from '@/types/registration';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const DOCUMENTS = [
  { field: 'registration_certificate' as const, label: 'Committee Registration Certificate', key: 'registrationCertificate' as const },
  { field: 'address_proof' as const, label: 'Address Proof', key: 'addressProof' as const },
  { field: 'pandal_image' as const, label: 'Pandal / Puja Image', key: 'pandalImage' as const },
];

function statusTone(status: CommitteeStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'UNDER_REVIEW':
      return 'warning';
    case 'REJECTED':
      return 'danger';
    case 'INACTIVE':
      return 'default';
    case 'PENDING':
    default:
      return 'info';
  }
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="committee-detail-field">
      <strong>{label}</strong>
      <div>{value}</div>
    </div>
  );
}

export function CommitteeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();

  const [committee, setCommittee] = useState<PujaCommittee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<CommitteeStatus | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [pandalPreviewUrl, setPandalPreviewUrl] = useState<string | null>(null);
  const isDev = import.meta.env.DEV;

  const canEdit = can(PERMISSIONS.EDIT_COMMITTEES);
  const canApprove = can(PERMISSIONS.APPROVE_COMMITTEES);

  const showAction = (target: CommitteeStatus) =>
    canApprove && committee ? canTransitionCommittee(committee.status, target) : false;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    committeeService
      .get(Number(id))
      .then(setCommittee)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load committee.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!committee?.pandalImage || !id) return;
    let objectUrl: string | null = null;
    committeeService
      .fetchDocument(Number(id), 'pandal_image')
      .then((blob) => {
        if (blob.type.startsWith('image/')) {
          objectUrl = URL.createObjectURL(blob);
          setPandalPreviewUrl(objectUrl);
        }
      })
      .catch(() => undefined);
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [committee?.pandalImage, id]);

  const reload = async () => {
    if (!id) return;
    const refreshed = await committeeService.get(Number(id));
    setCommittee(refreshed);
  };

  const handleStatusChange = async () => {
    if (!statusAction || !committee) return;
    if (statusAction === 'REJECTED' && !reason.trim()) {
      toast.warning('A reason is required for rejection.');
      return;
    }
    setBusy(true);
    try {
      const updated = await committeeService.changeStatus(committee.id, statusAction, reason || undefined);
      setCommittee(updated);
      toast.success(`Application marked as ${formatCommitteeStatus(statusAction)}.`);
      setStatusAction(null);
      setReason('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreatePortalAccount = async () => {
    if (!committee) return;
    setBusy(true);
    try {
      await committeeService.createPortalAccount(committee.id);
      toast.success('Portal account created successfully!');
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create portal account.');
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateLocalPassword = async () => {
    if (!committee) return;
    setBusy(true);
    try {
      await committeeService.generateLocalPassword(committee.id);
      toast.success('A new local development password was generated.');
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate password.');
    } finally {
      setBusy(false);
    }
  };

  const handleDocument = async (
    doc: 'registration_certificate' | 'address_proof' | 'pandal_image',
    download = false,
  ) => {
    if (!committee) return;
    try {
      await committeeService.openDocument(committee.id, doc, download);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not open document.');
    }
  };

  if (loading) return <PageLoader />;
  if (error || !committee) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Committee not found.'}</Alert>
        <Link to={ROUTES.COMMITTEES} className="btn btn--secondary btn--md">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header committee-detail-header">
        <div>
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link to={ROUTES.COMMITTEES}>Committee Applications</Link></li>
              <li><span>{committee.registrationNo}</span></li>
            </ol>
          </nav>
          <h1 className="page__title">
            Committee Details{' '}
            <StatusBadge tone={statusTone(committee.status)}>
              {formatCommitteeStatus(committee.status)}
            </StatusBadge>
          </h1>
        </div>
        <div className="committee-detail-header__actions">
          {canEdit && (
            <Link to={ROUTES.COMMITTEE_EDIT(committee.id)} className="btn btn--primary btn--md">
              Edit
            </Link>
          )}
          <Link to={ROUTES.COMMITTEES} className="btn btn--secondary btn--md">Back</Link>
        </div>
      </header>

      <div className="committee-detail-grid">
        <Card title="Basic Information">
          <div className="committee-detail-grid__inner">
            <DetailField label="Registration Number" value={committee.registrationNo} />
            <DetailField label="Committee ID" value={committee.committeeId ?? 'Pending approval'} />
            <DetailField label="Established Year" value={committee.establishedYear} />
            <DetailField label="Committee Name" value={committee.committeeName} />
            <DetailField label="Type of Puja" value={formatPujaValue(committee.pujaType)} />
            <DetailField label="Puja Category" value={formatPujaValue(committee.pujaCategory)} />
            <DetailField label="Committee Description" value={committee.committeeDescription || '—'} />
          </div>
        </Card>

        <Card title="Contact Person">
          <div className="committee-detail-grid__inner">
            <DetailField label="Full Name" value={committee.contactPersonName} />
            <DetailField label="Designation" value={committee.designation} />
            <DetailField label="Email" value={committee.email} />
            <DetailField label="Mobile Number" value={committee.mobile} />
          </div>
        </Card>

        <Card title="Location">
          <div className="committee-detail-grid__inner">
            <DetailField label="Country" value={committee.country} />
            <DetailField label="State / Province" value={committee.state} />
            <DetailField label="City" value={committee.city} />
            <DetailField label="PIN / ZIP Code" value={committee.postalCode} />
            <DetailField label="Full Address" value={committee.address} />
          </div>
        </Card>

        <Card title="Puja Venue">
          <div className="committee-detail-grid__inner">
            <DetailField label="Venue / Pandal Name" value={committee.venueName} />
            <DetailField label="Landmark" value={committee.landmark || '—'} />
            <DetailField label="Venue Address" value={committee.venueAddress} />
          </div>
        </Card>
      </div>

      <Card title="Committee Portal Account" style={{ marginTop: 'var(--space-400)' }}>
        {committee.user ? (
          <div className="committee-detail-grid__inner">
            <DetailField label="Login Email" value={committee.user.email} />
            <DetailField
              label="Account Status"
              value={
                <StatusBadge tone={committee.user.status === 'ACTIVE' ? 'success' : 'default'}>
                  {committee.user.status.replace(/_/g, ' ')}
                </StatusBadge>
              }
            />
            <DetailField
              label="Created"
              value={
                committee.user.createdAt
                  ? dateTimeFormat.format(new Date(committee.user.createdAt))
                  : '—'
              }
            />
            {isDev && (
              <div className="committee-local-password" style={{ gridColumn: '1 / -1' }}>
                <Alert tone="warning">
                  <div className="committee-local-password__inner">
                    <div>
                      <div className="committee-local-password__title">Local development password</div>
                      {committee.user.initialPassword ? (
                        <code>{committee.user.initialPassword}</code>
                      ) : (
                        <span className="text-muted">No local password has been generated yet.</span>
                      )}
                    </div>
                    {canEdit && (
                      <Button variant="secondary" size="sm" disabled={busy} onClick={handleGenerateLocalPassword}>
                        Generate New Password
                      </Button>
                    )}
                  </div>
                </Alert>
              </div>
            )}
            {!isDev && (
              <p className="field__hint" style={{ gridColumn: '1 / -1' }}>
                A password setup link was sent to the login email when this application was approved.
              </p>
            )}
          </div>
        ) : committee.status === 'APPROVED' ? (
          <div className="committee-portal-empty">
            <p>This approved application does not yet have a portal account.</p>
            {canApprove && (
              <Button variant="primary" size="md" disabled={busy} onClick={handleCreatePortalAccount}>
                Create Portal Account
              </Button>
            )}
          </div>
        ) : (
          <p className="text-muted">
            A portal account will be created and a password setup link will be sent when this application is approved.
          </p>
        )}
      </Card>

      <Card title="Documents" style={{ marginTop: 'var(--space-400)' }}>
        <div className="committee-documents-grid">
          {DOCUMENTS.map(({ field, label, key }) =>
            committee[key] ? (
              <div key={field} className="committee-document-card">
                <div className="committee-document-card__title">{label}</div>
                {field === 'pandal_image' && pandalPreviewUrl && (
                  <img
                    src={pandalPreviewUrl}
                    alt={label}
                    className="committee-document-card__preview"
                  />
                )}
                <div className="committee-document-card__actions">
                  <Button variant="secondary" size="sm" onClick={() => handleDocument(field)}>
                    View
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleDocument(field, true)}>
                    Download
                  </Button>
                </div>
              </div>
            ) : null,
          )}
        </div>
      </Card>

      <Card title="Approval / Status History" style={{ marginTop: 'var(--space-400)' }}>
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
              {committee.histories && committee.histories.length > 0 ? (
                committee.histories.map((h) => (
                  <tr key={h.id}>
                    <td>{dateTimeFormat.format(new Date(h.createdAt))}</td>
                    <td>{h.previousStatus ? formatCommitteeStatus(h.previousStatus) : '—'}</td>
                    <td>{formatCommitteeStatus(h.newStatus)}</td>
                    <td>{h.changedBy?.name ?? 'System'}</td>
                    <td>{h.reason || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-400)' }}>
                    No status changes recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {(showAction('UNDER_REVIEW') || showAction('APPROVED') || showAction('REJECTED') || showAction('INACTIVE')) && (
        <div className="committee-detail-status-actions">
          {showAction('UNDER_REVIEW') && (
            <Button variant="secondary" size="md" onClick={() => setStatusAction('UNDER_REVIEW')}>
              Put Under Review
            </Button>
          )}
          {showAction('APPROVED') && (
            <Button variant="primary" size="md" onClick={() => setStatusAction('APPROVED')}>
              Approve
            </Button>
          )}
          {showAction('REJECTED') && (
            <Button variant="danger" size="md" onClick={() => setStatusAction('REJECTED')}>
              Reject
            </Button>
          )}
          {showAction('INACTIVE') && (
            <Button variant="secondary" size="md" onClick={() => setStatusAction('INACTIVE')}>
              Deactivate
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={statusAction !== null}
        title={statusAction ? `${formatCommitteeStatus(statusAction)} Application` : 'Update Application'}
        message={
          <div>
            {statusAction === 'REJECTED' ? (
              <>
                <p>Provide the mandatory reason for rejecting this application.</p>
                <div className="field" style={{ marginTop: 'var(--space-200)' }}>
                  <label className="field__label" htmlFor="statusReason">
                    Rejection Reason <span className="field__required">*</span>
                  </label>
                  <textarea
                    id="statusReason"
                    className="field__control"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <p>
                Confirm changing this application to <strong>{statusAction && formatCommitteeStatus(statusAction)}</strong>.
              </p>
            )}
          </div>
        }
        confirmLabel="Confirm"
        destructive={statusAction === 'REJECTED'}
        busy={busy}
        onConfirm={handleStatusChange}
        onCancel={() => {
          setStatusAction(null);
          setReason('');
        }}
      />
    </div>
  );
}

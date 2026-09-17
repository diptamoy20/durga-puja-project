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

function statusTone(status: CommitteeStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'UNDER_REVIEW':
      return 'warning';
    case 'REJECTED':
      return 'danger';
    case 'PENDING':
    default:
      return 'info';
  }
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
  const [portalAccountInfo, setPortalAccountInfo] = useState<{ email: string; generatedPassword?: string } | null>(null);

  const canEdit = can(PERMISSIONS.EDIT_COMMITTEES);
  const canApprove = can(PERMISSIONS.APPROVE_COMMITTEES);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    committeeService
      .get(Number(id))
      .then(setCommittee)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load committee.'))
      .finally(() => setLoading(false));
  }, [id]);

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
      toast.success(`Committee marked as ${statusAction}.`);
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
      const result = await committeeService.createPortalAccount(committee.id);
      setPortalAccountInfo(result);
      toast.success('Portal account created successfully!');
      // reload committee to see linked user
      const refreshed = await committeeService.get(committee.id);
      setCommittee(refreshed);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create portal account.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !committee) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Committee not found.'}</Alert>
        <Link to={ROUTES.COMMITTEES} className="btn btn--secondary btn--md">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-300)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', marginBottom: 'var(--space-100)' }}>
            <Link to={ROUTES.COMMITTEES} className="btn btn--secondary btn--sm">
              ← Back
            </Link>
            <StatusBadge tone={statusTone(committee.status)}>{committee.status}</StatusBadge>
          </div>
          <h1 className="page__title">{committee.committeeName}</h1>
          <p className="page__subtitle">
            Reg No: <strong>{committee.registrationNo}</strong>
            {committee.committeeId && <> · ID: <strong>{committee.committeeId}</strong></>}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
          {canEdit && (
            <Link to={ROUTES.COMMITTEE_EDIT(committee.id)} className="btn btn--secondary btn--md">
              Edit Details
            </Link>
          )}

          {canApprove && (
            <>
              {committee.status !== 'UNDER_REVIEW' && (
                <Button variant="secondary" size="md" onClick={() => setStatusAction('UNDER_REVIEW')}>
                  Mark Under Review
                </Button>
              )}
              {committee.status !== 'APPROVED' && (
                <Button variant="primary" size="md" onClick={() => setStatusAction('APPROVED')}>
                  Approve Application
                </Button>
              )}
              {committee.status !== 'REJECTED' && (
                <Button variant="danger" size="md" onClick={() => setStatusAction('REJECTED')}>
                  Reject Application
                </Button>
              )}
            </>
          )}

          {committee.status === 'APPROVED' && !committee.userId && (
            <Button variant="secondary" size="md" onClick={handleCreatePortalAccount} disabled={busy}>
              Create Portal Account
            </Button>
          )}
        </div>
      </header>

      {portalAccountInfo && (
        <Alert tone="success" style={{ marginBottom: 'var(--space-400)' }}>
          <div>
            <strong>Portal Account Created:</strong>
            <p>Email: <code>{portalAccountInfo.email}</code></p>
            {portalAccountInfo.generatedPassword && (
              <p>Generated Password: <code>{portalAccountInfo.generatedPassword}</code> (Please share this securely with the committee contact)</p>
            )}
          </div>
        </Alert>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-400)' }}>
        <Card title="Committee Information">
          <dl className="detail-list">
            <div><dt>Established Year</dt><dd>{committee.establishedYear}</dd></div>
            <div><dt>Puja Type</dt><dd>{committee.pujaType}</dd></div>
            <div><dt>Category</dt><dd>{committee.pujaCategory}</dd></div>
            <div><dt>Description</dt><dd>{committee.committeeDescription || '—'}</dd></div>
            <div><dt>Declaration</dt><dd>{committee.declaration ? 'Agreed' : 'No'}</dd></div>
            <div><dt>Registered Date</dt><dd>{dateTimeFormat.format(new Date(committee.createdAt))}</dd></div>
          </dl>
        </Card>

        <Card title="Contact Person">
          <dl className="detail-list">
            <div><dt>Name</dt><dd>{committee.contactPersonName}</dd></div>
            <div><dt>Designation</dt><dd>{committee.designation}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${committee.email}`}>{committee.email}</a></dd></div>
            <div><dt>Mobile</dt><dd><a href={`tel:${committee.mobile}`}>{committee.mobile}</a></dd></div>
            <div>
              <dt>Portal Account</dt>
              <dd>
                {committee.user ? (
                  <span className="badge badge--success">Linked ({committee.user.email})</span>
                ) : (
                  <span className="badge badge--muted">Not Created</span>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Location & Venue">
          <dl className="detail-list">
            <div><dt>Venue Name</dt><dd>{committee.venueName}</dd></div>
            <div><dt>Venue Address</dt><dd>{committee.venueAddress}</dd></div>
            <div><dt>Landmark</dt><dd>{committee.landmark || '—'}</dd></div>
            <div><dt>City / State</dt><dd>{committee.city}, {committee.state}</dd></div>
            <div><dt>Postal Code</dt><dd>{committee.postalCode}</dd></div>
            <div><dt>Country</dt><dd>{committee.country}</dd></div>
            <div><dt>Postal Address</dt><dd>{committee.address}</dd></div>
          </dl>
        </Card>

        <Card title="Uploaded Documents & Images">
          <dl className="detail-list">
            <div>
              <dt>Registration Certificate</dt>
              <dd>
                {committee.registrationCertificate ? (
                  <a href={committee.registrationCertificate} target="_blank" rel="noreferrer" className="btn btn--secondary btn--sm">
                    View Certificate ↗
                  </a>
                ) : '—'}
              </dd>
            </div>
            <div>
              <dt>Address Proof</dt>
              <dd>
                {committee.addressProof ? (
                  <a href={committee.addressProof} target="_blank" rel="noreferrer" className="btn btn--secondary btn--sm">
                    View Address Proof ↗
                  </a>
                ) : '—'}
              </dd>
            </div>
            <div>
              <dt>Pandal Image</dt>
              <dd>
                {committee.pandalImage ? (
                  <div>
                    <img
                      src={committee.pandalImage}
                      alt="Pandal"
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-100)' }}
                    />
                  </div>
                ) : '—'}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {committee.status !== 'PENDING' && (
        <Card title="Verification Details" style={{ marginTop: 'var(--space-400)' }}>
          <dl className="detail-list">
            {committee.approvedBy && (
              <>
                <div><dt>Approved By</dt><dd>{committee.approvedBy.name}</dd></div>
                <div><dt>Approved At</dt><dd>{committee.approvedAt ? dateTimeFormat.format(new Date(committee.approvedAt)) : '—'}</dd></div>
              </>
            )}
            {committee.rejectedBy && (
              <>
                <div><dt>Rejected By</dt><dd>{committee.rejectedBy.name}</dd></div>
                <div><dt>Rejected At</dt><dd>{committee.rejectedAt ? dateTimeFormat.format(new Date(committee.rejectedAt)) : '—'}</dd></div>
                <div><dt>Reason</dt><dd>{committee.rejectionReason ?? '—'}</dd></div>
              </>
            )}
            {committee.reviewedBy && (
              <>
                <div><dt>Reviewed By</dt><dd>{committee.reviewedBy.name}</dd></div>
                <div><dt>Reviewed At</dt><dd>{committee.reviewedAt ? dateTimeFormat.format(new Date(committee.reviewedAt)) : '—'}</dd></div>
              </>
            )}
          </dl>
        </Card>
      )}

      {committee.histories && committee.histories.length > 0 && (
        <Card title="Status History" style={{ marginTop: 'var(--space-400)' }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Previous Status</th>
                  <th>New Status</th>
                  <th>Reason</th>
                  <th>Changed By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {committee.histories.map((h) => (
                  <tr key={h.id}>
                    <td>{h.previousStatus ?? '—'}</td>
                    <td><StatusBadge tone={statusTone(h.newStatus as CommitteeStatus)}>{h.newStatus}</StatusBadge></td>
                    <td>{h.reason ?? '—'}</td>
                    <td>{h.changedBy?.name ?? (h.changedById ? `#${h.changedById}` : '—')}</td>
                    <td>{dateTimeFormat.format(new Date(h.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={statusAction !== null}
        title={`Change Committee Status to ${statusAction}`}
        message={
          <div>
            <p>Are you sure you want to change the status of <strong>{committee.committeeName}</strong> to <strong>{statusAction}</strong>?</p>
            <div style={{ marginTop: 'var(--space-200)' }}>
              <label className="field__label" htmlFor="statusReason">
                {statusAction === 'REJECTED' ? 'Reason for Rejection (required)' : 'Remarks / Note (optional)'}
              </label>
              <textarea
                id="statusReason"
                className="field__control"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
        }
        confirmLabel={statusAction === 'APPROVED' ? 'Approve' : statusAction === 'REJECTED' ? 'Reject' : 'Confirm'}
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

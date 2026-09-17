import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/constants/permissions';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { diasporaService } from '@/services/registrationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { DiasporaRegistration } from '@/types/registration';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true,
});

export function DiasporaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();

  const [reg, setReg] = useState<DiasporaRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const canVerify = can(PERMISSIONS.VERIFY_DIASPORA);
  const canReject = can(PERMISSIONS.REJECT_DIASPORA);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    diasporaService.get(Number(id))
      .then(setReg)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [id]);

  const confirmAction = async () => {
    if (!actionType || !reg) return;
    if (actionType === 'reject' && !reason.trim()) {
      toast.warning('A reason is required for rejection.');
      return;
    }
    setBusy(true);
    try {
      const updated = actionType === 'verify'
        ? await diasporaService.verify(reg.id, reason || undefined)
        : await diasporaService.reject(reg.id, reason);
      setReg(updated);
      toast.success(`Registration ${actionType === 'verify' ? 'verified' : 'rejected'} successfully.`);
      setActionType(null);
      setReason('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (!reg) return <Alert variant="warning">Registration not found.</Alert>;

  return (
    <div className="users-page">
      <div className="users-page__head">
        <h1 className="users-page__title">
          <Link to="/diaspora-verifications" className="breadcrumb-link">
            <i className="fas fa-arrow-left" /> Diaspora Verification
          </Link>
          {' / '}{reg.fullName}
        </h1>
        <div className="users-page__head-actions">
          {canVerify && reg.status === 'PENDING' && (
            <Button variant="success" onClick={() => setActionType('verify')}>
              <i className="fas fa-circle-check" /> Verify
            </Button>
          )}
          {canReject && reg.status === 'PENDING' && (
            <Button variant="danger" onClick={() => setActionType('reject')}>
              <i className="fas fa-circle-xmark" /> Reject
            </Button>
          )}
        </div>
      </div>

      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-400)' }}>
        <Card title="Registration Details">
          <dl className="detail-list">
            <div><dt>Registration No.</dt><dd><code>{reg.registrationNo}</code></dd></div>
            <div><dt>Status</dt><dd><StatusBadge status={reg.status} /></dd></div>
            <div><dt>Full Name</dt><dd>{reg.fullName}</dd></div>
            <div><dt>Date of Birth</dt><dd>{new Date(reg.dob).toLocaleDateString()}</dd></div>
            <div><dt>Gender</dt><dd>{reg.gender}</dd></div>
            <div><dt>Email</dt><dd>{reg.email}</dd></div>
            <div><dt>Mobile</dt><dd>{reg.mobile}</dd></div>
            <div><dt>Nationality</dt><dd>{reg.nationality}</dd></div>
            {reg.passportNo && <div><dt>Passport No.</dt><dd>{reg.passportNo}</dd></div>}
            <div><dt>Registered</dt><dd>{dateTimeFormat.format(new Date(reg.createdAt))}</dd></div>
          </dl>
        </Card>

        <Card title="Address & Origin">
          <dl className="detail-list">
            <div><dt>Country</dt><dd>{reg.country}</dd></div>
            <div><dt>City</dt><dd>{reg.city}</dd></div>
            {reg.state && <div><dt>State</dt><dd>{reg.state}</dd></div>}
            <div><dt>Address Line 1</dt><dd>{reg.address1}</dd></div>
            {reg.address2 && <div><dt>Address Line 2</dt><dd>{reg.address2}</dd></div>}
            {reg.postalCode && <div><dt>Postal Code</dt><dd>{reg.postalCode}</dd></div>}
            <div><dt>District of Origin</dt><dd>{reg.districtOrigin}</dd></div>
            {reg.village && <div><dt>Village</dt><dd>{reg.village}</dd></div>}
            <div><dt>Relationship with Bengal</dt><dd>{reg.relationshipWithBengal}</dd></div>
            {reg.languages && <div><dt>Languages</dt><dd>{reg.languages}</dd></div>}
            {reg.interests && reg.interests.length > 0 && (
              <div><dt>Interests</dt><dd>{reg.interests.join(', ')}</dd></div>
            )}
            <div><dt>Volunteer</dt><dd>{reg.volunteer ? 'Yes' : 'No'}</dd></div>
            <div><dt>Receive Updates</dt><dd>{reg.receiveUpdates ? 'Yes' : 'No'}</dd></div>
          </dl>
        </Card>
      </div>

      {reg.status !== 'PENDING' && (
        <Card title="Verification Details" style={{ marginTop: 'var(--space-400)' }}>
          <dl className="detail-list">
            {reg.verifiedBy && (
              <>
                <div><dt>Verified By</dt><dd>{reg.verifiedBy.name}</dd></div>
                <div><dt>Verified At</dt><dd>{reg.verifiedAt ? dateTimeFormat.format(new Date(reg.verifiedAt)) : '—'}</dd></div>
              </>
            )}
            {reg.rejectedBy && (
              <>
                <div><dt>Rejected By</dt><dd>{reg.rejectedBy.name}</dd></div>
                <div><dt>Rejected At</dt><dd>{reg.rejectedAt ? dateTimeFormat.format(new Date(reg.rejectedAt)) : '—'}</dd></div>
                <div><dt>Reason</dt><dd>{reg.rejectionReason ?? '—'}</dd></div>
              </>
            )}
          </dl>
        </Card>
      )}

      {reg.histories && reg.histories.length > 0 && (
        <Card title="Verification History" style={{ marginTop: 'var(--space-400)' }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Previous Status</th>
                  <th>New Status</th>
                  <th>Reason</th>
                  <th>Changed By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reg.histories.map((h) => (
                  <tr key={h.id}>
                    <td>{h.action}</td>
                    <td>{h.previousStatus ? <StatusBadge status={h.previousStatus} /> : '—'}</td>
                    <td><StatusBadge status={h.newStatus} /></td>
                    <td>{h.reason ?? '—'}</td>
                    <td>{h.changedBy?.name ?? '—'}</td>
                    <td>{dateTimeFormat.format(new Date(h.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={actionType !== null}
        title={actionType === 'verify' ? 'Verify Registration' : 'Reject Registration'}
        message={
          <div>
            <p>{actionType === 'verify' ? `Verify ${reg.fullName}?` : `Reject ${reg.fullName}?`}</p>
            <div style={{ marginTop: 'var(--space-200)' }}>
              <label className="field__label" htmlFor="action-reason">
                {actionType === 'reject' ? 'Reason (required)' : 'Remarks (optional)'}
              </label>
              <textarea
                id="action-reason"
                className="field__control"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
        }
        confirmLabel={actionType === 'verify' ? 'Verify' : 'Reject'}
        destructive={actionType === 'reject'}
        busy={busy}
        onConfirm={confirmAction}
        onCancel={() => { setActionType(null); setReason(''); }}
      />
    </div>
  );
}

export default DiasporaDetailPage;

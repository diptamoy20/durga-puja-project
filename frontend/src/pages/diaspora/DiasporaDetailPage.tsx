import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { formatGenderLabel, formatInterestLabel } from '@/constants/registration';
import { diasporaService } from '@/services/registrationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { DiasporaRegistration } from '@/types/registration';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

function detailValue(value: string | null | undefined): string {
  return value?.trim() ? value : '—';
}

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="detail-field">
      <div className="detail-field__label">{label}</div>
      <div className="detail-field__value">{detailValue(value)}</div>
    </div>
  );
}

export function DiasporaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();

  const [reg, setReg] = useState<DiasporaRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  const canVerify = can(PERMISSIONS.VERIFY_DIASPORA);
  const canReject = can(PERMISSIONS.REJECT_DIASPORA);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    diasporaService
      .get(Number(id))
      .then(setReg)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load registration.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVerify = async () => {
    if (!reg) return;
    setBusy(true);
    try {
      const updated = await diasporaService.verify(reg.id);
      setReg(updated);
      toast.success('Registration verified and login credentials sent.');
      setVerifyOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!reg || !rejectReason.trim()) {
      toast.warning('Rejection reason is required.');
      return;
    }
    setBusy(true);
    try {
      const updated = await diasporaService.reject(reg.id, rejectReason.trim());
      setReg(updated);
      toast.success('Registration rejected.');
      setRejectOpen(false);
      setRejectReason('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Rejection failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader label="Loading registration" />;
  if (error || !reg) {
    return (
      <Alert tone="danger">
        {error ?? 'Registration not found.'}{' '}
        <Link to={ROUTES.DIASPORA}>Back to diaspora verification</Link>
      </Alert>
    );
  }

  const address = [reg.address1, reg.address2].filter(Boolean).join(' ');
  const interests = reg.interests?.map(formatInterestLabel).join(', ') ?? '—';
  const tempPassword = reg.generatedPassword ?? reg.user?.initialPassword ?? 'Unavailable for an existing account';

  return (
    <div className="page">
      <PageHeader
        title="Diaspora Registration"
        description={reg.registrationNo}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Diaspora Verification', to: ROUTES.DIASPORA },
          { label: reg.registrationNo },
        ]}
        actions={
          reg.status === 'PENDING' ? (
            <>
              {canVerify && (
                <Button variant="primary" onClick={() => setVerifyOpen(true)}>
                  Verify
                </Button>
              )}
              {canReject && (
                <Button variant="danger" onClick={() => setRejectOpen(true)}>
                  Reject
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      <div className="diaspora-detail-layout">
        <Card
          title="Registration Details"
          actions={<StatusBadge status={reg.status} />}
        >
          <div className="diaspora-detail-grid">
            <DetailField label="Registration ID" value={reg.registrationNo} />
            <DetailField label="Full Name" value={reg.fullName} />
            <DetailField label="Email" value={reg.email} />
            <DetailField label="Mobile" value={reg.mobile} />
            <DetailField label="Date of Birth" value={dateFormat.format(new Date(reg.dob))} />
            <DetailField label="Gender" value={formatGenderLabel(reg.gender)} />
            <DetailField label="Country" value={reg.country} />
            <DetailField label="City" value={reg.city} />
            <DetailField label="State / Province" value={reg.state} />
            <DetailField label="Postal Code" value={reg.postalCode} />
            <DetailField label="Nationality" value={reg.nationality} />
            <DetailField label="Passport No." value={reg.passportNo} />
            <DetailField label="District of Origin" value={reg.districtOrigin} />
            <DetailField label="Village" value={reg.village} />
            <DetailField label="Relationship with Bengal" value={reg.relationshipWithBengal} />
            <DetailField label="Languages" value={reg.languages} />
            <DetailField label="Address" value={address} />
            <DetailField label="Registered On" value={dateTimeFormat.format(new Date(reg.createdAt))} />
            <DetailField label="Interests" value={interests} />
            <DetailField label="Volunteer" value={reg.volunteer ? 'Yes' : 'No'} />
            <DetailField label="Receives Updates" value={reg.receiveUpdates ? 'Yes' : 'No'} />
          </div>
        </Card>

        <div className="diaspora-detail-sidebar">
          <Card title="Verification">
            {reg.status === 'VERIFIED' && (
              <>
                <DetailField label="Verified by" value={reg.verifiedBy?.name} />
                <DetailField label="Verified on" value={reg.verifiedAt ? dateTimeFormat.format(new Date(reg.verifiedAt)) : null} />
                <DetailField label="Login email" value={reg.user?.email ?? reg.email} />
                <div className="detail-field">
                  <div className="detail-field__label">Temporary password</div>
                  <div className="detail-field__value detail-field__value--mono">{tempPassword}</div>
                </div>
              </>
            )}
            {reg.status === 'REJECTED' && (
              <>
                <DetailField label="Rejected by" value={reg.rejectedBy?.name} />
                <DetailField label="Rejected on" value={reg.rejectedAt ? dateTimeFormat.format(new Date(reg.rejectedAt)) : null} />
                <DetailField label="Reason" value={reg.rejectionReason} />
              </>
            )}
            {reg.status === 'PENDING' && (
              <p className="detail-empty">This registration is awaiting verification.</p>
            )}
          </Card>

          <Card title="Verification History">
            <div className="table-wrapper">
              <table className="table table--compact">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {(reg.histories ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="detail-empty">No verification activity yet.</td>
                    </tr>
                  ) : (
                    reg.histories?.map((history) => (
                      <tr key={history.id}>
                        <td>{dateTimeFormat.format(new Date(history.createdAt))}</td>
                        <td>{history.action.replace(/_/g, ' ')}</td>
                        <td>
                          {(history.previousStatus ?? 'New').replace(/_/g, ' ')} to {history.newStatus.replace(/_/g, ' ')}
                        </td>
                        <td>{history.reason ?? '—'}</td>
                        <td>{history.changedBy?.name ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={verifyOpen}
        title="Verify Registration"
        message="Verify this registration and create the login account?"
        confirmLabel="Verify"
        busy={busy}
        onConfirm={handleVerify}
        onCancel={() => setVerifyOpen(false)}
      />

      <Modal open={rejectOpen} title="Reject Registration" onClose={() => { setRejectOpen(false); setRejectReason(''); }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleReject();
          }}
        >
          <div className="field">
            <label className="field__label" htmlFor="detailRejectReason">
              Rejection reason <span className="field__required">*</span>
            </label>
            <textarea
              id="detailRejectReason"
              rows={4}
              required
              className="field__control"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" size="md" onClick={() => { setRejectOpen(false); setRejectReason(''); }}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="md" disabled={busy}>
              {busy ? 'Rejecting…' : 'Reject'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DiasporaDetailPage;

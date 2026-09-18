import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { diasporaService } from '@/services/registrationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { DiasporaListQuery, DiasporaRegistration, DiasporaStatus } from '@/types/registration';
import type { PaginationMeta } from '@/types';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const STATUS_FILTERS: Array<{ value: DiasporaStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function DiasporaListPage() {
  const toast = useToast();
  const { can } = useAuth();

  const [items, setItems] = useState<DiasporaRegistration[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [query, setQuery] = useState<DiasporaListQuery>({ page: 1, perPage: 15, sortDir: 'desc' });
  const [draftSearch, setDraftSearch] = useState('');
  const [draftStatus, setDraftStatus] = useState<DiasporaStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [verifyTarget, setVerifyTarget] = useState<DiasporaRegistration | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DiasporaRegistration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  const canVerify = can(PERMISSIONS.VERIFY_DIASPORA);
  const canReject = can(PERMISSIONS.REJECT_DIASPORA);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await diasporaService.list(query);
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((current) => ({
      ...current,
      search: draftSearch.trim() || undefined,
      status: draftStatus || undefined,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setDraftSearch('');
    setDraftStatus('');
    setQuery({ page: 1, perPage: 15, sortDir: 'desc' });
  };

  const confirmVerify = async () => {
    if (!verifyTarget) return;
    setBusy(true);
    try {
      await diasporaService.verify(verifyTarget.id);
      toast.success('Registration verified and login credentials sent.');
      setVerifyTarget(null);
      void load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setBusy(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.warning('Rejection reason is required.');
      return;
    }
    setBusy(true);
    try {
      await diasporaService.reject(rejectTarget.id, rejectReason.trim());
      toast.success('Registration rejected.');
      setRejectTarget(null);
      setRejectReason('');
      void load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Rejection failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Diaspora Verification"
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Diaspora Verification' }]}
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="mb-4">
        <form className="form-grid form-grid--3" onSubmit={applyFilters}>
          <div className="field">
            <label className="field__label" htmlFor="diasporaSearch">Search</label>
            <input
              id="diasporaSearch"
              className="field__control"
              placeholder="Registration ID, name, or email"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="diasporaStatus">Status</label>
            <select
              id="diasporaStatus"
              className="field__control"
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value as DiasporaStatus | '')}
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.label} value={filter.value}>{filter.label}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ alignSelf: 'end' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button type="submit" variant="primary" size="md">Search</Button>
              <Button type="button" variant="secondary" size="md" onClick={resetFilters}>Reset</Button>
            </div>
          </div>
        </form>
      </Card>

      <Card title="Registrations">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Registration ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Country</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Loading registrations…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>No diaspora registrations match the current filters.</td></tr>
              ) : (
                items.map((reg) => (
                  <tr key={reg.id}>
                    <td><strong>{reg.registrationNo}</strong></td>
                    <td>{reg.fullName}</td>
                    <td>{reg.email}</td>
                    <td>{reg.country}</td>
                    <td>{dateFormat.format(new Date(reg.createdAt))}</td>
                    <td><StatusBadge status={reg.status} /></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-150)', justifyContent: 'flex-end' }}>
                        <Link to={ROUTES.DIASPORA_DETAIL(reg.id)} className="btn btn--secondary btn--sm" aria-label={`View ${reg.fullName}`}>
                          View
                        </Link>
                        {canVerify && reg.status === 'PENDING' && (
                          <Button variant="secondary" size="sm" onClick={() => setVerifyTarget(reg)}>
                            Verify
                          </Button>
                        )}
                        {canReject && reg.status === 'PENDING' && (
                          <Button variant="danger" size="sm" onClick={() => setRejectTarget(reg)}>
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
      </Card>

      <ConfirmDialog
        open={verifyTarget !== null}
        title="Verify Registration"
        message="Verify this registration and create the login account?"
        confirmLabel="Verify"
        busy={busy}
        onConfirm={confirmVerify}
        onCancel={() => setVerifyTarget(null)}
      />

      <Modal
        open={rejectTarget !== null}
        title="Reject Registration"
        onClose={() => {
          setRejectTarget(null);
          setRejectReason('');
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirmReject();
          }}
        >
          <div className="field">
            <label className="field__label" htmlFor="rejectReason">
              Rejection reason <span className="field__required">*</span>
            </label>
            <textarea
              id="rejectReason"
              rows={4}
              required
              className="field__control"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" size="md" onClick={() => { setRejectTarget(null); setRejectReason(''); }}>
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

export default DiasporaListPage;

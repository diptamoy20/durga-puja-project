import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { PERMISSIONS } from '@/constants/permissions';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { diasporaService } from '@/services/registrationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type {
  DiasporaListQuery,
  DiasporaRegistration,
  DiasporaStats,
  DiasporaStatus,
} from '@/types/registration';
import type { PaginationMeta } from '@/types';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true,
});

const STATUS_FILTERS: Array<{ value: DiasporaStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

type PendingAction = { type: 'verify' | 'reject'; id: number; name: string } | null;

export function DiasporaListPage() {
  const toast = useToast();
  const { can } = useAuth();

  const [items, setItems] = useState<DiasporaRegistration[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [stats, setStats] = useState<DiasporaStats | null>(null);
  const [query, setQuery] = useState<DiasporaListQuery>({ page: 1, perPage: 15, sortDir: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<PendingAction>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const canVerify = can(PERMISSIONS.VERIFY_DIASPORA);
  const canReject = can(PERMISSIONS.REJECT_DIASPORA);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, statsResult] = await Promise.all([
        diasporaService.list(query),
        diasporaService.stats(),
      ]);
      setItems(result.items);
      setPagination(result.pagination);
      setStats(statsResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { void load(); }, [load]);

  const handleSearch = () => setQuery((q) => ({ ...q, search, page: 1 }));

  const confirmPending = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.type === 'verify') {
        await diasporaService.verify(pending.id, reason || undefined);
        toast.success(`${pending.name} verified successfully.`);
      } else {
        if (!reason.trim()) { toast.warning('Please provide a reason for rejection.'); setBusy(false); return; }
        await diasporaService.reject(pending.id, reason);
        toast.success(`${pending.name} rejected.`);
      }
      setPending(null);
      setReason('');
      void load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="users-page">
      <div className="users-page__head">
        <h1 className="users-page__title">Diaspora Verification</h1>
      </div>

      {stats && (
        <div className="dashboard-grid" style={{ marginBottom: 'var(--space-400)' }}>
          {[
            { label: 'Total', value: stats.total, tone: 'info' as const },
            { label: 'Pending', value: stats.pending, tone: 'warning' as const },
            { label: 'Verified', value: stats.verified, tone: 'success' as const },
            { label: 'Rejected', value: stats.rejected, tone: 'danger' as const },
          ].map((s) => (
            <div key={s.label} className={`metric-card metric-card--${s.tone}`}>
              <div className="metric-card__value">{s.value}</div>
              <div className="metric-card__label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      <Card className="card--filters">
        <div className="filters">
          <div className="filters__row">
            <div className="field field--search">
              <input
                className="field__control"
                type="text"
                placeholder="Search name, email, registration no."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="secondary" size="sm" onClick={handleSearch}>Search</Button>
            </div>

            <select
              className="field__control field__control--sm"
              value={query.status ?? ''}
              onChange={(e) => setQuery((q) => ({ ...q, status: (e.target.value || undefined) as DiasporaStatus | undefined, page: 1 }))}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="card--table" title="Registrations">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Reg. No</th>
                <th scope="col">Full Name</th>
                <th scope="col">Email</th>
                <th scope="col">Country</th>
                <th scope="col">Status</th>
                <th scope="col">Date</th>
                <th scope="col" className="table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr><td colSpan={7} className="table__placeholder"><Spinner label="Loading" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="table__placeholder">No registrations found.</td></tr>
              ) : (
                items.map((reg) => (
                  <tr key={reg.id}>
                    <td><code>{reg.registrationNo}</code></td>
                    <td>{reg.fullName}</td>
                    <td>{reg.email}</td>
                    <td>{reg.country}</td>
                    <td><StatusBadge status={reg.status} /></td>
                    <td>{dateTimeFormat.format(new Date(reg.createdAt))}</td>
                    <td className="table__actions">
                      <div className="row-actions">
                        <Link
                          to={`/diaspora-verifications/${reg.id}`}
                          className="icon-button icon-button--primary"
                          aria-label={`View ${reg.fullName}`}
                        >
                          <i className="fas fa-eye" aria-hidden="true" />
                        </Link>
                        {canVerify && reg.status === 'PENDING' && (
                          <button
                            type="button"
                            className="icon-button icon-button--success"
                            aria-label={`Verify ${reg.fullName}`}
                            onClick={() => setPending({ type: 'verify', id: reg.id, name: reg.fullName })}
                          >
                            <i className="fas fa-circle-check" aria-hidden="true" />
                          </button>
                        )}
                        {canReject && reg.status === 'PENDING' && (
                          <button
                            type="button"
                            className="icon-button icon-button--danger"
                            aria-label={`Reject ${reg.fullName}`}
                            onClick={() => setPending({ type: 'reject', id: reg.id, name: reg.fullName })}
                          >
                            <i className="fas fa-circle-xmark" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
          />
        )}
      </Card>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.type === 'verify' ? 'Verify Registration' : 'Reject Registration'}
        message={
          <div>
            <p>{pending?.type === 'verify'
              ? `Verify ${pending?.name}'s diaspora registration?`
              : `Reject ${pending?.name}'s diaspora registration?`}</p>
            <div style={{ marginTop: 'var(--space-200)' }}>
              <label className="field__label" htmlFor="reason">
                {pending?.type === 'reject' ? 'Reason (required)' : 'Remarks (optional)'}
              </label>
              <textarea
                id="reason"
                className="field__control"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
        }
        confirmLabel={pending?.type === 'verify' ? 'Verify' : 'Reject'}
        destructive={pending?.type === 'reject'}
        busy={busy}
        onConfirm={confirmPending}
        onCancel={() => { setPending(null); setReason(''); }}
      />
    </div>
  );
}

export default DiasporaListPage;

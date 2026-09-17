import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { committeeService } from '@/services/registrationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type {
  CommitteeListQuery,
  CommitteeStats,
  CommitteeStatus,
  PujaCommittee,
} from '@/types/registration';
import type { PaginationMeta } from '@/types';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const STATUS_FILTERS: Array<{ value: CommitteeStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

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

export function CommitteeListPage() {
  const toast = useToast();
  const { can } = useAuth();

  const [items, setItems] = useState<PujaCommittee[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [stats, setStats] = useState<CommitteeStats | null>(null);
  const [query, setQuery] = useState<CommitteeListQuery>({ page: 1, perPage: 15, sortDir: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<CommitteeStatus | null>(null);
  const [bulkReason, setBulkReason] = useState('');
  const [busy, setBusy] = useState(false);

  const canEdit = can(PERMISSIONS.EDIT_COMMITTEES);
  const canApprove = can(PERMISSIONS.APPROVE_COMMITTEES);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, statsResult] = await Promise.all([
        committeeService.list(query),
        committeeService.stats(),
      ]);
      setItems(result.items);
      setPagination(result.pagination);
      setStats(statsResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load committees.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((q) => ({ ...q, search: search.trim() || undefined, page: 1 }));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const executeBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    setBusy(true);
    try {
      const result = await committeeService.bulkAction(selectedIds, bulkAction, bulkReason || undefined);
      toast.success(`Updated ${result.succeeded} committees.`);
      setSelectedIds([]);
      setBulkAction(null);
      setBulkReason('');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk action failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Puja Committees</h1>
          <p className="page__subtitle">
            Manage puja committee applications, verifications, and approvals.
          </p>
        </div>
      </header>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-card__label">Total Committees</p>
            <p className="stat-card__value">{stats.total}</p>
          </div>
          <div className="stat-card stat-card--warning">
            <p className="stat-card__label">Pending Review</p>
            <p className="stat-card__value">{stats.pending}</p>
          </div>
          <div className="stat-card stat-card--info">
            <p className="stat-card__label">Under Review</p>
            <p className="stat-card__value">{stats.under_review}</p>
          </div>
          <div className="stat-card stat-card--success">
            <p className="stat-card__label">Approved</p>
            <p className="stat-card__value">{stats.approved}</p>
          </div>
          <div className="stat-card stat-card--danger">
            <p className="stat-card__label">Rejected</p>
            <p className="stat-card__value">{stats.rejected}</p>
          </div>
        </div>
      )}

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="filter-bar">
          <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              className="field__control"
              placeholder="Search committee, contact person, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="secondary" size="md">
              Search
            </Button>
          </form>

          <div className="filter-bar__filters">
            <select
              className="field__control"
              value={query.status ?? ''}
              onChange={(e) =>
                setQuery((q) => ({
                  ...q,
                  status: (e.target.value as CommitteeStatus) || undefined,
                  page: 1,
                }))
              }
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {canApprove && selectedIds.length > 0 && (
              <div className="bulk-actions" style={{ display: 'flex', gap: 'var(--space-200)' }}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setBulkAction('UNDER_REVIEW')}
                >
                  Mark Under Review ({selectedIds.length})
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setBulkAction('APPROVED')}
                >
                  Approve ({selectedIds.length})
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setBulkAction('REJECTED')}
                >
                  Reject ({selectedIds.length})
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                {canApprove && (
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedIds.length === items.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th>Reg No / Committee</th>
                <th>Contact Person</th>
                <th>Location</th>
                <th>Established</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    Loading committees…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    No committees found.
                  </td>
                </tr>
              ) : (
                items.map((committee) => (
                  <tr key={committee.id}>
                    {canApprove && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(committee.id)}
                          onChange={() => toggleSelect(committee.id)}
                        />
                      </td>
                    )}
                    <td>
                      <div>
                        <strong>{committee.committeeName}</strong>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                          {committee.registrationNo}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{committee.contactPersonName}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                        {committee.mobile} · {committee.email}
                      </div>
                    </td>
                    <td>{committee.city}, {committee.state}</td>
                    <td>{committee.establishedYear}</td>
                    <td>
                      <StatusBadge tone={statusTone(committee.status)}>
                        {committee.status}
                      </StatusBadge>
                    </td>
                    <td>{dateTimeFormat.format(new Date(committee.createdAt))}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-150)' }}>
                        <Link
                          to={ROUTES.COMMITTEE_DETAIL(committee.id)}
                          className="btn btn--secondary btn--sm"
                        >
                          View
                        </Link>
                        {canEdit && (
                          <Link
                            to={ROUTES.COMMITTEE_EDIT(committee.id)}
                            className="btn btn--secondary btn--sm"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.lastPage > 1 && (
          <Pagination
            meta={pagination}
            onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
          />
        )}
      </Card>

      <ConfirmDialog
        open={bulkAction !== null}
        title={`Bulk ${bulkAction} Committees`}
        message={
          <div>
            <p>
              Are you sure you want to set <strong>{bulkAction}</strong> status for {selectedIds.length} selected committees?
            </p>
            <div style={{ marginTop: 'var(--space-200)' }}>
              <label className="field__label" htmlFor="bulkReason">
                Reason / Note (optional)
              </label>
              <textarea
                id="bulkReason"
                className="field__control"
                rows={3}
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
              />
            </div>
          </div>
        }
        confirmLabel={`Apply to ${selectedIds.length}`}
        destructive={bulkAction === 'REJECTED'}
        busy={busy}
        onConfirm={executeBulkAction}
        onCancel={() => {
          setBulkAction(null);
          setBulkReason('');
        }}
      />
    </div>
  );
}

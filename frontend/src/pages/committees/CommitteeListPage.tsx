import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import {
  canTransitionCommittee,
  formatCommitteeStatus,
  formatPujaValue,
} from '@/constants/committee';
import { ROUTES } from '@/constants/routes';
import { committeeService } from '@/services/registrationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type {
  CommitteeBulkAction,
  CommitteeListQuery,
  CommitteeStats,
  CommitteeStatus,
  PujaCommittee,
} from '@/types/registration';
import type { PaginationMeta } from '@/types';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const ALL_STATUSES: CommitteeStatus[] = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'INACTIVE'];

const STATUS_FILTERS: Array<{ value: CommitteeStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const PAGE_TITLES: Record<string, string> = {
  '': 'Committee Applications',
  PENDING: 'Pending Approvals',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved Committees',
  REJECTED: 'Rejected Applications',
  INACTIVE: 'Inactive Committees',
};

const STAT_CARDS: Array<{
  key: keyof CommitteeStats | 'total';
  label: string;
  status?: CommitteeStatus;
  tone?: string;
}> = [
  { key: 'total', label: 'Total Applications' },
  { key: 'pending', label: 'Pending', status: 'PENDING', tone: 'warning' },
  { key: 'under_review', label: 'Under Review', status: 'UNDER_REVIEW', tone: 'info' },
  { key: 'approved', label: 'Approved', status: 'APPROVED', tone: 'success' },
  { key: 'rejected', label: 'Rejected', status: 'REJECTED', tone: 'danger' },
  { key: 'inactive', label: 'Inactive', status: 'INACTIVE', tone: 'default' },
];

const BULK_ACTIONS: Array<{ value: CommitteeBulkAction | ''; label: string }> = [
  { value: '', label: 'Bulk actions' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' },
  { value: 'status', label: 'Change Status' },
  { value: 'delete', label: 'Delete' },
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

export function CommitteeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { can } = useAuth();

  const statusParam = searchParams.get('status') as CommitteeStatus | null;
  const statusFilter = statusParam ?? undefined;
  const pageTitle = PAGE_TITLES[statusFilter ?? ''] ?? 'Committee Applications';

  const [items, setItems] = useState<PujaCommittee[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [stats, setStats] = useState<CommitteeStats | null>(null);
  const [query, setQuery] = useState<CommitteeListQuery>({ page: 1, perPage: 15, sortDir: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<CommitteeBulkAction | ''>('');
  const [bulkStatus, setBulkStatus] = useState<CommitteeStatus | ''>('');
  const [bulkReason, setBulkReason] = useState('');
  const [busy, setBusy] = useState(false);

  const [statusTarget, setStatusTarget] = useState<{ id: number; status: CommitteeStatus; name: string } | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PujaCommittee | null>(null);

  const canEdit = can(PERMISSIONS.EDIT_COMMITTEES);
  const canApprove = can(PERMISSIONS.APPROVE_COMMITTEES);
  const canDelete = can(PERMISSIONS.DELETE_COMMITTEES);
  const canExport = can(PERMISSIONS.EXPORT_COMMITTEES);

  /** Status filter always follows the URL (?status=), like the Laravel index. */
  const listQuery = useMemo(
    () => ({ ...query, status: statusFilter }),
    [query, statusFilter],
  );

  useEffect(() => {
    setQuery((q) => ({ ...q, page: 1, search: undefined }));
    setSearch('');
  }, [statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, statsResult] = await Promise.all([
        committeeService.list(listQuery),
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
  }, [listQuery]);

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
    if (!bulkAction || selectedIds.length === 0) {
      toast.warning('Select applications and a bulk action.');
      return;
    }
    if (bulkAction === 'reject' && !bulkReason.trim()) {
      toast.warning('A rejection reason is required.');
      return;
    }
    if (bulkAction === 'status' && !bulkStatus) {
      toast.warning('Select a status to apply.');
      return;
    }

    setBusy(true);
    try {
      const result = await committeeService.bulkAction(selectedIds, bulkAction, {
        status: bulkStatus || undefined,
        reason: bulkReason.trim() || undefined,
      });
      toast.success(`Updated ${result.succeeded} application(s).${result.failed ? ` ${result.failed} failed.` : ''}`);
      setSelectedIds([]);
      setBulkAction('');
      setBulkStatus('');
      setBulkReason('');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk action failed.');
    } finally {
      setBusy(false);
    }
  };

  const executeRowStatus = async () => {
    if (!statusTarget) return;
    if (statusTarget.status === 'REJECTED' && !statusReason.trim()) {
      toast.warning('A rejection reason is required.');
      return;
    }
    setBusy(true);
    try {
      await committeeService.changeStatus(statusTarget.id, statusTarget.status, statusReason.trim() || undefined);
      toast.success(`Application marked as ${formatCommitteeStatus(statusTarget.status)}.`);
      setStatusTarget(null);
      setStatusReason('');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setBusy(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await committeeService.remove(deleteTarget.id);
      toast.success('Application deleted.');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  const showRowAction = (committee: PujaCommittee, target: CommitteeStatus) =>
    canApprove && canTransitionCommittee(committee.status, target);

  return (
    <div className="page">
      <header className="page__header">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link to={ROUTES.DASHBOARD}>Dashboard</Link></li>
            <li><span>Puja Committee Management</span></li>
          </ol>
        </nav>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-300)' }}>
          <div>
            <h1 className="page__title">{pageTitle}</h1>
            <p className="page__subtitle">
              {statusFilter
                ? `Showing ${formatCommitteeStatus(statusFilter)} committee applications.`
                : 'Review and manage all puja committee registration applications.'}
            </p>
          </div>
          {canExport && (
            <Button variant="secondary" size="sm" onClick={() => committeeService.exportCsv(listQuery)}>
              Export CSV
            </Button>
          )}
        </div>
      </header>

      {stats && (
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {STAT_CARDS.map((card) => {
            const value = stats[card.key as keyof CommitteeStats] ?? 0;
            const active = card.status ? statusFilter === card.status : !statusFilter;
            const href = card.status
              ? `${ROUTES.COMMITTEES}?status=${card.status}`
              : ROUTES.COMMITTEES;
            return (
              <Link
                key={card.key}
                to={href}
                className={`stat-card ${card.tone ? `stat-card--${card.tone}` : ''}`}
                style={{ textDecoration: 'none', outline: active ? '2px solid var(--color-primary)' : undefined }}
              >
                <p className="stat-card__label">{card.label}</p>
                <p className="stat-card__value">{value}</p>
              </Link>
            );
          })}
        </div>
      )}

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="filter-bar">
          <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              className="field__control"
              placeholder="Search registration no., committee, contact, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="secondary" size="md">Filter</Button>
            {(query.search || statusFilter) && (
              <Link to={ROUTES.COMMITTEES} className="btn btn--secondary btn--md">
                Reset
              </Link>
            )}
          </form>
          <div className="filter-bar__filters">
            <select
              className="field__control"
              value={statusFilter ?? ''}
              onChange={(e) => {
                const status = (e.target.value as CommitteeStatus) || undefined;
                setQuery((q) => ({ ...q, page: 1 }));
                setSearchParams(status ? { status } : {});
              }}
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                  {stats && option.value === 'PENDING' ? ` (${stats.pending})` : ''}
                  {stats && option.value === 'UNDER_REVIEW' ? ` (${stats.under_review})` : ''}
                  {stats && option.value === 'APPROVED' ? ` (${stats.approved})` : ''}
                  {stats && option.value === 'REJECTED' ? ` (${stats.rejected})` : ''}
                  {stats && option.value === 'INACTIVE' ? ` (${stats.inactive})` : ''}
                  {stats && !option.value ? ` (${stats.total})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="list-toolbar">
          <h2 className="list-toolbar__title">Applications</h2>
          {(canApprove || canDelete) && (
            <div className="list-toolbar__actions">
              <select
                className="field__control field__control--sm"
                value={bulkAction}
                onChange={(e) => {
                  setBulkAction(e.target.value as CommitteeBulkAction | '');
                  if (e.target.value !== 'status') setBulkStatus('');
                  if (e.target.value !== 'reject') setBulkReason('');
                }}
              >
                {BULK_ACTIONS.map((option) => (
                  <option key={option.value || 'none'} value={option.value}>{option.label}</option>
                ))}
              </select>
              {bulkAction === 'status' && (
                <select
                  className="field__control field__control--sm"
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as CommitteeStatus | '')}
                >
                  <option value="">Select status</option>
                  {ALL_STATUSES.map((status) => (
                    <option key={status} value={status}>{formatCommitteeStatus(status)}</option>
                  ))}
                </select>
              )}
              {bulkAction === 'reject' && (
                <input
                  className="field__control field__control--sm"
                  placeholder="Rejection reason"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                />
              )}
              <Button
                size="sm"
                variant="primary"
                disabled={busy || selectedIds.length === 0 || !bulkAction}
                onClick={executeBulkAction}
              >
                Apply
              </Button>
            </div>
          )}
        </div>

        <div className="table-wrapper committee-table-wrapper">
          <table className="table committee-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedIds.length === items.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th>Registration No.</th>
                <th>Committee ID</th>
                <th>Committee Name</th>
                <th>Puja Type</th>
                <th>Puja Category</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>City</th>
                <th>State / Province</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    Loading applications…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    No committee applications match the current filters.
                  </td>
                </tr>
              ) : (
                items.map((committee) => (
                  <tr key={committee.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(committee.id)}
                        onChange={() => toggleSelect(committee.id)}
                        aria-label={`Select ${committee.registrationNo}`}
                      />
                    </td>
                    <td className="text-nowrap"><strong>{committee.registrationNo}</strong></td>
                    <td className="text-nowrap">{committee.committeeId ?? 'Pending approval'}</td>
                    <td>{committee.committeeName}</td>
                    <td>{formatPujaValue(committee.pujaType)}</td>
                    <td>{formatPujaValue(committee.pujaCategory)}</td>
                    <td>{committee.contactPersonName}</td>
                    <td>{committee.email}</td>
                    <td>{committee.mobile}</td>
                    <td>{committee.city}</td>
                    <td>{committee.state}</td>
                    <td>
                      <StatusBadge tone={statusTone(committee.status)}>
                        {formatCommitteeStatus(committee.status)}
                      </StatusBadge>
                    </td>
                    <td className="text-nowrap">{dateFormat.format(new Date(committee.createdAt))}</td>
                    <td>
                      <div className="committee-row-actions">
                        <Link
                          to={ROUTES.COMMITTEE_DETAIL(committee.id)}
                          className="btn btn--secondary btn--sm"
                          title="View application"
                        >
                          View
                        </Link>
                        {canEdit && (
                          <Link
                            to={ROUTES.COMMITTEE_EDIT(committee.id)}
                            className="btn btn--secondary btn--sm"
                            title="Edit application"
                          >
                            Edit
                          </Link>
                        )}
                        {showRowAction(committee, 'APPROVED') && (
                          <Button
                            size="sm"
                            variant="success"
                            title="Approve application"
                            onClick={() =>
                              setStatusTarget({
                                id: committee.id,
                                status: 'APPROVED',
                                name: committee.committeeName,
                              })
                            }
                          >
                            Approve
                          </Button>
                        )}
                        {showRowAction(committee, 'REJECTED') && (
                          <Button
                            size="sm"
                            variant="danger"
                            title="Reject application"
                            onClick={() =>
                              setStatusTarget({
                                id: committee.id,
                                status: 'REJECTED',
                                name: committee.committeeName,
                              })
                            }
                          >
                            Reject
                          </Button>
                        )}
                        {showRowAction(committee, 'UNDER_REVIEW') && (
                          <Button
                            size="sm"
                            variant="secondary"
                            title="Put under review"
                            onClick={() =>
                              setStatusTarget({
                                id: committee.id,
                                status: 'UNDER_REVIEW',
                                name: committee.committeeName,
                              })
                            }
                          >
                            Review
                          </Button>
                        )}
                        {showRowAction(committee, 'INACTIVE') && (
                          <Button
                            size="sm"
                            variant="secondary"
                            title="Deactivate application"
                            onClick={() =>
                              setStatusTarget({
                                id: committee.id,
                                status: 'INACTIVE',
                                name: committee.committeeName,
                              })
                            }
                          >
                            Deactivate
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="danger"
                            title="Delete application"
                            onClick={() => setDeleteTarget(committee)}
                          >
                            Delete
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

        {pagination && pagination.lastPage > 1 && (
          <Pagination meta={pagination} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
        )}
      </Card>

      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget ? `${formatCommitteeStatus(statusTarget.status)} Application` : 'Update Application'}
        message={
          statusTarget && (
            <div>
              {statusTarget.status === 'REJECTED' ? (
                <>
                  <p>Provide the mandatory reason for rejecting this application.</p>
                  <div className="field" style={{ marginTop: 'var(--space-200)' }}>
                    <label className="field__label" htmlFor="rowRejectReason">
                      Rejection Reason <span className="field__required">*</span>
                    </label>
                    <textarea
                      id="rowRejectReason"
                      className="field__control"
                      rows={4}
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <p>
                  Confirm changing <strong>{statusTarget.name}</strong> to{' '}
                  <strong>{formatCommitteeStatus(statusTarget.status)}</strong>.
                </p>
              )}
            </div>
          )
        }
        confirmLabel="Confirm"
        destructive={statusTarget?.status === 'REJECTED'}
        busy={busy}
        onConfirm={executeRowStatus}
        onCancel={() => {
          setStatusTarget(null);
          setStatusReason('');
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Application"
        message="This will remove the application from active management lists."
        confirmLabel="Delete"
        destructive
        busy={busy}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

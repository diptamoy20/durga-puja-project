import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

function RowActionButton({
  title,
  label,
  onClick,
  variant = 'secondary',
}: {
  title: string;
  label: string;
  onClick: () => void;
  variant?: 'secondary' | 'primary' | 'danger' | 'success' | 'info';
}) {
  return (
    <button
      type="button"
      className={`committee-row-action committee-row-action--${variant}`}
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      {label}
    </button>
  );
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
            <h1 className="page__title">Committee Applications</h1>
          </div>
          {canExport && (
            <Button variant="secondary" size="sm" onClick={() => committeeService.exportCsv(query)}>
              Export CSV
            </Button>
          )}
        </div>
      </header>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-card__label">Total Applications</p>
            <p className="stat-card__value">{stats.total}</p>
          </div>
          <div className="stat-card stat-card--warning">
            <p className="stat-card__label">Pending</p>
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
          <div className="stat-card">
            <p className="stat-card__label">Inactive</p>
            <p className="stat-card__value">{stats.inactive ?? 0}</p>
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
              placeholder="Search registration no., committee, contact, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="secondary" size="md">Search</Button>
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
              <option value="">All Status</option>
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>{formatCommitteeStatus(status)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="committee-bulk-toolbar">
          <h2 className="committee-bulk-toolbar__title">Applications</h2>
          {(canApprove || canDelete) && (
            <div className="committee-bulk-toolbar__actions">
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
                variant="secondary"
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
                          className="committee-row-action committee-row-action--secondary"
                          title="View application"
                          aria-label="View application"
                        >
                          View
                        </Link>
                        {canEdit && (
                          <Link
                            to={ROUTES.COMMITTEE_EDIT(committee.id)}
                            className="committee-row-action committee-row-action--primary"
                            title="Edit application"
                            aria-label="Edit application"
                          >
                            Edit
                          </Link>
                        )}
                        {showRowAction(committee, 'APPROVED') && (
                          <RowActionButton
                            title="Approve application"
                            label="✓"
                            variant="success"
                            onClick={() => setStatusTarget({ id: committee.id, status: 'APPROVED', name: committee.committeeName })}
                          />
                        )}
                        {showRowAction(committee, 'REJECTED') && (
                          <RowActionButton
                            title="Reject application"
                            label="✕"
                            variant="danger"
                            onClick={() => setStatusTarget({ id: committee.id, status: 'REJECTED', name: committee.committeeName })}
                          />
                        )}
                        {showRowAction(committee, 'UNDER_REVIEW') && (
                          <RowActionButton
                            title="Put under review"
                            label="Review"
                            variant="info"
                            onClick={() => setStatusTarget({ id: committee.id, status: 'UNDER_REVIEW', name: committee.committeeName })}
                          />
                        )}
                        {showRowAction(committee, 'INACTIVE') && (
                          <RowActionButton
                            title="Deactivate application"
                            label="Pause"
                            variant="secondary"
                            onClick={() => setStatusTarget({ id: committee.id, status: 'INACTIVE', name: committee.committeeName })}
                          />
                        )}
                        {canDelete && (
                          <RowActionButton
                            title="Delete application"
                            label="Del"
                            variant="danger"
                            onClick={() => setDeleteTarget(committee)}
                          />
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

import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { RejectAssociationModal } from '@/components/associations/RejectAssociationModal';
import { ROUTES } from '@/constants/routes';
import { associationService, type AssociationDetail, type AssociationStatus } from '@/services/associationService';
import { useToast } from '@/hooks/useToast';
import type { PaginationMeta } from '@/types';

import '@/styles/associations-admin.css';

const STATUS_OPTIONS: Array<{ value: AssociationStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const STATUS_ACTIONS_STATUS: Record<AssociationStatus, Array<{ status: AssociationStatus; label: string; variant: 'success' | 'danger' | 'secondary' }>> = {
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

export function AssociationListPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [associations, setAssociations] = useState<AssociationDetail[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: number; name: string } | null>(null);

  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const country = searchParams.get('country') ?? '';
  const state = searchParams.get('state') ?? '';
  const city = searchParams.get('city') ?? '';
  const page = Number(searchParams.get('page') ?? '1') || 1;

  const [draftSearch, setDraftSearch] = useState(search);
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftCountry, setDraftCountry] = useState(country);
  const [draftState, setDraftState] = useState(state);
  const [draftCity, setDraftCity] = useState(city);

  useEffect(() => {
    setDraftSearch(search);
    setDraftStatus(status);
    setDraftCountry(country);
    setDraftState(state);
    setDraftCity(city);
  }, [search, status, country, state, city]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await associationService.adminList({
        page,
        perPage: 15,
        search: search || undefined,
        status: (status as AssociationStatus) || undefined,
        country: country || undefined,
        state: state || undefined,
        city: city || undefined,
      });
      setAssociations(res.items);
      setPagination(res.pagination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load associations.';
      toastError(msg);
      setAssociations([]);
      setPagination(undefined);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, country, state, city, toastError]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (draftSearch.trim()) params.search = draftSearch.trim();
    if (draftStatus) params.status = draftStatus;
    if (draftCountry) params.country = draftCountry;
    if (draftState) params.state = draftState;
    if (draftCity) params.city = draftCity;
    setSearchParams(params);
  };

  const handleStatusChange = async (id: number, newStatus: AssociationStatus, name: string) => {
    if (newStatus === 'REJECTED') {
      setRejectTarget({ id, name });
      return;
    }
    try {
      await associationService.changeStatus(id, newStatus);
      toastSuccess(`Association ${newStatus.toLowerCase().replace('_', ' ')}.`);
      void load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      toastError(msg);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    setSubmittingId(rejectTarget.id);
    try {
      await associationService.changeStatus(rejectTarget.id, 'REJECTED', reason);
      toastSuccess('Association rejected.');
      setRejectTarget(null);
      void load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      toastError(msg);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="associations-admin__header">
        <div>
          <h1>Association Directory</h1>
          <p>
            Review, approve, and manage all association directory entries.
          </p>
        </div>
        <Link to={ROUTES.ASSOCIATION_IMPORT} className="btn btn--primary btn--md">
          + Add / Import Association
        </Link>
      </div>

      <Card>
        <form onSubmit={applyFilters}>
          <div className="associations-admin__filter">
            <div>
              <label htmlFor="alSearch">Search</label>
              <input id="alSearch" value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} className="field__control" placeholder="Name, email, city…" />
            </div>
            <div>
              <label htmlFor="alStatus">Status</label>
              <select id="alStatus" value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)} className="field__control">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="alCountry">Country</label>
              <input id="alCountry" value={draftCountry} onChange={(e) => setDraftCountry(e.target.value)} className="field__control" placeholder="Country" />
            </div>
            <div>
              <label htmlFor="alState">State / Region</label>
              <input id="alState" value={draftState} onChange={(e) => setDraftState(e.target.value)} className="field__control" placeholder="State" />
            </div>
            <div className="associations-admin__filter-actions">
              <Button type="submit">Filter</Button>
              <Button type="button" variant="secondary" onClick={() => setSearchParams({})}>Reset</Button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="associations-admin__state">
            <Spinner size="lg" label="Loading associations" />
            <p className="associations-admin__state-text">Loading associations…</p>
          </div>
        ) : associations.length === 0 ? (
          <div className="associations-admin__state">
            <div className="associations-admin__state-icon" aria-hidden="true">🏢</div>
            <h2 className="associations-admin__state-title">No associations found</h2>
            <p className="associations-admin__state-text">
              No associations match the current filters. New entries created or imported will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="associations-admin__table-wrap">
              <table className="associations-admin__table">
                <thead>
                  <tr>
                    <th>Association</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Registration No.</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {associations.map((assoc) => (
                    <tr key={assoc.id}>
                      <td>
                        <Link to={ROUTES.ASSOCIATION_DETAIL(assoc.id)} className="associations-admin__name">
                          {assoc.name}
                        </Link>
                        <div className="associations-admin__muted">{assoc.description?.substring(0, 60)}…</div>
                      </td>
                      <td style={{ fontSize: 'var(--font-sm)' }}>
                        {assoc.contactPersonName}<br />
                        {assoc.email}
                      </td>
                      <td style={{ fontSize: 'var(--font-sm)' }}>
                        {assoc.city}, {assoc.state}, {assoc.country}
                      </td>
                      <td>
                        <StatusBadge status={assoc.status} />
                      </td>
                      <td className="associations-admin__mono">{assoc.registrationNo}</td>
                      <td className="associations-admin__muted">{dateFormat.format(new Date(assoc.createdAt))}</td>
                      <td>
                        <div className="associations-admin__actions">
                          <Link to={ROUTES.ASSOCIATION_DETAIL(assoc.id)} className="btn btn--secondary btn--sm">View</Link>
                          <Link to={ROUTES.ASSOCIATION_EDIT(assoc.id)} className="btn btn--secondary btn--sm">Edit</Link>
                          {STATUS_ACTIONS_STATUS[assoc.status].map((action) => (
                            <Button
                              key={action.status}
                              variant={action.variant}
                              size="sm"
                              onClick={() => handleStatusChange(assoc.id, action.status, assoc.name)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.lastPage > 1 && (
              <div className="associations-admin__pagination">
                <Pagination
                  meta={pagination}
                  onPageChange={(nextPage) => {
                    const params = Object.fromEntries(searchParams.entries());
                    params.page = String(nextPage);
                    setSearchParams(params);
                  }}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <RejectAssociationModal
        open={rejectTarget !== null}
        associationName={rejectTarget?.name ?? ''}
        busy={submittingId === rejectTarget?.id}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
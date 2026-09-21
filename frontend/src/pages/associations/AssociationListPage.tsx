import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { RejectAssociationModal } from '@/components/associations/RejectAssociationModal';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { associationService, type AssociationDetail, type AssociationStatus } from '@/services/associationService';
import { useToast } from '@/hooks/useToast';
import type { PaginationMeta } from '@/types';

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

const STATUS_ACTIONS: Record<AssociationStatus, Array<{ status: AssociationStatus; label: string; variant: 'success' | 'danger' | 'secondary' }>> = {
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
  const navigate = useNavigate();
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
    <div className="users-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to={ROUTES.DASHBOARD}>Dashboard</Link></li>
          <li><span>Association Directory</span></li>
        </ol>
      </nav>

      <div className="users-page__head">
        <h1 className="users-page__title">Association Directory</h1>
        <div className="users-page__actions">
          <Button
            variant="success"
            leadingIcon={<i className="fas fa-circle-plus" aria-hidden="true" />}
            onClick={() => navigate(ROUTES.ASSOCIATION_CREATE)}
          >
            Add Association
          </Button>
          <Button variant="secondary" onClick={() => navigate(ROUTES.ASSOCIATION_IMPORT)}>
            Import Associations
          </Button>
        </div>
      </div>

      <Card className="card--filters">
        <form onSubmit={applyFilters} className="user-filters">
          <div className="user-filters__field user-filters__field--search">
            <label className="field__label" htmlFor="assoc-search">
              Search
            </label>
            <input
              id="assoc-search"
              type="search"
              className="field__control"
              placeholder="Search by name, email, city…"
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
            />
          </div>

          <div className="user-filters__field">
            <label className="field__label" htmlFor="assoc-status">
              Status
            </label>
            <select
              id="assoc-status"
              className="field__control"
              value={draftStatus}
              onChange={(event) => setDraftStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="user-filters__field">
            <label className="field__label" htmlFor="assoc-country">
              Country
            </label>
            <input
              id="assoc-country"
              className="field__control"
              placeholder="Country"
              value={draftCountry}
              onChange={(event) => setDraftCountry(event.target.value)}
            />
          </div>

          <div className="user-filters__field">
            <label className="field__label" htmlFor="assoc-state">
              State / Region
            </label>
            <input
              id="assoc-state"
              className="field__control"
              placeholder="State / Region"
              value={draftState}
              onChange={(event) => setDraftState(event.target.value)}
            />
          </div>

          <div className="user-filters__field">
            <label className="field__label" htmlFor="assoc-city">
              City
            </label>
            <input
              id="assoc-city"
              className="field__control"
              placeholder="City"
              value={draftCity}
              onChange={(event) => setDraftCity(event.target.value)}
            />
          </div>

          <div className="user-filters__actions" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
            <Button type="submit" style={{ flex: '0 0 auto' }}>Filter</Button>
            <Button type="button" variant="secondary" style={{ flex: '0 0 auto' }} onClick={() => setSearchParams({})}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <Card className="card--table" title="Associations">
        <div className="table-wrapper">
          <table className="table table--users">
            <thead>
              <tr>
                <th scope="col">Association</th>
                <th scope="col">Contact</th>
                <th scope="col">Location</th>
                <th scope="col">Status</th>
                <th scope="col">Registration No.</th>
                <th scope="col">Created</th>
                <th scope="col" className="table__actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="table__placeholder">
                    Loading associations…
                  </td>
                </tr>
              ) : associations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table__placeholder">
                    No associations match the current filters. New entries created or imported will appear here.
                  </td>
                </tr>
              ) : (
                associations.map((assoc) => (
                  <tr key={assoc.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell__text">
                          <Link to={ROUTES.ASSOCIATION_DETAIL(assoc.id)} className="user-cell__name">
                            {assoc.name}
                          </Link>
                          <span className="user-cell__email">{assoc.description?.substring(0, 60)}…</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {assoc.contactPersonName}
                      <br />
                      <span className="table__secondary">{assoc.email}</span>
                    </td>

                    <td>{[assoc.city, assoc.state, assoc.country].filter(Boolean).join(', ') || '—'}</td>

                    <td>
                      <StatusBadge status={assoc.status} />
                    </td>

                    <td>{assoc.registrationNo}</td>

                    <td>{dateFormat.format(new Date(assoc.createdAt))}</td>

                    <td className="table__actions">
                      <div className="row-actions">
                        <Link
                          to={ROUTES.ASSOCIATION_DETAIL(assoc.id)}
                          className="icon-button icon-button--primary"
                          aria-label={`View ${assoc.name}`}
                        >
                          <i className="fas fa-eye" aria-hidden="true" />
                        </Link>
                        <Link
                          to={ROUTES.ASSOCIATION_EDIT(assoc.id)}
                          className="icon-button icon-button--secondary"
                          aria-label={`Edit ${assoc.name}`}
                        >
                          <i className="fas fa-pencil" aria-hidden="true" />
                        </Link>
                        {STATUS_ACTIONS[assoc.status].map((action) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination pagination={pagination} onPageChange={(nextPage) => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(nextPage) })} />
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
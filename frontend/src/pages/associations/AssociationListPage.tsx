import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ROUTES } from '@/constants/routes';
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

  const handleStatusChange = async (id: number, newStatus: AssociationStatus) => {
    let reason: string | undefined;
    if (newStatus === 'REJECTED') {
      reason = window.prompt('Reason for rejection:') ?? undefined;
      if (!reason) return;
    }
    try {
      await associationService.changeStatus(id, newStatus, reason);
      toastSuccess(`Association ${newStatus.toLowerCase().replace('_', ' ')}.`);
      void load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      toastError(msg);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-400)' }}>
        <div>
          <h1 style={{ margin: '0 0 var(--space-100)', fontSize: 'var(--font-xl)' }}>Association Directory</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            Review, approve, and manage all association directory entries.
          </p>
        </div>
        <Link to={ROUTES.ASSOCIATION_IMPORT} className="btn btn--primary btn--md">
          + Add / Import Association
        </Link>
      </div>

      <Card>
        <form onSubmit={applyFilters} style={{ marginBottom: 'var(--space-400)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr)) auto', gap: 'var(--space-300)', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>Search</label>
              <input value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} className="field__control" placeholder="Name, email, city…" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>Status</label>
              <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)} className="field__control">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>Country</label>
              <input value={draftCountry} onChange={(e) => setDraftCountry(e.target.value)} className="field__control" placeholder="Country" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>State / City</label>
              <input value={draftState} onChange={(e) => setDraftState(e.target.value)} className="field__control" placeholder="State" />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-100)' }}>
              <Button type="submit">Filter</Button>
              <Button type="button" variant="secondary" onClick={() => setSearchParams({})}>Reset</Button>
            </div>
          </div>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-600)' }}>Loading associations…</div>
        ) : associations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-600)', color: 'var(--color-text-muted)' }}>No associations found.</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Association</th>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Contact</th>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Location</th>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Registration No.</th>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Created</th>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {associations.map((assoc) => (
                    <tr key={assoc.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-200) var(--space-300)' }}>
                        <Link to={ROUTES.ASSOCIATION_DETAIL(assoc.id)} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div style={{ fontWeight: 600 }}>{assoc.name}</div>
                          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>{assoc.description?.substring(0, 60)}…</div>
                        </Link>
                      </td>
                      <td style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-sm)' }}>
                        {assoc.contactPersonName}<br />
                        {assoc.email}
                      </td>
                      <td style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-sm)' }}>
                        {assoc.city}, {assoc.state}, {assoc.country}
                      </td>
                      <td style={{ padding: 'var(--space-200) var(--space-300)' }}>
                        <StatusBadge status={assoc.status} />
                      </td>
                      <td style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontFamily: 'monospace' }}>{assoc.registrationNo}</td>
                      <td style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>{dateFormat.format(new Date(assoc.createdAt))}</td>
                      <td style={{ padding: 'var(--space-200) var(--space-300)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
                          <Link to={ROUTES.ASSOCIATION_DETAIL(assoc.id)} className="btn btn--secondary btn--sm">View</Link>
                          <Link to={ROUTES.ASSOCIATION_EDIT(assoc.id)} className="btn btn--secondary btn--sm">Edit</Link>
                          {STATUS_ACTIONS_STATUS[assoc.status].map((action) => (
                            <Button
                              key={action.status}
                              variant={action.variant}
                              size="sm"
                              onClick={() => handleStatusChange(assoc.id, action.status)}
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
              <Pagination
                meta={pagination}
                onPageChange={(nextPage) => {
                  const params = Object.fromEntries(searchParams.entries());
                  params.page = String(nextPage);
                  setSearchParams(params);
                }}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
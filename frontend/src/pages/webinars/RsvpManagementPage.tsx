import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { WebinarBreadcrumb } from '@/components/webinars/WebinarBreadcrumb';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { adminWebinarService } from '@/services/eventsService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { RsvpStatus, Webinar, WebinarRegistration } from '@/types/events';
import type { PaginationMeta } from '@/types';
import '@/styles/webinars-admin.css';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const RSVP_STATUS_OPTIONS: Array<{ value: RsvpStatus | ''; label: string }> = [
  { value: '', label: 'All RSVP Statuses' },
  { value: 'REGISTERED', label: 'Registered' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ATTENDED', label: 'Attended' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
];

function rsvpTone(status: RsvpStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'ATTENDED':
    case 'CONFIRMED':
      return 'success';
    case 'REGISTERED':
      return 'info';
    case 'CANCELLED':
    case 'NO_SHOW':
    default:
      return 'danger';
  }
}

export function RsvpManagementPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_WEBINAR_RSVPS);

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [rsvps, setRsvps] = useState<WebinarRegistration[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminWebinarService.get(Number(id)).then(setWebinar).catch(() => {});
  }, [id]);

  const load = useCallback(
    async (page = 1) => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await adminWebinarService.rsvps(Number(id), {
          page,
          perPage: 20,
          status: statusFilter || undefined,
          search: search.trim() || undefined,
        });
        setRsvps(res.items);
        setPagination(res.pagination);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load RSVPs.');
      } finally {
        setLoading(false);
      }
    },
    [id, statusFilter, search],
  );

  useEffect(() => {
    load();
  }, [load]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { total: rsvps.length };
    for (const rsvp of rsvps) {
      counts[rsvp.status] = (counts[rsvp.status] ?? 0) + 1;
    }
    return counts;
  }, [rsvps]);

  const handleStatusChange = async (rsvpId: number, newStatus: RsvpStatus) => {
    if (!id || !canManage) return;
    try {
      await adminWebinarService.updateRsvpStatus(Number(id), rsvpId, newStatus);
      toast.success(`RSVP updated to ${newStatus}.`);
      setRsvps((prev) => prev.map((r) => (r.id === rsvpId ? { ...r, status: newStatus } : r)));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update RSVP status.');
    }
  };

  const handleExport = async () => {
    if (!id) return;
    setExporting(true);
    try {
      await adminWebinarService.exportRsvps(Number(id));
      toast.success('RSVP export downloaded.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  return (
    <div className="page">
      <header className="webinar-rsvp-header">
        <WebinarBreadcrumb
          items={[
            { label: 'Webinars', to: ROUTES.WEBINARS },
            ...(id
              ? [
                  { label: webinar?.title ?? 'Control Room', to: ROUTES.WEBINARS_DETAIL(id) },
                  { label: 'RSVP Registrations' },
                ]
              : [{ label: 'RSVP Registrations' }]),
          ]}
        />

        <div className="webinar-rsvp-header__top">
          <div className="webinar-rsvp-header__intro">
            <h1 className="webinar-rsvp-header__title">RSVP Registrations</h1>
            <p className="webinar-rsvp-header__subtitle">
              Attendees for <strong>{webinar?.title ?? `Webinar #${id}`}</strong>
            </p>
          </div>

          {canManage && (
            <div className="webinar-rsvp-header__actions">
              <Button variant="secondary" size="md" disabled={exporting} onClick={handleExport}>
                <i className="fas fa-download" aria-hidden="true" />{' '}
                {exporting ? 'Exporting…' : 'Export CSV'}
              </Button>
            </div>
          )}
        </div>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="webinar-rsvp-card">
        <div className="webinar-rsvp-summary">
          <div className="webinar-rsvp-summary__item">
            <div className="webinar-rsvp-summary__value">{pagination?.total ?? rsvps.length}</div>
            <div className="webinar-rsvp-summary__label">Total RSVPs</div>
          </div>
          <div className="webinar-rsvp-summary__item">
            <div className="webinar-rsvp-summary__value">{webinar?.maxAttendees ?? '∞'}</div>
            <div className="webinar-rsvp-summary__label">Capacity</div>
          </div>
          <div className="webinar-rsvp-summary__item">
            <div className="webinar-rsvp-summary__value">{statusCounts.CONFIRMED ?? 0}</div>
            <div className="webinar-rsvp-summary__label">Confirmed</div>
          </div>
          <div className="webinar-rsvp-summary__item">
            <div className="webinar-rsvp-summary__value">{statusCounts.ATTENDED ?? 0}</div>
            <div className="webinar-rsvp-summary__label">Attended</div>
          </div>
        </div>

        <form className="webinar-filters webinar-filters--rsvp" onSubmit={handleFilterSubmit}>
          <div className="webinar-filters__field webinar-filters__field--search">
            <label className="webinar-filters__label" htmlFor="rsvp-search">
              Search
            </label>
            <div className="webinar-filters__search-group">
              <span className="webinar-filters__search-icon" aria-hidden="true">
                <i className="fas fa-search" />
              </span>
              <input
                id="rsvp-search"
                type="search"
                className="field__control webinar-filters__search-input"
                placeholder="Name, email, or registration code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="webinar-filters__field">
            <label className="webinar-filters__label" htmlFor="rsvp-status">
              Status
            </label>
            <select
              id="rsvp-status"
              className="field__control"
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target.value as RsvpStatus) || '')}
            >
              {RSVP_STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="webinar-filters__actions">
            <Button type="submit" variant="primary" size="md">
              <i className="fas fa-filter" aria-hidden="true" /> Filter
            </Button>
          </div>
        </form>

        <div className="table-wrapper webinar-table-wrapper">
          <table className="table webinar-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Attendee</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Organization</th>
                <th>City / Country</th>
                <th>Registered At</th>
                <th>Status</th>
                {canManage && <th className="table__actions">Update</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 9 : 8} className="table__placeholder">
                    Loading RSVPs…
                  </td>
                </tr>
              ) : rsvps.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 9 : 8} className="table__placeholder">
                    No RSVPs registered yet.
                  </td>
                </tr>
              ) : (
                rsvps.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td>
                      <code>{rsvp.registrationCode}</code>
                    </td>
                    <td>
                      <span className="table__primary">{rsvp.name}</span>
                    </td>
                    <td>
                      <a href={`mailto:${rsvp.email}`}>{rsvp.email}</a>
                    </td>
                    <td>{rsvp.phone || '—'}</td>
                    <td>{rsvp.organization || '—'}</td>
                    <td>{rsvp.cityCountry || '—'}</td>
                    <td>{dateTimeFormat.format(new Date(rsvp.createdAt))}</td>
                    <td>
                      <StatusBadge tone={rsvpTone(rsvp.status)}>{rsvp.status}</StatusBadge>
                    </td>
                    {canManage && (
                      <td className="table__actions">
                        <select
                          className="field__control webinar-rsvp-status-select"
                          value={rsvp.status}
                          onChange={(e) => handleStatusChange(rsvp.id, e.target.value as RsvpStatus)}
                        >
                          <option value="REGISTERED">REGISTERED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="ATTENDED">ATTENDED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="NO_SHOW">NO_SHOW</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.lastPage > 1 && (
          <div className="webinar-list-card__pagination">
            <Pagination meta={pagination} onPageChange={(page) => load(page)} />
          </div>
        )}
      </Card>

      {id && (
        <div className="webinar-page-footer">
          <Link to={ROUTES.WEBINARS_DETAIL(id)} className="btn btn--secondary btn--sm">
            <i className="fas fa-arrow-left" aria-hidden="true" /> Back to Control Room
          </Link>
        </div>
      )}
    </div>
  );
}

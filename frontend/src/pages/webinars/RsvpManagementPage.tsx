import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { adminWebinarService } from '@/services/eventsService';
import { useToast } from '@/hooks/useToast';
import type { RsvpStatus, Webinar, WebinarRegistration } from '@/types/events';
import type { PaginationMeta } from '@/types';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

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

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [rsvps, setRsvps] = useState<WebinarRegistration[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminWebinarService.get(Number(id)).then(setWebinar).catch(() => {});
  }, [id]);

  const load = useCallback(async (page = 1) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminWebinarService.rsvps(Number(id), {
        page,
        perPage: 20,
        status: statusFilter || undefined,
      });
      setRsvps(res.items);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load RSVPs.');
    } finally {
      setLoading(false);
    }
  }, [id, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (rsvpId: number, newStatus: RsvpStatus) => {
    if (!id) return;
    try {
      await adminWebinarService.updateRsvpStatus(Number(id), rsvpId, newStatus);
      toast.success(`RSVP updated to ${newStatus}.`);
      setRsvps((prev) =>
        prev.map((r) => (r.id === rsvpId ? { ...r, status: newStatus } : r)),
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update RSVP status.');
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div style={{ marginBottom: 'var(--space-100)' }}>
          <Link to={id ? ROUTES.WEBINARS_DETAIL(id) : ROUTES.WEBINARS} className="btn btn--secondary btn--sm">
            ← Back to Webinar Details
          </Link>
        </div>
        <h1 className="page__title">RSVP Registrations</h1>
        <p className="page__subtitle">
          Attendees for <strong>{webinar?.title ?? `Webinar #${id}`}</strong>
        </p>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="filter-bar">
          <div className="filter-bar__filters">
            <select
              className="field__control"
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target.value as RsvpStatus) || '')}
            >
              <option value="">All RSVP Statuses</option>
              <option value="REGISTERED">Registered</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="ATTENDED">Attended</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Attendee Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registered At</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    Loading RSVPs…
                  </td>
                </tr>
              ) : rsvps.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    No RSVPs registered yet.
                  </td>
                </tr>
              ) : (
                rsvps.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td><strong>{rsvp.name}</strong></td>
                    <td><a href={`mailto:${rsvp.email}`}>{rsvp.email}</a></td>
                    <td>{rsvp.phone || '—'}</td>
                    <td>{dateTimeFormat.format(new Date(rsvp.createdAt))}</td>
                    <td>
                      <StatusBadge tone={rsvpTone(rsvp.status)}>{rsvp.status}</StatusBadge>
                    </td>
                    <td>
                      <select
                        className="field__control"
                        style={{ padding: '2px 8px', fontSize: 'var(--font-xs)', width: 'auto' }}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.lastPage > 1 && (
          <Pagination meta={pagination} onPageChange={(page) => load(page)} />
        )}
      </Card>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { adminWebinarService } from '@/services/eventsService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Webinar, WebinarListQuery, WebinarStatus } from '@/types/events';
import type { PaginationMeta } from '@/types';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const STATUS_FILTERS: Array<{ value: WebinarStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'LIVE', label: 'Live Now' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function statusTone(status: WebinarStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'LIVE':
      return 'danger';
    case 'SCHEDULED':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
    default:
      return 'default';
  }
}

export function WebinarListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { can } = useAuth();

  const statusParam = searchParams.get('status') as WebinarStatus | null;
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [query, setQuery] = useState<WebinarListQuery>({
    page: 1,
    perPage: 15,
    sortDir: 'desc',
    status: statusParam ?? undefined,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingWebinar, setDeletingWebinar] = useState<Webinar | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = can(PERMISSIONS.CREATE_WEBINARS);
  const canEdit = can(PERMISSIONS.EDIT_WEBINARS);
  const canDelete = can(PERMISSIONS.DELETE_WEBINARS);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminWebinarService.list(query);
      setWebinars(res.items);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load webinars.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((q) => ({ ...q, search: search.trim() || undefined, page: 1 }));
  };

  const handleDelete = async () => {
    if (!deletingWebinar) return;
    setDeleting(true);
    try {
      await adminWebinarService.remove(deletingWebinar.id);
      toast.success('Webinar deleted.');
      setDeletingWebinar(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete webinar.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page__title">Webinars & Virtual Events</h1>
          <p className="page__subtitle">Schedule live streaming broadcasts, panel discussions, and diaspora webinars.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
          <Link to={ROUTES.PUBLIC_WEBINARS} className="btn btn--secondary btn--md" target="_blank">
            📺 Public Hub
          </Link>
          {canCreate && (
            <Link to={ROUTES.WEBINARS_NEW} className="btn btn--primary btn--md">
              + Schedule Webinar
            </Link>
          )}
        </div>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="filter-bar">
          <form className="filter-bar__search" onSubmit={handleSearch}>
            <input
              type="search"
              className="field__control"
              placeholder="Search webinars by title, speaker..."
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
              onChange={(e) => {
                const s = (e.target.value as WebinarStatus) || undefined;
                setQuery((q) => ({ ...q, status: s, page: 1 }));
                setSearchParams(s ? { status: s } : {});
              }}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Webinar Title</th>
                <th>Speaker</th>
                <th>Scheduled At</th>
                <th>Duration</th>
                <th>RSVPs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    Loading webinars…
                  </td>
                </tr>
              ) : webinars.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    No webinars found.
                  </td>
                </tr>
              ) : (
                webinars.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div>
                        <strong>{w.title}</strong>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                          /{w.slug}
                        </div>
                      </div>
                    </td>
                    <td>{w.speaker || '—'}</td>
                    <td>{dateTimeFormat.format(new Date(w.scheduledAt))}</td>
                    <td>{w.duration}</td>
                    <td>
                      <Link to={ROUTES.WEBINARS_RSVPS(w.id)} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {w._count?.registrations ?? 0} RSVPs ↗
                      </Link>
                    </td>
                    <td>
                      <StatusBadge tone={statusTone(w.status)}>
                        {w.status === 'LIVE' ? '🔴 LIVE' : w.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-150)' }}>
                        <Link to={ROUTES.WEBINARS_DETAIL(w.id)} className="btn btn--secondary btn--sm">
                          View
                        </Link>
                        {canEdit && (
                          <Link to={ROUTES.WEBINARS_EDIT(w.id)} className="btn btn--secondary btn--sm">
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <Button variant="danger" size="sm" onClick={() => setDeletingWebinar(w)}>
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
          <Pagination
            meta={pagination}
            onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
          />
        )}
      </Card>

      <ConfirmDialog
        open={deletingWebinar !== null}
        title="Delete Webinar"
        message={`Are you sure you want to delete webinar "${deletingWebinar?.title}"?`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingWebinar(null)}
      />
    </div>
  );
}

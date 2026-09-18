import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { WebinarFiltersBar } from '@/components/webinars/WebinarFiltersBar';
import { WebinarListHeader } from '@/components/webinars/WebinarListHeader';
import { WebinarTable } from '@/components/webinars/WebinarTable';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { PERMISSIONS } from '@/constants/permissions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { adminWebinarService } from '@/services/eventsService';
import type {
  LivePlatform,
  Webinar,
  WebinarListQuery,
  WebinarListStats,
  WebinarStatus,
} from '@/types/events';
import type { PaginationMeta } from '@/types';
import { WEBINAR_STATUSES } from '@/utils/webinarHelpers';

import '@/styles/webinars-admin.css';

const VALID_STATUSES = new Set<WebinarStatus>(Object.keys(WEBINAR_STATUSES) as WebinarStatus[]);

function parseStatusParam(value: string | null): WebinarStatus | undefined {
  if (!value || !VALID_STATUSES.has(value as WebinarStatus)) return undefined;
  return value as WebinarStatus;
}

function parsePlatformParam(value: string | null): LivePlatform | undefined {
  if (!value) return undefined;
  return value as LivePlatform;
}

function buildFilterParams(status?: WebinarStatus, livePlatform?: LivePlatform): Record<string, string> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (livePlatform) params.livePlatform = livePlatform;
  return params;
}

function pageTitle(status?: WebinarStatus): string {
  if (status === 'LIVE') return 'Live Webinars';
  if (status === 'COMPLETED') return 'Replay Recordings';
  if (status) return `${WEBINAR_STATUSES[status]} Webinars`;
  return 'Webinars';
}

export function WebinarListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { can } = useAuth();

  const statusFilter = parseStatusParam(searchParams.get('status'));
  const livePlatformFilter = parsePlatformParam(searchParams.get('livePlatform'));

  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [stats, setStats] = useState<WebinarListStats | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [query, setQuery] = useState<WebinarListQuery>({
    page: 1,
    perPage: 15,
    sortDir: 'desc',
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingWebinar, setDeletingWebinar] = useState<Webinar | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = can(PERMISSIONS.CREATE_WEBINARS);
  const canEdit = can(PERMISSIONS.EDIT_WEBINARS);
  const canDelete = can(PERMISSIONS.DELETE_WEBINARS);

  const listQuery = useMemo(
    () => ({ ...query, status: statusFilter, livePlatform: livePlatformFilter }),
    [query, statusFilter, livePlatformFilter],
  );

  useEffect(() => {
    setQuery((q) => ({ ...q, page: 1, search: undefined }));
    setSearch('');
  }, [statusFilter, livePlatformFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminWebinarService.list(listQuery);
      setWebinars(res.items);
      setPagination(res.pagination);
      setStats(res.stats ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load webinars.');
    } finally {
      setLoading(false);
    }
  }, [listQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((q) => ({ ...q, search: search.trim() || undefined, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setSearchParams(buildFilterParams(parseStatusParam(value || null), livePlatformFilter));
  };

  const handlePlatformChange = (value: string) => {
    setSearchParams(buildFilterParams(statusFilter, parsePlatformParam(value || null)));
  };

  const handleReset = () => {
    setSearchParams({});
    setSearch('');
    setQuery({ page: 1, perPage: 15, sortDir: 'desc' });
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

  const hasActiveFilters = Boolean(query.search || statusFilter || livePlatformFilter);

  return (
    <div className="page">
      <WebinarListHeader
        title={pageTitle(statusFilter)}
        subtitle="Manage webinar schedules, RSVP registrations, live streaming feeds, and video replay archives."
        stats={stats}
        canCreate={canCreate}
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="webinar-filter-card">
        <WebinarFiltersBar
          search={search}
          onSearchChange={setSearch}
          onSubmit={handleFilter}
          status={statusFilter}
          onStatusChange={handleStatusChange}
          livePlatform={livePlatformFilter}
          onPlatformChange={handlePlatformChange}
          onReset={handleReset}
          showReset={hasActiveFilters}
        />
      </div>

      <Card className="webinar-list-card">
        <WebinarTable
          items={webinars}
          loading={loading}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
          onDelete={setDeletingWebinar}
        />

        {pagination && pagination.lastPage > 1 && (
          <div className="webinar-list-card__pagination">
            <Pagination meta={pagination} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
          </div>
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

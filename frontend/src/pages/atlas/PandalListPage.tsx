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
import { adminAtlasService } from '@/services/atlasService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { AtlasStatus, PandalAtlas, PandalListQuery } from '@/types/atlas';
import type { PaginationMeta } from '@/types';

const STATUS_FILTERS: Array<{ value: AtlasStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved (On Map)' },
  { value: 'REJECTED', label: 'Rejected' },
];

function statusTone(status: AtlasStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'UNDER_REVIEW':
      return 'warning';
    case 'SUBMITTED':
      return 'info';
    case 'REJECTED':
      return 'danger';
    case 'DRAFT':
    default:
      return 'default';
  }
}

export function PandalListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { can } = useAuth();

  const statusParam = searchParams.get('status') as AtlasStatus | null;
  const [pandals, setPandals] = useState<PandalAtlas[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [query, setQuery] = useState<PandalListQuery>({
    page: 1,
    perPage: 15,
    sortDir: 'desc',
    status: statusParam ?? undefined,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingPandal, setDeletingPandal] = useState<PandalAtlas | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = can(PERMISSIONS.CREATE_PANDAL_ATLAS);
  const canEdit = can(PERMISSIONS.EDIT_PANDAL_ATLAS);
  const canDelete = can(PERMISSIONS.DELETE_PANDAL_ATLAS);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, statsRes] = await Promise.all([
        adminAtlasService.list(query),
        adminAtlasService.stats().catch(() => ({})),
      ]);
      setPandals(res.items);
      setPagination(res.pagination);
      setStats(statsRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load pandals.');
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
    if (!deletingPandal) return;
    setDeleting(true);
    try {
      await adminAtlasService.remove(deletingPandal.id);
      toast.success('Pandal deleted.');
      setDeletingPandal(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete pandal.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page__title">Pandal Atlas</h1>
          <p className="page__subtitle">Geographic directory and interactive mapping of registered puja pandals.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
          <Link to={ROUTES.PUBLIC_ATLAS} className="btn btn--secondary btn--md" target="_blank">
            🗺 Public Map
          </Link>
          {canCreate && (
            <Link to={ROUTES.PANDAL_ATLAS_NEW} className="btn btn--primary btn--md">
              + Add New Pandal
            </Link>
          )}
        </div>
      </header>

      {stats && Object.keys(stats).length > 0 && (
        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-card__label">Total Registered</p>
            <p className="stat-card__value">{Object.values(stats).reduce((a, b) => a + b, 0)}</p>
          </div>
          <div className="stat-card stat-card--success">
            <p className="stat-card__label">Approved (On Map)</p>
            <p className="stat-card__value">{stats.APPROVED ?? 0}</p>
          </div>
          <div className="stat-card stat-card--warning">
            <p className="stat-card__label">Under Review</p>
            <p className="stat-card__value">{stats.UNDER_REVIEW ?? 0}</p>
          </div>
          <div className="stat-card stat-card--info">
            <p className="stat-card__label">Submitted Queue</p>
            <p className="stat-card__value">{stats.SUBMITTED ?? 0}</p>
          </div>
        </div>
      )}

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="filter-bar">
          <form className="filter-bar__search" onSubmit={handleSearch}>
            <input
              type="search"
              className="field__control"
              placeholder="Search pandal by name, location..."
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
                const s = (e.target.value as AtlasStatus) || undefined;
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
                <th>Pandal Name</th>
                <th>Committee</th>
                <th>Location</th>
                <th>Coordinates</th>
                <th>Timing</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    Loading pandals…
                  </td>
                </tr>
              ) : pandals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    No pandals found.
                  </td>
                </tr>
              ) : (
                pandals.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <strong>{p.name}</strong>
                        {p.theme && (
                          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                            Theme: {p.theme}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{p.committee?.committeeName ?? `#${p.pujaCommitteeId}`}</td>
                    <td>{p.location}</td>
                    <td>
                      <code>{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</code>
                    </td>
                    <td>{p.timing || '—'}</td>
                    <td>
                      <StatusBadge tone={statusTone(p.status)}>{p.status}</StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-150)' }}>
                        <Link to={ROUTES.PANDAL_ATLAS_DETAIL(p.id)} className="btn btn--secondary btn--sm">
                          View
                        </Link>
                        {canEdit && (
                          <Link to={ROUTES.PANDAL_ATLAS_EDIT(p.id)} className="btn btn--secondary btn--sm">
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <Button variant="danger" size="sm" onClick={() => setDeletingPandal(p)}>
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
        open={deletingPandal !== null}
        title="Delete Pandal"
        message={`Are you sure you want to delete pandal entry "${deletingPandal?.name}"?`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPandal(null)}
      />
    </div>
  );
}

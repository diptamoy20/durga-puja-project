import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { adminAtlasService } from '@/services/atlasService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { atlasFileUrl, atlasListSubtitle, atlasListTitle, atlasStatusTone, formatAtlasStatus, ATLAS_LIST_LABEL } from '@/utils/atlasHelpers';
import type { AtlasStats, AtlasStatus, PandalAtlas, PandalListQuery } from '@/types/atlas';
import type { PaginationMeta } from '@/types';

const STATUS_FILTERS: Array<{ value: AtlasStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved (On Map)' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STAT_CARDS: Array<{
  key: keyof AtlasStats | 'total';
  label: string;
  status?: AtlasStatus;
  tone?: string;
}> = [
  { key: 'total', label: 'Total Entries' },
  { key: 'APPROVED', label: 'Approved (Live)', status: 'APPROVED', tone: 'success' },
  { key: 'SUBMITTED', label: 'Submitted', status: 'SUBMITTED', tone: 'info' },
  { key: 'UNDER_REVIEW', label: 'Under Review', status: 'UNDER_REVIEW', tone: 'warning' },
  { key: 'REJECTED', label: 'Rejected', status: 'REJECTED', tone: 'danger' },
  { key: 'DRAFT', label: 'Drafts', status: 'DRAFT', tone: 'default' },
];

export function PandalListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { can } = useAuth();
  const isModerator = can(PERMISSIONS.MODERATE_PANDAL_ATLAS);

  const statusParam = searchParams.get('status') as AtlasStatus | null;
  const statusFilter = statusParam ?? undefined;

  const [pandals, setPandals] = useState<PandalAtlas[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [stats, setStats] = useState<AtlasStats | null>(null);
  const [query, setQuery] = useState<PandalListQuery>({
    page: 1,
    perPage: 15,
    sortDir: 'desc',
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPandal, setDeletingPandal] = useState<PandalAtlas | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = can(PERMISSIONS.CREATE_PANDAL_ATLAS);
  const canEdit = can(PERMISSIONS.EDIT_PANDAL_ATLAS);
  const canDelete = can(PERMISSIONS.DELETE_PANDAL_ATLAS);

  /** Status filter always follows the URL (?status=), like the Laravel index. */
  const listQuery = useMemo(
    () => ({ ...query, status: statusFilter }),
    [query, statusFilter],
  );

  // Sidebar / stat-card links only change the URL — reset page and text search when status changes.
  useEffect(() => {
    setQuery((q) => ({ ...q, page: 1, search: undefined }));
    setSearch('');
  }, [statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, statsRes] = await Promise.all([
        adminAtlasService.list(listQuery),
        adminAtlasService.stats().catch(() => null),
      ]);
      setPandals(res.items);
      setPagination(res.pagination);
      setStats(statsRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load pandals.');
    } finally {
      setLoading(false);
    }
  }, [listQuery]);

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
      <GalleryModuleHeader
        breadcrumbs={
          statusFilter
            ? [
                { label: 'Dashboard', to: ROUTES.DASHBOARD },
                { label: ATLAS_LIST_LABEL, to: ROUTES.PANDAL_ATLAS },
                { label: atlasListTitle(statusFilter) },
              ]
            : [
                { label: 'Dashboard', to: ROUTES.DASHBOARD },
                { label: ATLAS_LIST_LABEL },
              ]
        }
        title={atlasListTitle(statusFilter)}
        subtitle={atlasListSubtitle(statusFilter)}
        actions={
          <>
            <Link to={ROUTES.PUBLIC_ATLAS} className="btn btn--outline-secondary btn--md" target="_blank">
              <i className="fas fa-location-dot" aria-hidden="true" /> Public Map
            </Link>
            {canCreate && (
              <Link to={ROUTES.PANDAL_ATLAS_NEW} className="btn btn--primary btn--md">
                <i className="fas fa-circle-plus" aria-hidden="true" /> Add New Pandal
              </Link>
            )}
          </>
        }
      />

      {stats && (
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {STAT_CARDS.map((card) => {
            const value = stats[card.key as keyof AtlasStats] ?? 0;
            const active = card.status ? statusFilter === card.status : !statusFilter;
            const href = card.status
              ? `${ROUTES.PANDAL_ATLAS}?status=${card.status}`
              : ROUTES.PANDAL_ATLAS;
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
          <form className="filter-bar__search" onSubmit={handleSearch}>
            <input
              type="search"
              className="field__control"
              placeholder="Search by name, street, locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="secondary" size="md">Filter</Button>
            {(query.search || statusFilter) && (
              <Link to={ROUTES.PANDAL_ATLAS} className="btn btn--secondary btn--md">Reset</Link>
            )}
          </form>

          <div className="filter-bar__filters">
            <select
              className="field__control"
              value={statusFilter ?? ''}
              onChange={(e) => {
                const s = (e.target.value as AtlasStatus) || undefined;
                setQuery((q) => ({ ...q, page: 1 }));
                setSearchParams(s ? { status: s } : {});
              }}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value || 'all'} value={f.value}>
                  {f.label}
                  {stats && f.value ? ` (${stats[f.value] ?? 0})` : stats ? ` (${stats.total})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Photo</th>
                <th>Pandal Name & Location</th>
                {isModerator && <th>Puja Committee</th>}
                <th>Coordinates</th>
                <th>Visiting Hours</th>
                <th>Features</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isModerator ? 8 : 7} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>Loading pandals…</td></tr>
              ) : pandals.length === 0 ? (
                <tr><td colSpan={isModerator ? 8 : 7} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>No pandal entries found.</td></tr>
              ) : (
                pandals.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.primaryPhotoUrl ?? atlasFileUrl(p.photoUrls?.[0])}
                        alt={p.name}
                        style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                    </td>
                    <td>
                      <Link to={ROUTES.PANDAL_ATLAS_DETAIL(p.id)}><strong>{p.name}</strong></Link>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>{p.location}</div>
                    </td>
                    {isModerator && (
                      <td>
                        <div>{p.committee?.committeeName ?? 'Unassigned'}</div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                          Reg: {p.committee?.committeeId ?? 'N/A'}
                        </div>
                      </td>
                    )}
                    <td><code>{p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}</code></td>
                    <td>{p.timing}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
                        {p.hasLivestream && <StatusBadge tone="danger">Live</StatusBadge>}
                        {p.hasVirtualTour && <StatusBadge tone="info">360°</StatusBadge>}
                        {p.ritualSchedule && <StatusBadge tone="default">Rituals</StatusBadge>}
                      </div>
                    </td>
                    <td>
                      <StatusBadge tone={atlasStatusTone(p.status)}>{formatAtlasStatus(p.status)}</StatusBadge>
                      {p.status === 'REJECTED' && p.rejectionRemarks && (
                        <span title={p.rejectionRemarks} style={{ marginLeft: 4, cursor: 'help' }}>ℹ️</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-150)', flexWrap: 'wrap' }}>
                        <Link to={ROUTES.PANDAL_ATLAS_DETAIL(p.id)} className="btn btn--secondary btn--sm">View</Link>
                        {canEdit && <Link to={ROUTES.PANDAL_ATLAS_EDIT(p.id)} className="btn btn--secondary btn--sm">Edit</Link>}
                        {p.status === 'APPROVED' && (
                          <Link to={ROUTES.PUBLIC_ATLAS_DETAIL(p.id)} target="_blank" className="btn btn--secondary btn--sm">Map ↗</Link>
                        )}
                        {canDelete && (
                          <Button variant="danger" size="sm" onClick={() => setDeletingPandal(p)}>Delete</Button>
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

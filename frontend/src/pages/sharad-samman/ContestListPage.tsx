import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { sammanService } from '@/services/sammanService';
import { useAuth } from '@/hooks/useAuth';
import type { Contest, ContestStatus } from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function formatContestStatus(status: ContestStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'CLOSED':
      return 'Closed';
    case 'DRAFT':
    default:
      return 'Draft';
  }
}

export function ContestListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_CONTESTS);

  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const loadContests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sammanService.getContests();
      setContests(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load contests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        String(c.year).includes(term) ||
        (c.description && c.description.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [contests, statusFilter, search]);

  const activeCount = useMemo(() => contests.filter((c) => c.status === 'ACTIVE').length, [contests]);
  const draftCount = useMemo(() => contests.filter((c) => c.status === 'DRAFT').length, [contests]);
  const closedCount = useMemo(() => contests.filter((c) => c.status === 'CLOSED').length, [contests]);

  return (
    <div className="page samman-page" id="contest-management-page">
      {/* Header */}
      <header className="page__header">
        <div className="page__titles">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link to={ROUTES.SHARAD_SAMMAN_DASHBOARD}>Sharad Samman</Link></li>
              <li><span>Contest Session</span></li>
            </ol>
          </nav>
          <h1 className="page__title">Contest Session</h1>
          <p className="page__subtitle">
            Configure annual Sharad Samman competition editions, scheduling timelines, and nomination quotas.
          </p>
        </div>

        <div className="page__actions" style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {canManage && (
            <Button
              variant="primary"
              size="md"
              id="btn-create-contest"
              onClick={() => navigate(ROUTES.SHARAD_SAMMAN_CONTEST_NEW)}
            >
              <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
              Create Contest
            </Button>
          )}
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(ROUTES.SHARAD_SAMMAN_DASHBOARD)}
          >
            <i className="fas fa-chart-pie" aria-hidden="true" style={{ marginRight: '6px' }} />
            Dashboard
          </Button>
        </div>
      </header>

      {error && (
        <Alert variant="error" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </Alert>
      )}

      {/* Top Metric Cards */}
      <div className="samman-stat-grid" style={{ marginBottom: 'var(--space-5)' }}>
        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'ALL' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
          style={{ textAlign: 'left', cursor: 'pointer', border: statusFilter === 'ALL' ? '2px solid var(--color-primary-base)' : undefined }}
        >
          <div className="samman-stat-card__val">{contests.length}</div>
          <div className="samman-stat-card__lbl">All Contests</div>
        </button>
        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'ACTIVE' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('ACTIVE')}
          style={{ textAlign: 'left', cursor: 'pointer', border: statusFilter === 'ACTIVE' ? '2px solid var(--color-success)' : undefined }}
        >
          <div className="samman-stat-card__val" style={{ color: 'var(--color-success)' }}>{activeCount}</div>
          <div className="samman-stat-card__lbl">Active Editions</div>
        </button>
        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'DRAFT' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('DRAFT')}
          style={{ textAlign: 'left', cursor: 'pointer', border: statusFilter === 'DRAFT' ? '2px solid var(--color-warning)' : undefined }}
        >
          <div className="samman-stat-card__val" style={{ color: 'var(--color-warning)' }}>{draftCount}</div>
          <div className="samman-stat-card__lbl">Drafts</div>
        </button>
        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'CLOSED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('CLOSED')}
          style={{ textAlign: 'left', cursor: 'pointer', border: statusFilter === 'CLOSED' ? '2px solid var(--color-text-muted)' : undefined }}
        >
          <div className="samman-stat-card__val" style={{ color: 'var(--color-text-muted)' }}>{closedCount}</div>
          <div className="samman-stat-card__lbl">Closed / Past</div>
        </button>
      </div>

      {/* Main Table Card */}
      <Card>
        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flex: 1, minWidth: '240px', maxWidth: '400px' }}>
            <div className="form-control-wrap" style={{ width: '100%', position: 'relative' }}>
              <i className="fas fa-search" aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '34px' }}
                placeholder="Search by contest name or year..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="contest-search-input"
              />
            </div>
            {search && (
              <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                Clear
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Showing {filteredContests.length} of {contests.length} contest{contests.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <PageLoader />
        ) : filteredContests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-background-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '1.5rem', marginBottom: 'var(--space-3)' }}>
              <i className="fas fa-calendar-times" aria-hidden="true" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
              {search || statusFilter !== 'ALL' ? 'No matching contests found' : 'No contests created yet'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto var(--space-4)' }}>
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter options to locate contests.'
                : 'Create the first Sharad Samman competition edition to start receiving nominations.'}
            </p>
            {canManage && !search && statusFilter === 'ALL' && (
              <Button variant="primary" onClick={() => navigate(ROUTES.SHARAD_SAMMAN_CONTEST_NEW)}>
                <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
                Create First Contest
              </Button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" id="contests-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Contest Name</th>
                  <th style={{ width: '90px' }}>Year</th>
                  <th style={{ width: '130px' }}>Start Date</th>
                  <th style={{ width: '130px' }}>Last Date</th>
                  <th style={{ width: '110px' }}>Status</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Nominations</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContests.map((contest, index) => {
                  const nominationCount = contest._count?.nominations ?? 0;
                  const startDateStr = contest.startDate ? dateFormatter.format(new Date(contest.startDate)) : '—';
                  const endDateStr = contest.endDate ? dateFormatter.format(new Date(contest.endDate)) : '—';

                  return (
                    <tr key={contest.id} id={`contest-row-${contest.id}`}>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        {index + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-emphasis)' }}>
                          {contest.name}
                        </div>
                        {contest.description && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-muted)',
                              marginTop: '2px',
                              maxWidth: '360px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={contest.description}
                          >
                            {contest.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{contest.year}</span>
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>
                        <i className="far fa-calendar" aria-hidden="true" style={{ marginRight: '5px', color: 'var(--color-text-muted)' }} />
                        {startDateStr}
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>
                        <i className="far fa-calendar-check" aria-hidden="true" style={{ marginRight: '5px', color: 'var(--color-text-muted)' }} />
                        {endDateStr}
                      </td>
                      <td>
                        <StatusBadge status={contest.status}>
                          {formatContestStatus(contest.status)}
                        </StatusBadge>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className="badge"
                          style={{
                            background: nominationCount > 0 ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-background-subtle)',
                            color: nominationCount > 0 ? 'var(--color-info)' : 'var(--color-text-muted)',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                          }}
                        >
                          <i className="fas fa-file-lines" aria-hidden="true" style={{ marginRight: '4px' }} />
                          {nominationCount}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 'var(--space-1)' }}>
                          {canManage && (
                            <Button
                              variant="secondary"
                              size="sm"
                              id={`btn-edit-contest-${contest.id}`}
                              onClick={() => navigate(ROUTES.SHARAD_SAMMAN_CONTEST_EDIT(contest.id))}
                              title="Edit contest details"
                            >
                              <i className="fas fa-pen-to-square" aria-hidden="true" style={{ marginRight: '4px' }} />
                              Edit
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

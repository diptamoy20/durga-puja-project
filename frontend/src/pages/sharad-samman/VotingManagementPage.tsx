import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import { sammanService } from '@/services/sammanService';
import type { VotingContestItem, VotingStatus } from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function getVotingStatusTone(status: VotingStatus): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'EXTENDED':
      return 'info';
    case 'SCHEDULED':
      return 'warning';
    case 'CLOSED':
      return 'danger';
    case 'NOT_CONFIGURED':
    default:
      return 'neutral';
  }
}

function getVotingStatusLabel(status: VotingStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Voting Live';
    case 'EXTENDED':
      return 'Voting Extended';
    case 'SCHEDULED':
      return 'Scheduled';
    case 'CLOSED':
      return 'Voting Closed';
    case 'NOT_CONFIGURED':
    default:
      return 'Not Configured';
  }
}

export function VotingManagementPage() {
  const navigate = useNavigate();

  const [contests, setContests] = useState<VotingContestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const loadContests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sammanService.listVotingContests();
      setContests(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load voting contests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  const counts = useMemo(() => {
    return {
      all: contests.length,
      active: contests.filter((c) => c.votingStatus === 'ACTIVE' || c.votingStatus === 'EXTENDED').length,
      scheduled: contests.filter((c) => c.votingStatus === 'SCHEDULED').length,
      closed: contests.filter((c) => c.votingStatus === 'CLOSED').length,
      notConfigured: contests.filter((c) => c.votingStatus === 'NOT_CONFIGURED').length,
    };
  }, [contests]);

  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      let matchesStatus = true;
      if (statusFilter === 'ACTIVE_OR_EXTENDED') {
        matchesStatus = c.votingStatus === 'ACTIVE' || c.votingStatus === 'EXTENDED';
      } else if (statusFilter !== 'ALL') {
        matchesStatus = c.votingStatus === statusFilter;
      }

      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        String(c.year).includes(term) ||
        (c.description && c.description.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [contests, statusFilter, search]);

  return (
    <div className="page samman-page" id="voting-management-page">
      {/* Level 1 Header */}
      <header className="page__header">
        <div className="page__titles">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to={ROUTES.SHARAD_SAMMAN_DASHBOARD}>Sharad Samman</Link>
              </li>
              <li>
                <span>Voting Management</span>
              </li>
            </ol>
          </nav>
          <h1 className="page__title">Voting Management</h1>
          <p className="page__subtitle">
            Manage public voting windows, deadlines, and extensions across all Sharad Samman contest sessions independently.
          </p>
        </div>

        <div className="page__actions" style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(ROUTES.SHARAD_SAMMAN_CONTESTS)}
          >
            <i className="fas fa-calendar-check" aria-hidden="true" style={{ marginRight: '6px' }} />
            Contest Sessions
          </Button>
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

      {/* Top Stat Metric Cards */}
      <div className="samman-stat-grid" style={{ marginBottom: 'var(--space-4)' }}>
        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'ALL' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
          style={{ textAlign: 'left', cursor: 'pointer' }}
          id="tab-stat-all"
        >
          <div className="samman-stat-card__icon samman-stat-card__icon--primary">
            <i className="fas fa-layer-group" />
          </div>
          <div className="samman-stat-card__content">
            <span className="samman-stat-card__label">All Sessions</span>
            <span className="samman-stat-card__value">{counts.all}</span>
          </div>
        </button>

        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'ACTIVE_OR_EXTENDED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('ACTIVE_OR_EXTENDED')}
          style={{ textAlign: 'left', cursor: 'pointer' }}
          id="tab-stat-active"
        >
          <div className="samman-stat-card__icon samman-stat-card__icon--success">
            <i className="fas fa-circle-play" />
          </div>
          <div className="samman-stat-card__content">
            <span className="samman-stat-card__label">Voting Live / Extended</span>
            <span className="samman-stat-card__value" style={{ color: 'var(--colour-success)' }}>
              {counts.active}
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'SCHEDULED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('SCHEDULED')}
          style={{ textAlign: 'left', cursor: 'pointer' }}
          id="tab-stat-scheduled"
        >
          <div className="samman-stat-card__icon samman-stat-card__icon--warning">
            <i className="fas fa-clock" />
          </div>
          <div className="samman-stat-card__content">
            <span className="samman-stat-card__label">Scheduled</span>
            <span className="samman-stat-card__value" style={{ color: 'var(--colour-warning)' }}>
              {counts.scheduled}
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'CLOSED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('CLOSED')}
          style={{ textAlign: 'left', cursor: 'pointer' }}
          id="tab-stat-closed"
        >
          <div className="samman-stat-card__icon samman-stat-card__icon--danger">
            <i className="fas fa-lock" />
          </div>
          <div className="samman-stat-card__content">
            <span className="samman-stat-card__label">Closed</span>
            <span className="samman-stat-card__value" style={{ color: 'var(--colour-danger)' }}>
              {counts.closed}
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'NOT_CONFIGURED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('NOT_CONFIGURED')}
          style={{ textAlign: 'left', cursor: 'pointer' }}
          id="tab-stat-unconfigured"
        >
          <div className="samman-stat-card__icon">
            <i className="fas fa-sliders" />
          </div>
          <div className="samman-stat-card__content">
            <span className="samman-stat-card__label">Unconfigured</span>
            <span className="samman-stat-card__value" style={{ color: 'var(--colour-ink-soft)' }}>
              {counts.notConfigured}
            </span>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="voting-search-container" id="voting-search-container">
        <form
          className="voting-search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            loadContests();
          }}
        >
          <div className="voting-search-input-wrap">
            <i className="fas fa-search voting-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="voting-search-input"
              placeholder="Search contest name or year…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="voting-contest-search"
            />
            {search && (
              <button
                type="button"
                className="voting-search-clear-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                title="Clear search"
              >
                <i className="fas fa-times" aria-hidden="true" />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexShrink: 0 }}>
            {search && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSearch('')}
                style={{ height: '44px', whiteSpace: 'nowrap' }}
              >
                <i className="fas fa-times" aria-hidden="true" style={{ marginRight: '6px' }} />
                Clear
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              title="Search contest sessions"
              style={{ height: '44px' }}
              id="btn-voting-search"
            >
              <i className="fas fa-search" aria-hidden="true" style={{ marginRight: '6px' }} />
              Search
            </Button>
          </div>
        </form>

        <div className="voting-search-meta">
          <span>
            Showing <strong>{filteredContests.length}</strong> of {contests.length} contest session
            {contests.length === 1 ? '' : 's'}
            {search && (
              <span style={{ marginLeft: '6px', color: 'var(--colour-brand)' }}>
                (matching &ldquo;{search}&rdquo;)
              </span>
            )}
          </span>
          {statusFilter !== 'ALL' && (
            <span style={{ fontSize: '0.8rem', color: 'var(--colour-ink-soft)' }}>
              Filtered by: <strong>{statusFilter === 'ACTIVE_OR_EXTENDED' ? 'Live / Extended' : statusFilter}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Content: Cards Grid */}
      {loading ? (
        <PageLoader />
      ) : filteredContests.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-8) var(--space-4)',
            background: 'var(--colour-surface)',
            border: '1px solid var(--colour-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.04)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--colour-ink-soft)',
              fontSize: '1.5rem',
              marginBottom: 'var(--space-3)',
            }}
          >
            <i className="fas fa-check-to-slot" aria-hidden="true" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
            {search || statusFilter !== 'ALL' ? 'No matching contest sessions found' : 'No contests created yet'}
          </h3>
          <p
            style={{
              color: 'var(--colour-ink-soft)',
              fontSize: '0.875rem',
              maxWidth: '420px',
              margin: '0 auto var(--space-4)',
            }}
          >
            {search || statusFilter !== 'ALL'
              ? 'Try changing your search keywords or status filter options.'
              : 'Create a Sharad Samman contest session first to begin configuring voting timelines.'}
          </p>
          {search || statusFilter !== 'ALL' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          ) : (
            <Button variant="primary" onClick={() => navigate(ROUTES.SHARAD_SAMMAN_CONTEST_NEW)}>
              <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
              Create First Contest
            </Button>
          )}
        </div>
      ) : (
        <div className="voting-grid" id="voting-contests-grid">
          {filteredContests.map((c) => {
            const startDateStr = c.votingStartDate
              ? dateTimeFormatter.format(new Date(c.votingStartDate))
              : 'Not Configured';
            const endDateStr = c.votingEndDate
              ? dateTimeFormatter.format(new Date(c.votingEndDate))
              : 'Not Configured';
            const extendedStr = c.votingExtendedUntil
              ? dateTimeFormatter.format(new Date(c.votingExtendedUntil))
              : null;
            const effectiveClosingStr = c.effectiveClosingDate
              ? dateTimeFormatter.format(new Date(c.effectiveClosingDate))
              : null;

            return (
              <div
                key={c.id}
                className="voting-card"
                id={`voting-contest-card-${c.id}`}
                onClick={() => navigate(ROUTES.SHARAD_SAMMAN_VOTING_DETAIL(c.id))}
                style={{ cursor: 'pointer' }}
              >
                {/* Card Header */}
                <div className="voting-card__header">
                  <div className="voting-card__title-group">
                    <h3 className="voting-card__title">{c.name}</h3>
                    <span className="voting-card__year">Edition {c.year}</span>
                  </div>
                  <StatusBadge
                    tone={getVotingStatusTone(c.votingStatus)}
                    label={getVotingStatusLabel(c.votingStatus)}
                  />
                </div>

                {/* Card Body */}
                <div className="voting-card__body">
                  <div className="voting-card__timeline">
                    <div className="voting-card__row">
                      <span className="voting-card__row-label">
                        <i className="fas fa-play" style={{ fontSize: '10px', color: 'var(--colour-success)' }} />
                        Voting Start
                      </span>
                      <span className="voting-card__row-value">{startDateStr}</span>
                    </div>

                    <div className="voting-card__row">
                      <span className="voting-card__row-label">
                        <i className="fas fa-flag-checkered" style={{ fontSize: '10px', color: 'var(--colour-ink-soft)' }} />
                        Voting End
                      </span>
                      <span className="voting-card__row-value">{endDateStr}</span>
                    </div>

                    {extendedStr && (
                      <div className="voting-card__row">
                        <span className="voting-card__row-label">
                          <i className="fas fa-calendar-plus" style={{ fontSize: '11px', color: '#0284c7' }} />
                          Extended Until
                        </span>
                        <span className="voting-card__row-value voting-card__row-value--extended">
                          {extendedStr}
                        </span>
                      </div>
                    )}

                    {effectiveClosingStr && (
                      <div className="voting-card__row" style={{ paddingTop: '4px', borderTop: '1px dashed var(--colour-border)' }}>
                        <span className="voting-card__row-label" style={{ fontWeight: 600 }}>
                          <i className="fas fa-hourglass-end" style={{ fontSize: '11px', color: 'var(--colour-brand)' }} />
                          Effective Closing
                        </span>
                        <span className="voting-card__row-value voting-card__row-value--effective">
                          {effectiveClosingStr}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata: Shortlisted candidates */}
                  <div className="voting-card__meta-bar">
                    <span style={{ color: 'var(--colour-ink-soft)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fas fa-star" style={{ color: '#eab308' }} />
                      Shortlisted Candidates
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        background: c.shortlistedCount > 0 ? 'var(--colour-info-tint)' : 'rgba(0,0,0,0.05)',
                        color: c.shortlistedCount > 0 ? 'var(--colour-info)' : 'var(--colour-ink-soft)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                      }}
                    >
                      {c.shortlistedCount} candidate{c.shortlistedCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div
                  className="voting-card__footer"
                  onClick={(e) => {
                    // Avoid duplicate event
                    e.stopPropagation();
                    navigate(ROUTES.SHARAD_SAMMAN_VOTING_DETAIL(c.id));
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--colour-ink-soft)' }}>
                    Contest: <strong>{c.contestStatus}</strong>
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    id={`btn-manage-voting-${c.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(ROUTES.SHARAD_SAMMAN_VOTING_DETAIL(c.id));
                    }}
                  >
                    <span>Manage Voting</span>
                    <i className="fas fa-arrow-right" aria-hidden="true" style={{ marginLeft: '6px', fontSize: '11px' }} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default VotingManagementPage;

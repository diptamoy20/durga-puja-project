import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { formatContestDate } from '@/constants/samman';
import { sammanService } from '@/services/sammanService';
import { useAuth } from '@/hooks/useAuth';
import type { Contest, SharadSammanDashboardData, SharadSammanNomination } from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

export function SharadSammanDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const contestParam = searchParams.get('contestId');

  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_NOMINATIONS);

  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<number | null>(
    contestParam ? Number(contestParam) : null
  );

  const [data, setData] = useState<SharadSammanDashboardData | null>(null);
  const [recentNominations, setRecentNominations] = useState<SharadSammanNomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial load: fetch available contests list
  useEffect(() => {
    sammanService
      .getContests()
      .then((list) => {
        setContests(list);
        if (list.length > 0) {
          // If contestParam was valid, respect it; otherwise default to active contest or first contest
          const paramId = contestParam ? Number(contestParam) : null;
          const match = paramId ? list.find((c) => c.id === paramId) : null;
          if (match) {
            setSelectedContestId(match.id);
          } else {
            const active = list.find((c) => c.status === 'ACTIVE') || list[0];
            setSelectedContestId(active.id);
            setSearchParams({ contestId: String(active.id) }, { replace: true });
          }
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load contests list.');
      });
  }, []);

  // 2. Fetch contest-scoped dashboard stats and recent nominations whenever selectedContestId changes
  useEffect(() => {
    if (selectedContestId === null) return;
    setLoading(true);
    setError(null);

    Promise.all([
      sammanService.getDashboard(selectedContestId),
      sammanService.list({ contestId: selectedContestId, perPage: 6, sortDir: 'desc' }),
    ])
      .then(([dashData, listData]) => {
        setData(dashData);
        setRecentNominations(listData.items);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load Sharad Samman dashboard.');
      })
      .finally(() => setLoading(false));
  }, [selectedContestId]);

  const stats = data?.stats;
  const selectedContest = data?.activeContest || contests.find((c) => c.id === selectedContestId);
  const isContestActive = selectedContest ? selectedContest.status === 'ACTIVE' : false;
  const makeListLink = (statusParam?: string) => {
    const params = new URLSearchParams();
    if (selectedContestId) params.set('contestId', String(selectedContestId));
    if (statusParam) params.set('status', statusParam);
    const qs = params.toString();
    return qs ? `${ROUTES.SHARAD_SAMMAN_NOMINATIONS}?${qs}` : ROUTES.SHARAD_SAMMAN_NOMINATIONS;
  };

  return (
    <div className="page samman-page" id="sharad-samman-dashboard">
      {/* Header */}
      <header className="page__header">
        <div className="page__titles">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link to={ROUTES.DASHBOARD}>Admin Portal</Link></li>
              <li><span>Sharad Samman</span></li>
            </ol>
          </nav>
          <h1 className="page__title">Sharad Samman Dashboard</h1>
          <p className="page__subtitle">
            Festival competition administration, committee award nominations, jury review queues, and candidate shortlists.
          </p>
        </div>

        <div className="page__actions" style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {canManage && (
            <Button
              variant="primary"
              size="md"
              disabled={!isContestActive}
              title={
                !isContestActive
                  ? `Contest is ${selectedContest?.status || 'inactive'}. Nominations can only be added to ACTIVE contests.`
                  : undefined
              }
              onClick={() => navigate(`${ROUTES.SHARAD_SAMMAN_NOMINATION_NEW}${selectedContestId ? `?contestId=${selectedContestId}` : ''}`)}
            >
              <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
              Add Nomination
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(makeListLink())}
          >
            <i className="fas fa-list" aria-hidden="true" style={{ marginRight: '6px' }} />
            All Nominations
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(ROUTES.SHARAD_SAMMAN_CONTESTS)}
          >
            <i className="fas fa-calendar-check" aria-hidden="true" style={{ marginRight: '6px' }} />
            Contest Session
          </Button>
        </div>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Contest Banner with Dynamic Edition Switcher */}
      <div className="samman-contest-banner">
        <div className="samman-contest-banner__info">
          <div className="samman-contest-banner__icon">
            <i className="fas fa-trophy" aria-hidden="true" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <h2 className="samman-contest-banner__title">
                {selectedContest ? selectedContest.name : 'No Contest Selected'}
              </h2>
              {selectedContest && (
                <span className={`badge ${selectedContest.status === 'ACTIVE' ? 'badge--success' : selectedContest.status === 'DRAFT' ? 'badge--warning' : 'badge--default'}`}>
                  {selectedContest.status}
                </span>
              )}
            </div>
            <p className="samman-contest-banner__meta">
              <span><strong>Contest Year:</strong> {selectedContest?.year ? String(selectedContest.year) : '—'}</span>
              {formatContestDate(selectedContest?.endDate) && (
                <>
                  <span>&bull;</span>
                  <span><strong>Last Date:</strong> {formatContestDate(selectedContest?.endDate)}</span>
                </>
              )}
              {selectedContest?.description && (
                <>
                  <span>&bull;</span>
                  <span>{selectedContest.description}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {contests.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <label htmlFor="dashboard-contest-select" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--colour-ink-soft)', whiteSpace: 'nowrap' }}>
                Edition:
              </label>
              <select
                id="dashboard-contest-select"
                className="field__control"
                style={{ height: '36px', minWidth: '220px', fontWeight: 600, padding: '4px 10px' }}
                value={selectedContestId ?? ''}
                onChange={(e) => {
                  const newId = Number(e.target.value);
                  setSelectedContestId(newId);
                  setSearchParams({ contestId: String(newId) });
                }}
              >
                {contests.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.year}) — {c.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          {canManage && isContestActive && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`${ROUTES.SHARAD_SAMMAN_NOMINATION_NEW}${selectedContestId ? `?contestId=${selectedContestId}` : ''}`)}
            >
              <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
              Nominate Committee
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading contest statistics and nominations..." />
      ) : (
        <>
          {/* Contest-Scoped Stat Cards Row */}
          <div className="samman-stat-grid">
            <Link
              to={makeListLink()}
              className="samman-stat-card"
              title="View all nominations for this contest"
            >
              <div className="samman-stat-card__icon samman-stat-card__icon--primary">
                <i className="fas fa-layer-group" aria-hidden="true" />
              </div>
              <div className="samman-stat-card__content">
                <p className="samman-stat-card__label">Total Entries</p>
                <p className="samman-stat-card__value">{stats?.total ?? 0}</p>
              </div>
            </Link>

            <Link
              to={makeListLink('UNDER_REVIEW')}
              className="samman-stat-card"
              title="View nominations under review for this contest"
            >
              <div className="samman-stat-card__icon samman-stat-card__icon--warning">
                <i className="fas fa-hourglass-half" aria-hidden="true" />
              </div>
              <div className="samman-stat-card__content">
                <p className="samman-stat-card__label">Pending Review</p>
                <p className="samman-stat-card__value">{(stats?.submitted ?? 0) + (stats?.underReview ?? 0)}</p>
              </div>
            </Link>

            <Link
              to={makeListLink('APPROVED')}
              className="samman-stat-card"
              title="View approved nominations for this contest"
            >
              <div className="samman-stat-card__icon samman-stat-card__icon--success">
                <i className="fas fa-check-circle" aria-hidden="true" />
              </div>
              <div className="samman-stat-card__content">
                <p className="samman-stat-card__label">Approved</p>
                <p className="samman-stat-card__value">{stats?.approved ?? 0}</p>
              </div>
            </Link>

            <Link
              to={makeListLink('SHORTLISTED')}
              className="samman-stat-card"
              title="View shortlisted candidates for this contest"
            >
              <div className="samman-stat-card__icon samman-stat-card__icon--info">
                <i className="fas fa-star" aria-hidden="true" />
              </div>
              <div className="samman-stat-card__content">
                <p className="samman-stat-card__label">Shortlisted</p>
                <p className="samman-stat-card__value">{stats?.shortlisted ?? 0}</p>
              </div>
            </Link>

            <Link
              to={makeListLink('REJECTED')}
              className="samman-stat-card"
              title="View rejected nominations for this contest"
            >
              <div className="samman-stat-card__icon samman-stat-card__icon--danger">
                <i className="fas fa-times-circle" aria-hidden="true" />
              </div>
              <div className="samman-stat-card__content">
                <p className="samman-stat-card__label">Rejected</p>
                <p className="samman-stat-card__value">{stats?.rejected ?? 0}</p>
              </div>
            </Link>

            <Link
              to={makeListLink('DRAFT')}
              className="samman-stat-card"
              title="View draft nominations for this contest"
            >
              <div className="samman-stat-card__icon">
                <i className="fas fa-pen-ruler" aria-hidden="true" />
              </div>
              <div className="samman-stat-card__content">
                <p className="samman-stat-card__label">Drafts</p>
                <p className="samman-stat-card__value">{stats?.draft ?? 0}</p>
              </div>
            </Link>
          </div>

          {/* Quick Access Action Cards */}
          <div className="form-grid form-grid--3">
            <Card>
              <div style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <i className="fas fa-inbox" style={{ color: 'var(--colour-warning)', fontSize: '1.1rem' }} />
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Review Queue</h3>
                </div>
                <p style={{ margin: '0 0 var(--space-4)', fontSize: '12.5px', color: 'var(--colour-ink-soft)', lineHeight: 1.4 }}>
                  Inspect newly submitted committee applications, verify attached documents and assign review decisions.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(makeListLink('UNDER_REVIEW'))}
                >
                  Open Queue &rarr;
                </Button>
              </div>
            </Card>

            <Card>
              <div style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <i className="fas fa-star" style={{ color: 'var(--colour-info)', fontSize: '1.1rem' }} />
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Shortlisted Candidates</h3>
                </div>
                <p style={{ margin: '0 0 var(--space-4)', fontSize: '12.5px', color: 'var(--colour-ink-soft)', lineHeight: 1.4 }}>
                  Inspect finalized nominations eligible for award consideration with frozen audit snapshots.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(makeListLink('SHORTLISTED'))}
                >
                  View Shortlist &rarr;
                </Button>
              </div>
            </Card>

            <Card>
              <div style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <i className="fas fa-ban" style={{ color: 'var(--colour-danger)', fontSize: '1.1rem' }} />
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Rejected Nominations</h3>
                </div>
                <p style={{ margin: '0 0 var(--space-4)', fontSize: '12.5px', color: 'var(--colour-ink-soft)', lineHeight: 1.4 }}>
                  Examine ineligible entries with mandatory rejection justifications recorded by portal reviewers.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(makeListLink('REJECTED'))}
                >
                  View Rejected &rarr;
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Nominations Table Card */}
          <Card
            title={`Recent Nominations${selectedContest ? ` (${selectedContest.name})` : ''}`}
            description="Latest award entries received from registered puja committees for this contest."
            actions={
              <Link to={makeListLink()} className="btn btn--secondary btn--sm">
                View All ({stats?.total ?? 0})
              </Link>
            }
          >
            {recentNominations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <i className="fas fa-award" style={{ fontSize: '2.5rem', color: 'var(--colour-ink-faint)', marginBottom: 'var(--space-3)' }} />
                <h3 style={{ margin: '0 0 var(--space-1)', fontSize: '1rem', fontWeight: 600 }}>No Nominations Yet for This Contest</h3>
                <p style={{ margin: '0 0 var(--space-4)', fontSize: '13px', color: 'var(--colour-ink-soft)' }}>
                  Nominations submitted by committees or created by administrators for {selectedContest?.name || 'this contest'} will appear here.
                </p>
                {canManage && isContestActive ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`${ROUTES.SHARAD_SAMMAN_NOMINATION_NEW}${selectedContestId ? `?contestId=${selectedContestId}` : ''}`)}
                  >
                    <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
                    Create First Nomination
                  </Button>
                ) : (
                  !isContestActive && (
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <span className="badge badge--neutral">
                        Contest is {selectedContest?.status || 'Inactive'} &bull; Nominations Closed
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Puja Committee</th>
                      <th>Contest Session</th>
                      <th>Award Category</th>
                      <th>Theme Title</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentNominations.map((nom) => (
                      <tr key={nom.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--colour-ink-soft)' }}>
                            #{nom.id}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--colour-ink)' }}>
                            {nom.committee?.committeeName || 'Unknown Committee'}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--colour-ink-soft)' }}>
                            {nom.committee?.city} &bull; Reg: {nom.committee?.registrationNo}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge--default">
                            {nom.contest?.name || `Contest #${nom.contestId}`}
                          </span>
                        </td>
                        <td>
                          <span className="samman-category-badge">
                            <i className="fas fa-tag" style={{ fontSize: '10px' }} />
                            {nom.category || 'General'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--colour-ink)' }}>
                            {nom.title || 'Untitled Presentation'}
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={nom.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Nomination Details"
                              onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_DETAIL(nom.id))}
                            >
                              <i className="fas fa-eye" style={{ color: 'var(--colour-brand)' }} />
                            </Button>
                            {canManage && nom.status !== 'SHORTLISTED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Edit Nomination"
                                onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_EDIT(nom.id))}
                              >
                                <i className="fas fa-edit" style={{ color: 'var(--colour-ink-soft)' }} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export default SharadSammanDashboardPage;

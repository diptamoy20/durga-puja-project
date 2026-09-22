import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
import type { SharadSammanDashboardData, SharadSammanNomination } from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

export function SharadSammanDashboardPage() {
  const navigate = useNavigate();
  const { can } = useAuth();

  const [data, setData] = useState<SharadSammanDashboardData | null>(null);
  const [recentNominations, setRecentNominations] = useState<SharadSammanNomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManage = can(PERMISSIONS.MANAGE_NOMINATIONS);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      sammanService.getDashboard(),
      sammanService.list({ perPage: 6, sortDir: 'desc' }),
    ])
      .then(([dashData, listData]) => {
        setData(dashData);
        setRecentNominations(listData.items);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load Sharad Samman dashboard.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Loading Sharad Samman dashboard..." />;

  const stats = data?.stats;
  const activeContest = data?.activeContest;

  return (
    <div className="page samman-page">
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
              onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_NEW)}
            >
              <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
              Add Nomination
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATIONS)}
          >
            <i className="fas fa-list" aria-hidden="true" style={{ marginRight: '6px' }} />
            All Nominations
          </Button>
        </div>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Active Contest Banner */}
      <div className="samman-contest-banner">
        <div className="samman-contest-banner__info">
          <div className="samman-contest-banner__icon">
            <i className="fas fa-trophy" aria-hidden="true" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h2 className="samman-contest-banner__title">
                {activeContest ? activeContest.name : 'No Active Contest Configured'}
              </h2>
              {activeContest && (
                <span className="badge badge--success">
                  {activeContest.status}
                </span>
              )}
            </div>
            <p className="samman-contest-banner__meta">
              <span><strong>Contest Year:</strong> {activeContest?.year || '2026'}</span>
              {formatContestDate(activeContest?.endDate) && (
                <>
                  <span>&bull;</span>
                  <span><strong>Last Date:</strong> {formatContestDate(activeContest?.endDate)}</span>
                </>
              )}
              <span>&bull;</span>
              <span>
                {activeContest?.description ||
                  'Official West Bengal Durga Puja Sharad Samman 2026 Competition'}
              </span>
            </p>
          </div>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_NEW)}
          >
            <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
            Nominate Committee
          </Button>
        )}
      </div>

      {/* Stat Cards Row */}
      <div className="samman-stat-grid">
        <Link
          to={ROUTES.SHARAD_SAMMAN_NOMINATIONS}
          className="samman-stat-card"
          title="View all nominations"
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
          to={`${ROUTES.SHARAD_SAMMAN_NOMINATIONS}?status=UNDER_REVIEW`}
          className="samman-stat-card"
          title="View nominations under review"
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
          to={`${ROUTES.SHARAD_SAMMAN_NOMINATIONS}?status=APPROVED`}
          className="samman-stat-card"
          title="View approved nominations"
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
          to={`${ROUTES.SHARAD_SAMMAN_NOMINATIONS}?status=SHORTLISTED`}
          className="samman-stat-card"
          title="View shortlisted candidates"
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
          to={`${ROUTES.SHARAD_SAMMAN_NOMINATIONS}?status=REJECTED`}
          className="samman-stat-card"
          title="View rejected nominations"
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
          to={`${ROUTES.SHARAD_SAMMAN_NOMINATIONS}?status=DRAFT`}
          className="samman-stat-card"
          title="View draft nominations"
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
              onClick={() => navigate(`${ROUTES.SHARAD_SAMMAN_NOMINATIONS}?status=UNDER_REVIEW`)}
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
              onClick={() => navigate(`${ROUTES.SHARAD_SAMMAN_NOMINATIONS}?status=SHORTLISTED`)}
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
              onClick={() => navigate(`${ROUTES.SHARAD_SAMMAN_NOMINATIONS}?status=REJECTED`)}
            >
              View Rejected &rarr;
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Nominations Table Card */}
      <Card
        title="Recent Nominations"
        description="Latest award entries received from registered puja committees across active contests."
        actions={
          <Link to={ROUTES.SHARAD_SAMMAN_NOMINATIONS} className="btn btn--secondary btn--sm">
            View All ({stats?.total ?? 0})
          </Link>
        }
      >
        {recentNominations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <i className="fas fa-award" style={{ fontSize: '2.5rem', color: 'var(--colour-ink-faint)', marginBottom: 'var(--space-3)' }} />
            <h3 style={{ margin: '0 0 var(--space-1)', fontSize: '1rem', fontWeight: 600 }}>No Nominations Yet</h3>
            <p style={{ margin: '0 0 var(--space-4)', fontSize: '13px', color: 'var(--colour-ink-soft)' }}>
              Nominations submitted by committees or created by administrators will appear here.
            </p>
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_NEW)}
              >
                <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
                Create First Nomination
              </Button>
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
    </div>
  );
}

export default SharadSammanDashboardPage;

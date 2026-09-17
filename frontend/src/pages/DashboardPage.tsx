import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { FESTIVAL_COUNTDOWN, daysUntil } from '@/constants/festival';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { TileGrid } from '@/components/dashboard/TileGrid';
import type { Tile } from '@/components/dashboard/TileGrid';
import { fetchDashboardSummary } from '@/store/slices/dashboardSlice';
import { fetchUserStats } from '@/store/slices/usersSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';

const SECTION_LABELS: Record<string, string> = {
  diaspora: 'diaspora registrations',
  committees: 'puja committees',
  pandals: 'pandal atlas',
  articles: 'articles',
};

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { displayName, user, can } = useAuth();

  const { summary, status, error } = useAppSelector((state) => state.dashboard);
  const userStats = useAppSelector((state) => state.users.stats);

  const canViewDashboard = can(PERMISSIONS.VIEW_DASHBOARD);

  useEffect(() => {
    if (!canViewDashboard) return;

    dispatch(fetchDashboardSummary());
    dispatch(fetchUserStats());
  }, [dispatch, canViewDashboard]);

  // Recomputed on mount only; a day boundary crossing mid-session is not worth
  // a timer.
  const countdown = useMemo(() => daysUntil(FESTIVAL_COUNTDOWN.date), []);

  const articleTiles: Tile[] = [
    { label: 'Total Articles', value: summary?.articles.total ?? null },
    { label: 'Drafts', value: summary?.articles.draft ?? null },
    { label: 'In Review', value: summary?.articles.inReview ?? null },
    { label: 'Approved', value: summary?.articles.approved ?? null },
    { label: 'Rejected', value: summary?.articles.rejected ?? null },
    { label: 'Scheduled', value: summary?.articles.scheduled ?? null },
    { label: 'Published', value: summary?.articles.published ?? null },
    { label: 'Archived', value: summary?.articles.archived ?? null },
  ];

  const userTiles: Tile[] = [
    { label: 'Total', value: userStats?.total ?? null },
    { label: 'Active', value: userStats?.active ?? null },
    { label: 'Pending', value: userStats?.pending ?? null },
    { label: 'Inactive', value: userStats?.inactive ?? null },
    { label: 'Suspended', value: userStats?.suspended ?? null },
  ];

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-heading">
        <p className="dashboard-label">Tourism Overview</p>
        <h1 className="dashboard-title">West Bengal Durga Puja Portal</h1>
      </header>

      {user?.mustChangePassword && (
        <Alert variant="warning" title="Update your password">
          You are signed in with a temporary password.{' '}
          <Link to={ROUTES.CHANGE_PASSWORD}>Change it now</Link> to keep your account secure.
        </Alert>
      )}

      {canViewDashboard ? (
        <>
          {status === 'failed' && <Alert variant="error">{error}</Alert>}

          {summary && summary.unavailable.length > 0 && (
            <Alert variant="warning" title="Some figures are unavailable">
              Could not reach the service behind{' '}
              {summary.unavailable.map((key) => SECTION_LABELS[key] ?? key).join(', ')}. Those cards
              show zero until it is back.
            </Alert>
          )}

          <TileGrid title="Article Management" tiles={articleTiles} />

          <div className="dashboard-grid">
            <MetricCard
              label="Diaspora Members"
              value={summary?.diasporaMembers ?? null}
              icon="fa-globe"
              tone="info"
            />

            <MetricCard
              label="Puja Committees"
              value={summary?.pujaCommittees ?? null}
              icon="fa-building"
              tone="warning"
            />

            <MetricCard
              label="Pandals"
              value={summary?.pandals ?? null}
              icon="fa-map-location-dot"
              tone="primary"
            />

            <MetricCard
              label="Pending Approvals"
              value={summary?.pendingApprovals ?? null}
              icon="fa-hourglass-half"
              tone="danger"
              badge={
                summary && summary.pendingApprovals > 0
                  ? { text: 'Needs review', tone: 'danger' }
                  : undefined
              }
            />

            <section className="dashboard-card countdown-card">
              <div className="countdown-header">
                <h2 className="countdown-title">
                  Upcoming Festival
                  <br />
                  Countdown
                </h2>
              </div>

              <div className="countdown-body">
                <div className="countdown-box">
                  <p className="countdown-label">Countdown to {FESTIVAL_COUNTDOWN.name}</p>
                  <p className="countdown-number">{countdown}</p>
                  <p className="countdown-days">Days remaining</p>
                </div>
              </div>
            </section>
          </div>

          <TileGrid
            title="Portal Users"
            tiles={userTiles}
            action={
              can(PERMISSIONS.VIEW_USERS) ? (
                <Link className="tile-card__action" to={ROUTES.USERS}>
                  View users
                </Link>
              ) : undefined
            }
          />
        </>
      ) : (
        <Alert variant="info" title={`Welcome, ${displayName.split(' ')[0]}`}>
          Your account does not have dashboard access. The sections you can open are listed in the
          sidebar.
        </Alert>
      )}

      <Card title="Your access" description="Roles and permissions granted to your account.">
        <dl className="detail-list">
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Roles</dt>
            <dd>{user?.roles.length ? user.roles.join(', ') : 'No role assigned'}</dd>
          </div>
          <div>
            <dt>Permissions</dt>
            <dd>
              {user?.isSuperAdmin
                ? 'All permissions (Super Admin)'
                : `${user?.permissions.length ?? 0} granted`}
            </dd>
          </div>
          <div>
            <dt>Last sign-in</dt>
            <dd>
              {user?.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : 'This is your first sign-in'}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

export default DashboardPage;

import { Link } from 'react-router-dom';

import { WebinarBreadcrumb } from '@/components/webinars/WebinarBreadcrumb';
import { WebinarStatsCards } from '@/components/webinars/WebinarStatsCards';
import { ROUTES } from '@/constants/routes';
import type { WebinarListStats } from '@/types/events';

interface WebinarListHeaderProps {
  title: string;
  subtitle: string;
  stats: WebinarListStats | null;
  canCreate?: boolean;
}

export function WebinarListHeader({ title, subtitle, stats, canCreate = false }: WebinarListHeaderProps) {
  return (
    <header className="webinar-list-header">
      <WebinarBreadcrumb items={[{ label: 'Webinars Management' }]} />

      <div className="webinar-list-header__top">
        <div className="webinar-list-header__intro">
          <h1 className="webinar-list-header__title">{title}</h1>
          <p className="webinar-list-header__subtitle">{subtitle}</p>
        </div>

        <div className="webinar-list-header__actions">
          <Link
            to={ROUTES.PUBLIC_WEBINARS}
            className="btn btn--outline-primary btn--md"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" /> Public Hub
          </Link>
          <Link
            to={ROUTES.PUBLIC_WEBINAR_REPLAYS}
            className="btn btn--outline-secondary btn--md"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fas fa-circle-play" aria-hidden="true" /> Replay Library
          </Link>
          {canCreate && (
            <Link to={ROUTES.WEBINARS_NEW} className="btn btn--primary btn--md">
              <i className="fas fa-circle-plus" aria-hidden="true" /> Schedule Webinar
            </Link>
          )}
        </div>
      </div>

      {stats && <WebinarStatsCards stats={stats} />}
    </header>
  );
}

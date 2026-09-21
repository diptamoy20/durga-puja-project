import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import type { WebinarListStats } from '@/types/events';

interface WebinarStatsCardsProps {
  stats: WebinarListStats;
}

const STAT_ITEMS = [
  {
    key: 'scheduled' as const,
    label: 'Scheduled',
    icon: 'fa-calendar-check',
    tone: 'primary',
    to: ROUTES.WEBINARS,
  },
  {
    key: 'live' as const,
    label: 'Live Now',
    icon: 'fa-tower-broadcast',
    tone: 'danger',
    to: `${ROUTES.WEBINARS}?status=LIVE`,
  },
  {
    key: 'completed' as const,
    label: 'Completed',
    icon: 'fa-circle-check',
    tone: 'success',
    to: `${ROUTES.WEBINARS}?status=COMPLETED`,
  },
  {
    key: 'totalRsvps' as const,
    label: 'Total RSVPs',
    icon: 'fa-users',
    tone: 'info',
    to: ROUTES.WEBINARS,
  },
];

export function WebinarStatsCards({ stats }: WebinarStatsCardsProps) {
  return (
    <div className="webinar-admin__stats">
      {STAT_ITEMS.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          className={`webinar-stat-card webinar-stat-card--${item.tone}`}
        >
          <div className={`webinar-stat-card__icon webinar-stat-card__icon--${item.tone}`}>
            <i className={`fas ${item.icon}`} aria-hidden="true" />
          </div>
          <div className="webinar-stat-card__content">
            <span className="webinar-stat-card__label">{item.label}</span>
            <span className={`webinar-stat-card__value${item.key === 'live' ? ' webinar-stat-card__value--danger' : ''}`}>
              {stats[item.key]}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

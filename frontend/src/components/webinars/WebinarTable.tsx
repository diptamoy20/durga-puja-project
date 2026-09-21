import { Link } from 'react-router-dom';

import { StatusBadge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import {
  formatScheduleRange,
  hasReplay,
  LIVE_PLATFORMS,
  resolveBannerUrl,
  speakerSummary,
  statusTone,
  WEBINAR_STATUSES,
} from '@/utils/webinarHelpers';
import type { Webinar, WebinarStatus } from '@/types/events';

interface WebinarTableProps {
  items: Webinar[];
  loading?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onDelete?: (webinar: Webinar) => void;
}

function truncate(text: string | null | undefined, max: number): string {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function statusLabel(status: WebinarStatus): string {
  return WEBINAR_STATUSES[status] ?? status;
}

export function WebinarTable({
  items,
  loading = false,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  onDelete,
}: WebinarTableProps) {
  return (
    <div className="table-wrapper webinar-table-wrapper">
      <table className="table webinar-table">
        <thead>
          <tr>
            <th className="webinar-table__col-poster">Poster</th>
            <th>Title &amp; Topic</th>
            <th>Schedule (Timezone)</th>
            <th>Platform</th>
            <th>RSVPs / Capacity</th>
            <th>Status</th>
            <th>Replay</th>
            <th className="table__actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="table__placeholder">
                Loading webinars…
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={8} className="table__placeholder">
                <div className="webinar-table__empty">
                  <div className="webinar-table__empty-icon" aria-hidden="true">
                    <i className="fas fa-display" />
                  </div>
                  <strong>No webinars found</strong>
                  <p>Schedule your first webinar session to start collecting RSVPs and broadcasting live.</p>
                  {canCreate && (
                    <Link to={ROUTES.WEBINARS_NEW} className="btn btn--primary btn--sm">
                      <i className="fas fa-circle-plus" aria-hidden="true" /> Schedule Webinar
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            items.map((webinar) => {
              const bannerUrl = resolveBannerUrl(webinar.bannerImage);
              const speakerCount = webinar.speakers?.length ?? 0;
              const rsvpCount = webinar._count?.registrations ?? 0;

              return (
                <tr key={webinar.id}>
                  <td>
                    {bannerUrl ? (
                      <img src={bannerUrl} alt="" className="webinar-poster" />
                    ) : (
                      <div className="webinar-poster webinar-poster--empty" aria-hidden="true">
                        <i className="fas fa-display" />
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="table__primary">{webinar.title}</span>
                    {webinar.subtitle && (
                      <span className="table__secondary">{truncate(webinar.subtitle, 60)}</span>
                    )}
                    {speakerCount > 0 && (
                      <span className="table__secondary webinar-table__speakers">
                        <i className="fas fa-user" aria-hidden="true" /> {speakerCount}{' '}
                        {speakerCount === 1 ? 'Speaker' : 'Speakers'}: {speakerSummary(webinar.speakers)}
                      </span>
                    )}
                  </td>
                  <td className="webinar-table__schedule">{formatScheduleRange(webinar)}</td>
                  <td>
                    <span className="webinar-platform-badge">
                      <i className="fas fa-tower-broadcast" aria-hidden="true" />
                      {LIVE_PLATFORMS[webinar.livePlatform] ?? webinar.livePlatform}
                    </span>
                  </td>
                  <td>
                    <Link to={ROUTES.WEBINARS_RSVPS(webinar.id)} className="webinar-rsvp-badge">
                      <i className="fas fa-users" aria-hidden="true" /> {rsvpCount}
                      {webinar.maxAttendees ? ` / ${webinar.maxAttendees}` : ' (Open)'}
                    </Link>
                  </td>
                  <td>
                    {webinar.status === 'LIVE' ? (
                      <StatusBadge tone="danger">
                        <span className="webinar-live-pulse">LIVE NOW</span>
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone={statusTone(webinar.status)}>
                        {statusLabel(webinar.status)}
                      </StatusBadge>
                    )}
                  </td>
                  <td>
                    {hasReplay(webinar) ? (
                      <span className="webinar-replay-badge webinar-replay-badge--ready">
                        <i className="fas fa-circle-play" aria-hidden="true" /> Replay Available
                      </span>
                    ) : webinar.status === 'COMPLETED' ? (
                      <span className="webinar-replay-badge webinar-replay-badge--pending">
                        Pending Upload
                      </span>
                    ) : (
                      <span className="webinar-table__dash">—</span>
                    )}
                  </td>
                  <td className="table__actions">
                    <div className="webinar-action-group">
                      <Link
                        to={ROUTES.WEBINARS_DETAIL(webinar.id)}
                        className="webinar-action-btn"
                        title="Control Room & Overview"
                      >
                        <i className="fas fa-display" aria-hidden="true" />
                      </Link>
                      <Link
                        to={ROUTES.WEBINARS_RSVPS(webinar.id)}
                        className="webinar-action-btn"
                        title="View RSVPs"
                      >
                        <i className="fas fa-users" aria-hidden="true" />
                      </Link>
                      {canEdit && (
                        <Link
                          to={ROUTES.WEBINARS_EDIT(webinar.id)}
                          className="webinar-action-btn"
                          title="Edit Settings"
                        >
                          <i className="fas fa-pencil" aria-hidden="true" />
                        </Link>
                      )}
                      {canDelete && onDelete && (
                        <button
                          type="button"
                          className="webinar-action-btn webinar-action-btn--danger"
                          title="Delete"
                          onClick={() => onDelete(webinar)}
                        >
                          <i className="fas fa-trash" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

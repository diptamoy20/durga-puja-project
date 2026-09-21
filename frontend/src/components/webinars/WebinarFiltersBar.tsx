import { Button } from '@/components/ui/Button';
import { LIVE_PLATFORMS, WEBINAR_STATUSES } from '@/utils/webinarHelpers';
import type { LivePlatform, WebinarStatus } from '@/types/events';

interface WebinarFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  status?: WebinarStatus;
  onStatusChange: (value: string) => void;
  livePlatform?: LivePlatform;
  onPlatformChange: (value: string) => void;
  onReset?: () => void;
  showReset?: boolean;
}

const STATUS_OPTIONS: Array<{ value: WebinarStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  ...(Object.entries(WEBINAR_STATUSES) as Array<[WebinarStatus, string]>).map(([value, label]) => ({
    value,
    label,
  })),
];

const PLATFORM_OPTIONS: Array<{ value: LivePlatform | ''; label: string }> = [
  { value: '', label: 'All Platforms' },
  ...(Object.entries(LIVE_PLATFORMS) as Array<[LivePlatform, string]>).map(([value, label]) => ({
    value,
    label,
  })),
];

export function WebinarFiltersBar({
  search,
  onSearchChange,
  onSubmit,
  status,
  onStatusChange,
  livePlatform,
  onPlatformChange,
  onReset,
  showReset,
}: WebinarFiltersBarProps) {
  return (
    <form className="webinar-filters" onSubmit={onSubmit}>
      <div className="webinar-filters__field webinar-filters__field--search">
        <label className="webinar-filters__label" htmlFor="webinar-search">
          Search
        </label>
        <div className="webinar-filters__search-group">
          <span className="webinar-filters__search-icon" aria-hidden="true">
            <i className="fas fa-search" />
          </span>
          <input
            id="webinar-search"
            type="search"
            className="field__control webinar-filters__search-input"
            placeholder="Search by title, topic, or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="webinar-filters__field">
        <label className="webinar-filters__label" htmlFor="webinar-status">
          Status
        </label>
        <select
          id="webinar-status"
          className="field__control"
          value={status ?? ''}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="webinar-filters__field">
        <label className="webinar-filters__label" htmlFor="webinar-platform">
          Live Platform
        </label>
        <select
          id="webinar-platform"
          className="field__control"
          value={livePlatform ?? ''}
          onChange={(e) => onPlatformChange(e.target.value)}
        >
          {PLATFORM_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="webinar-filters__actions">
        <Button type="submit" variant="primary" size="md">
          <i className="fas fa-filter" aria-hidden="true" /> Filter
        </Button>
        {showReset && onReset && (
          <button type="button" className="btn btn--secondary btn--md" onClick={onReset} title="Reset filters">
            <i className="fas fa-rotate-left" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PublicWebinarLayout } from '@/components/webinars/PublicWebinarLayout';
import { ROUTES } from '@/constants/routes';
import { publicWebinarService } from '@/services/eventsService';
import type { Webinar } from '@/types/events';
import {
  formatDurationMinutes,
  resolveBannerUrl,
  speakerSummary,
} from '@/utils/webinarHelpers';

import '@/styles/public-webinars.css';

function truncate(text: string | null | undefined, max: number): string {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

export function PublicWebinarReplaysPage() {
  const [replays, setReplays] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    publicWebinarService
      .replays()
      .catch(() => [])
      .then(setReplays)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return replays;
    return replays.filter((replay) => {
      const haystack = [
        replay.title,
        replay.subtitle,
        replay.description,
        ...(replay.speakers?.map((s) => s.name) ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [replays, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  const handleClear = () => {
    setSearch('');
    setQuery('');
  };

  return (
    <PublicWebinarLayout brandLabel="Durga Puja GS • Replay Library" brandTo={ROUTES.PUBLIC_WEBINARS}>
      <header className="public-webinars__detail-header">
        <div className="public-webinars__container">
          <span className="public-webinars__badge">
            <i className="fas fa-photo-video" aria-hidden="true" />
            On-Demand Archive
          </span>
          <h1 className="serif-font" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, margin: '0 0 0.75rem' }}>
            Webinar Replay Library
          </h1>
          <p className="public-webinars__lead" style={{ margin: 0 }}>
            Browse and watch full video recordings of all previous Durga Puja Global Summit webinars, symposia, and
            masterclasses.
          </p>
        </div>
      </header>

      <div className="public-webinars__container public-webinars__section">
        <div className="public-webinars__panel" style={{ marginBottom: '2rem' }}>
          <form className="public-webinars__search-bar" onSubmit={handleSearch}>
            <div className="public-webinars__search-input-wrap">
              <span>
                <i className="fas fa-search" aria-hidden="true" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search replay archives by topic, speaker, or keyword…"
              />
            </div>
            <button type="submit" className="public-webinars__btn public-webinars__btn--festival">
              Search Replays
            </button>
            {query && (
              <button type="button" className="public-webinars__btn public-webinars__btn--light public-webinars__btn--outline" onClick={handleClear}>
                Clear
              </button>
            )}
          </form>
        </div>

        {loading ? (
          <div className="public-webinars__empty">Loading replay library…</div>
        ) : filtered.length === 0 ? (
          <div className="public-webinars__empty">
            <i className="fas fa-photo-video fa-2x" aria-hidden="true" style={{ display: 'block', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 className="serif-font" style={{ margin: '0 0 0.5rem' }}>No replay recordings found</h3>
            <p style={{ margin: 0 }}>
              {query
                ? 'Try adjusting your search terms or browse the full archive.'
                : 'Recordings are added here once scheduled live webinars conclude.'}
            </p>
            {query && (
              <button type="button" className="public-webinars__btn public-webinars__btn--festival" style={{ marginTop: '1rem' }} onClick={handleClear}>
                Show All Replays
              </button>
            )}
          </div>
        ) : (
          <div className="public-webinars__grid">
            {filtered.map((replay) => {
              const bannerUrl = resolveBannerUrl(replay.bannerImage);
              return (
                <article key={replay.id} className="public-webinars__card">
                  <div className="public-webinars__card-media public-webinars__card-media--relative">
                    {bannerUrl ? (
                      <img src={bannerUrl} alt={replay.title} />
                    ) : (
                      <div className="public-webinars__card-media--placeholder">
                        <i className="fas fa-play-circle fa-2x" aria-hidden="true" />
                      </div>
                    )}
                    {replay.replayDurationMinutes ? (
                      <span className="public-webinars__pill public-webinars__duration-pill">
                        <i className="fas fa-clock" aria-hidden="true" />
                        {formatDurationMinutes(replay.replayDurationMinutes)}
                      </span>
                    ) : null}
                  </div>
                  <div className="public-webinars__card-body">
                    <div className="public-webinars__card-meta">
                      <span className="public-webinars__pill" style={{ background: '#d1e7dd', color: '#0f5132' }}>
                        <i className="fas fa-check-circle" aria-hidden="true" />
                        Recording Available
                      </span>
                      <span>
                        {new Date(replay.scheduledStartTime).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="public-webinars__card-title serif-font">{replay.title}</h3>
                    {replay.subtitle && (
                      <p className="public-webinars__card-subtitle">{truncate(replay.subtitle, 80)}</p>
                    )}
                    {replay.speakers?.length ? (
                      <div className="public-webinars__panelists">
                        <small className="public-webinars__panelists-label">Panelists:</small>
                        <div className="public-webinars__panelists-names">{speakerSummary(replay.speakers)}</div>
                      </div>
                    ) : null}
                    <div className="public-webinars__card-actions">
                      <Link
                        to={ROUTES.PUBLIC_WEBINAR_DETAIL(replay.slug)}
                        className="public-webinars__btn public-webinars__btn--light public-webinars__btn--outline"
                        style={{ width: '100%' }}
                      >
                        <i className="fas fa-play-circle" aria-hidden="true" style={{ color: '#dc3545' }} />
                        Watch Recording
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PublicWebinarLayout>
  );
}

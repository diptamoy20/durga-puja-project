import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PublicWebinarLayout } from '@/components/webinars/PublicWebinarLayout';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { publicWebinarService } from '@/services/eventsService';
import type { Webinar } from '@/types/events';
import {
  formatScheduleRange,
  LIVE_PLATFORMS,
  resolveBannerUrl,
  speakerSummary,
} from '@/utils/webinarHelpers';

import '@/styles/public-webinars.css';

function truncate(text: string | null | undefined, max: number): string {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

interface RsvpModalProps {
  webinar: Webinar | null;
  onClose: () => void;
  onSuccess: (webinarTitle: string) => void;
}

function RsvpModal({ webinar, onClose, onSuccess }: RsvpModalProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [cityCountry, setCityCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!webinar) {
      setName('');
      setEmail('');
      setPhone('');
      setOrganization('');
      setCityCountry('');
    }
  }, [webinar]);

  if (!webinar) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      await publicWebinarService.rsvp(webinar.slug, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        organization: organization.trim() || undefined,
        cityCountry: cityCountry.trim() || undefined,
      });
      onSuccess(webinar.title);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'RSVP submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="public-webinars__modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="public-webinars__modal"
        role="dialog"
        aria-labelledby="rsvp-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="public-webinars__modal-header">
            <h2 id="rsvp-modal-title" className="serif-font" style={{ margin: 0, fontSize: '1.15rem' }}>
              <i className="fas fa-ticket-alt" aria-hidden="true" style={{ marginRight: '0.5rem', color: '#c88937' }} />
              RSVP for {webinar.title}
            </h2>
          </div>
          <div className="public-webinars__modal-body">
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.92rem' }}>
              Please fill out your details to receive instant registration confirmation and live session links.
            </p>

            <div className="public-webinars__form-field">
              <label htmlFor="rsvp-name">Full Name *</label>
              <input
                id="rsvp-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
              />
            </div>

            <div className="public-webinars__form-field">
              <label htmlFor="rsvp-email">Email Address *</label>
              <input
                id="rsvp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="public-webinars__form-field">
                <label htmlFor="rsvp-phone">Phone / WhatsApp</label>
                <input
                  id="rsvp-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 / +1 …"
                />
              </div>
              <div className="public-webinars__form-field">
                <label htmlFor="rsvp-city">City &amp; Country</label>
                <input
                  id="rsvp-city"
                  type="text"
                  value={cityCountry}
                  onChange={(e) => setCityCountry(e.target.value)}
                  placeholder="e.g. Kolkata, India"
                />
              </div>
            </div>

            <div className="public-webinars__form-field">
              <label htmlFor="rsvp-org">Organization / Puja Committee</label>
              <input
                id="rsvp-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Maddox Square Puja Committee"
              />
            </div>
          </div>
          <div className="public-webinars__modal-footer">
            <button type="button" className="public-webinars__btn public-webinars__btn--light" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="public-webinars__btn public-webinars__btn--festival" disabled={submitting}>
              {submitting ? 'Confirming…' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WebinarCardMedia({ webinar }: { webinar: Webinar }) {
  const bannerUrl = resolveBannerUrl(webinar.bannerImage);
  if (bannerUrl) {
    return (
      <div className="public-webinars__card-media">
        <img src={bannerUrl} alt={webinar.title} />
      </div>
    );
  }
  return (
    <div
      className="public-webinars__card-media"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}
    >
      <i className="fas fa-display fa-2x" aria-hidden="true" />
    </div>
  );
}

export function PublicWebinarsPage() {
  const toast = useToast();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [replays, setReplays] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpWebinar, setRsvpWebinar] = useState<Webinar | null>(null);

  useEffect(() => {
    Promise.all([
      publicWebinarService.list().catch(() => []),
      publicWebinarService.replays().catch(() => []),
    ])
      .then(([wList, rList]) => {
        setWebinars(wList);
        setReplays(rList);
      })
      .finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => {
    if (webinars.length === 0) return null;
    return webinars.find((w) => w.isFeatured) ?? webinars[0];
  }, [webinars]);

  const liveWebinars = useMemo(
    () => webinars.filter((w) => w.status === 'LIVE'),
    [webinars],
  );

  const upcomingWebinars = useMemo(
    () =>
      webinars.filter(
        (w) => w.status === 'SCHEDULED' && w.id !== featured?.id,
      ),
    [webinars, featured],
  );

  const replayHighlights = replays.slice(0, 4);
  const featuredBanner = featured ? resolveBannerUrl(featured.bannerImage) : null;

  const handleRsvpSuccess = (title: string) => {
    toast.success(`RSVP confirmed for "${title}". Calendar details sent to your email.`);
  };

  return (
    <PublicWebinarLayout>
      <header className="public-webinars__hero">
        <div className="public-webinars__hero-inner">
          <div className="public-webinars__hero-grid">
            <div>
              <span className="public-webinars__badge">
                <i className="fas fa-broadcast-tower" aria-hidden="true" />
                Global Knowledge Exchange
              </span>
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, margin: '0 0 1rem' }}>
                Webinars &amp; Virtual Symposia
              </h1>
              <p className="public-webinars__lead">
                Connect with global festival organizers, heritage scholars, diaspora leaders, and creative artisans as we
                celebrate the cultural depth and international presence of Durga Puja.
              </p>
              <div className="public-webinars__hero-actions">
                <a href="#upcoming" className="public-webinars__btn public-webinars__btn--warning">
                  <i className="fas fa-calendar-alt" aria-hidden="true" />
                  Upcoming Sessions
                </a>
                <Link to={ROUTES.PUBLIC_WEBINAR_REPLAYS} className="public-webinars__btn public-webinars__btn--light">
                  <i className="fas fa-play-circle" aria-hidden="true" />
                  Watch Replays
                </Link>
              </div>
            </div>

            {featured && (
              <div className="public-webinars__featured-card">
                <div className="public-webinars__featured-media">
                  {featuredBanner ? (
                    <img src={featuredBanner} alt={featured.title} />
                  ) : (
                    <i className="fas fa-display fa-3x" aria-hidden="true" style={{ color: '#94a3b8' }} />
                  )}
                </div>
                <div className="public-webinars__featured-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    {featured.status === 'LIVE' ? (
                      <span className="public-webinars__pill public-webinars__badge-live">LIVE NOW</span>
                    ) : (
                      <span className="public-webinars__pill" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                        Featured Session
                      </span>
                    )}
                    <small style={{ color: '#64748b' }}>
                      <i className="fas fa-clock" aria-hidden="true" style={{ marginRight: '0.25rem' }} />
                      {formatScheduleRange(featured)}
                    </small>
                  </div>
                  <h3 className="serif-font" style={{ margin: '0 0 0.5rem', fontSize: '1.15rem' }}>
                    {featured.title}
                  </h3>
                  {featured.subtitle && (
                    <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.92rem' }}>
                      {truncate(featured.subtitle, 80)}
                    </p>
                  )}
                  {featured.status === 'LIVE' ? (
                    <Link to={ROUTES.PUBLIC_WEBINAR_LIVE(featured.slug)} className="public-webinars__btn public-webinars__btn--danger" style={{ width: '100%' }}>
                      <i className="fas fa-broadcast-tower" aria-hidden="true" />
                      Join Live Stream Now
                    </Link>
                  ) : (
                    <Link to={ROUTES.PUBLIC_WEBINAR_DETAIL(featured.slug)} className="public-webinars__btn public-webinars__btn--festival" style={{ width: '100%' }}>
                      <i className="fas fa-ticket-alt" aria-hidden="true" />
                      View Agenda &amp; RSVP
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="public-webinars__container public-webinars__section">
        {liveWebinars.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="public-webinars__pill public-webinars__badge-live">●</span>
              <h2 className="public-webinars__section-title serif-font" style={{ margin: 0, color: '#dc3545' }}>
                Broadcasting Live Right Now
              </h2>
            </div>
            <div className="public-webinars__grid">
              {liveWebinars.map((live) => (
                <article key={live.id} className="public-webinars__card" style={{ borderColor: '#dc3545' }}>
                  <div className="public-webinars__card-body">
                    <div className="public-webinars__card-meta">
                      <span className="public-webinars__pill public-webinars__badge-live">LIVE STREAMING</span>
                      <span className="public-webinars__pill" style={{ background: '#f1f5f9', color: '#334155' }}>
                        {LIVE_PLATFORMS[live.livePlatform] ?? 'Live Broadcast'}
                      </span>
                    </div>
                    <h3 className="public-webinars__card-title serif-font">{live.title}</h3>
                    {live.subtitle && <p className="public-webinars__card-subtitle">{live.subtitle}</p>}
                    {live.speakers?.length ? (
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>
                        <span style={{ color: '#64748b' }}>Speakers: </span>
                        <strong>{speakerSummary(live.speakers)}</strong>
                      </p>
                    ) : null}
                    <div className="public-webinars__card-actions">
                      <Link to={ROUTES.PUBLIC_WEBINAR_LIVE(live.slug)} className="public-webinars__btn public-webinars__btn--danger" style={{ width: '100%' }}>
                        <i className="fas fa-play-circle" aria-hidden="true" />
                        Enter Live Webinar Room
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section id="upcoming">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 className="public-webinars__section-title serif-font">Upcoming Webinar Schedule</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Reserve your virtual seat and receive calendar reminders.</p>
          </div>

          {loading ? (
            <div className="public-webinars__empty">Loading upcoming sessions…</div>
          ) : upcomingWebinars.length === 0 ? (
            <div className="public-webinars__empty">
              <i className="fas fa-calendar-times fa-2x" aria-hidden="true" style={{ display: 'block', marginBottom: '1rem', opacity: 0.5 }} />
              <h3 className="serif-font" style={{ margin: '0 0 0.5rem' }}>No upcoming webinars scheduled</h3>
              <p style={{ margin: 0 }}>
                Check back soon or browse previous webinar recordings in our{' '}
                <Link to={ROUTES.PUBLIC_WEBINAR_REPLAYS}>Replay Library</Link>.
              </p>
            </div>
          ) : (
            <div className="public-webinars__grid">
              {upcomingWebinars.map((webinar) => (
                <article key={webinar.id} className="public-webinars__card">
                  <WebinarCardMedia webinar={webinar} />
                  <div className="public-webinars__card-body">
                    <div className="public-webinars__card-meta">
                      <span className="public-webinars__pill" style={{ background: '#f1f5f9', color: '#1d4ed8' }}>
                        <i className="fas fa-calendar-alt" aria-hidden="true" />
                        {formatScheduleRange(webinar)}
                      </span>
                    </div>
                    <h3 className="public-webinars__card-title serif-font">{webinar.title}</h3>
                    {webinar.subtitle && (
                      <p className="public-webinars__card-subtitle">{truncate(webinar.subtitle, 90)}</p>
                    )}
                    {webinar.speakers?.length ? (
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                        <small style={{ color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Featured Panelists:</small>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{speakerSummary(webinar.speakers)}</div>
                      </div>
                    ) : null}
                    <div className="public-webinars__card-actions">
                      <Link
                        to={ROUTES.PUBLIC_WEBINAR_DETAIL(webinar.slug)}
                        className="public-webinars__btn public-webinars__btn--festival"
                        style={{ flex: 1 }}
                      >
                        <i className="fas fa-ticket-alt" aria-hidden="true" />
                        RSVP &amp; Details
                      </Link>
                      <button
                        type="button"
                        className="public-webinars__btn public-webinars__btn--light"
                        style={{ color: '#334155', border: '1px solid #cbd5e1' }}
                        onClick={() => setRsvpWebinar(webinar)}
                        title="Quick RSVP"
                      >
                        <i className="fas fa-user-plus" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {replayHighlights.length > 0 && (
          <section className="public-webinars__panel" style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 className="public-webinars__section-title serif-font" style={{ marginBottom: '0.25rem' }}>
                  <i className="fas fa-play-circle" aria-hidden="true" style={{ color: '#dc3545', marginRight: '0.5rem' }} />
                  Recent Webinar Replays
                </h2>
                <p style={{ margin: 0, color: '#64748b' }}>
                  Watch on-demand recordings of past discussions, keynotes, and workshops.
                </p>
              </div>
              <Link to={ROUTES.PUBLIC_WEBINAR_REPLAYS} className="public-webinars__btn public-webinars__btn--light" style={{ color: '#1d4ed8', border: '1px solid #93c5fd' }}>
                View All Replays
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
            </div>
            <div className="public-webinars__grid">
              {replayHighlights.map((replay) => {
                const replayBanner = resolveBannerUrl(replay.bannerImage);
                return (
                  <article key={replay.id} className="public-webinars__card">
                    <div className="public-webinars__card-media" style={{ height: '140px' }}>
                      {replayBanner ? (
                        <img src={replayBanner} alt={replay.title} />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc3545', opacity: 0.5 }}>
                          <i className="fas fa-play-circle fa-2x" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="public-webinars__card-body">
                      <span className="public-webinars__pill" style={{ background: '#d1e7dd', color: '#0f5132', width: 'fit-content' }}>
                        <i className="fas fa-check-circle" aria-hidden="true" />
                        Replay
                      </span>
                      <h4 className="public-webinars__card-title serif-font" style={{ fontSize: '1rem' }}>
                        {truncate(replay.title, 45)}
                      </h4>
                      <Link to={ROUTES.PUBLIC_WEBINAR_DETAIL(replay.slug)} className="public-webinars__btn public-webinars__btn--light" style={{ width: '100%', color: '#334155', border: '1px solid #cbd5e1' }}>
                        <i className="fas fa-play" aria-hidden="true" />
                        Watch Replay
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <RsvpModal webinar={rsvpWebinar} onClose={() => setRsvpWebinar(null)} onSuccess={handleRsvpSuccess} />
    </PublicWebinarLayout>
  );
}

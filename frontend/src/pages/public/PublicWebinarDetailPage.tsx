import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PublicWebinarLayout } from '@/components/webinars/PublicWebinarLayout';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { publicWebinarService } from '@/services/eventsService';
import type { RsvpSuccessPayload, Webinar } from '@/types/events';
import {
  downloadCalendarIcs,
  formatDurationMinutes,
  formatScheduleRange,
  hasReplay,
  LIVE_PLATFORMS,
  resolveBannerUrl,
  resolveLiveEmbedUrl,
  resolveReplayEmbedUrl,
} from '@/utils/webinarHelpers';

import '@/styles/public-webinars.css';

function speakerInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

interface RsvpModalProps {
  webinar: Webinar;
  open: boolean;
  onClose: () => void;
  onSuccess: (payload: RsvpSuccessPayload) => void;
}

function RsvpModal({ webinar, open, onClose, onSuccess }: RsvpModalProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [cityCountry, setCityCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      const payload = await publicWebinarService.rsvp(webinar.slug, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        organization: organization.trim() || undefined,
        cityCountry: cityCountry.trim() || undefined,
      });
      setName('');
      setEmail('');
      setPhone('');
      setOrganization('');
      setCityCountry('');
      onSuccess(payload);
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
        aria-labelledby="detail-rsvp-title"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="public-webinars__modal-header">
            <h2 id="detail-rsvp-title" className="serif-font" style={{ margin: 0, fontSize: '1.15rem' }}>
              <i className="fas fa-ticket-alt" aria-hidden="true" style={{ marginRight: '0.5rem', color: '#c88937' }} />
              RSVP for {webinar.title}
            </h2>
          </div>
          <div className="public-webinars__modal-body">
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.92rem' }}>
              Please fill out your details to receive instant registration confirmation and live session links.
            </p>

            <div className="public-webinars__form-field">
              <label htmlFor="detail-rsvp-name">Full Name *</label>
              <input
                id="detail-rsvp-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
              />
            </div>

            <div className="public-webinars__form-field">
              <label htmlFor="detail-rsvp-email">Email Address *</label>
              <input
                id="detail-rsvp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="public-webinars__form-field">
                <label htmlFor="detail-rsvp-phone">Phone / WhatsApp</label>
                <input
                  id="detail-rsvp-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 / +1 …"
                />
              </div>
              <div className="public-webinars__form-field">
                <label htmlFor="detail-rsvp-city">City &amp; Country</label>
                <input
                  id="detail-rsvp-city"
                  type="text"
                  value={cityCountry}
                  onChange={(e) => setCityCountry(e.target.value)}
                  placeholder="e.g. Kolkata, India"
                />
              </div>
            </div>

            <div className="public-webinars__form-field">
              <label htmlFor="detail-rsvp-org">Organization / Puja Committee</label>
              <input
                id="detail-rsvp-org"
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

function ReplayPlayer({ webinar }: { webinar: Webinar }) {
  const embedUrl = resolveReplayEmbedUrl(webinar);
  const embedCode = webinar.replayEmbedCode?.trim();

  if (embedUrl) {
    return (
      <div style={{ aspectRatio: '16 / 9', borderRadius: '0.75rem', overflow: 'hidden' }}>
        <iframe
          src={embedUrl}
          title={`${webinar.title} replay`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      </div>
    );
  }

  if (embedCode) {
    return (
      <div
        style={{ aspectRatio: '16 / 9', borderRadius: '0.75rem', overflow: 'hidden' }}
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    );
  }

  return (
    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>
      Replay recording is being processed. Please check back soon.
    </p>
  );
}

function LiveEmbed({ webinar }: { webinar: Webinar }) {
  const embedUrl = resolveLiveEmbedUrl(webinar);
  const embedCode = webinar.liveEmbedCode?.trim();

  if (embedUrl) {
    return (
      <div style={{ aspectRatio: '16 / 9', borderRadius: '0.75rem', overflow: 'hidden' }}>
        <iframe
          src={embedUrl}
          title={`${webinar.title} live stream`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      </div>
    );
  }

  if (embedCode) {
    return (
      <div
        style={{ aspectRatio: '16 / 9', borderRadius: '0.75rem', overflow: 'hidden' }}
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    );
  }

  return null;
}

export function PublicWebinarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const toast = useToast();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [registration, setRegistration] = useState<RsvpSuccessPayload | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    publicWebinarService
      .get(slug)
      .then(setWebinar)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unable to load webinar.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleRsvpSuccess = (payload: RsvpSuccessPayload) => {
    setRegistration(payload);
    toast.success('Registration confirmed! Check your email for calendar details.');
  };

  if (loading) {
    return (
      <PublicWebinarLayout brandLabel="Durga Puja GS • Webinars" brandTo={ROUTES.PUBLIC_WEBINARS}>
        <div className="public-webinars__container public-webinars__section">
          <div className="public-webinars__empty">Loading webinar details…</div>
        </div>
      </PublicWebinarLayout>
    );
  }

  if (error || !webinar) {
    return (
      <PublicWebinarLayout brandLabel="Durga Puja GS • Webinars" brandTo={ROUTES.PUBLIC_WEBINARS}>
        <div className="public-webinars__container public-webinars__section">
          <div className="public-webinars__empty">
            <h2 className="serif-font" style={{ color: '#dc3545' }}>Webinar Not Found</h2>
            <p>{error ?? 'The requested webinar could not be retrieved.'}</p>
            <Link to={ROUTES.PUBLIC_WEBINARS} className="public-webinars__btn public-webinars__btn--festival">
              ← Back to Schedule
            </Link>
          </div>
        </div>
      </PublicWebinarLayout>
    );
  }

  const bannerUrl = resolveBannerUrl(webinar.bannerImage);
  const speakers = webinar.speakers?.filter((s) => s.name.trim()) ?? [];
  const resources = webinar.resources?.filter((r) => r.title.trim() && r.url.trim()) ?? [];
  const showRsvp = webinar.status === 'SCHEDULED' || webinar.status === 'LIVE';
  const showReplay = webinar.status === 'COMPLETED' && hasReplay(webinar);

  return (
    <PublicWebinarLayout brandLabel="Durga Puja GS • Webinars" brandTo={ROUTES.PUBLIC_WEBINARS}>
      <header className="public-webinars__detail-header">
        <div className="public-webinars__container">
          <div className="public-webinars__detail-grid">
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {webinar.status === 'LIVE' && (
                  <span className="public-webinars__pill public-webinars__badge-live">LIVE NOW</span>
                )}
                {webinar.status === 'SCHEDULED' && (
                  <span className="public-webinars__pill public-webinars__badge">Upcoming Webinar</span>
                )}
                {webinar.status === 'COMPLETED' && (
                  <span className="public-webinars__pill public-webinars__btn--success" style={{ padding: '0.2rem 0.65rem' }}>
                    Completed Session
                  </span>
                )}
                {webinar.status === 'CANCELLED' && (
                  <span className="public-webinars__pill" style={{ background: '#6c757d', color: '#fff' }}>
                    Cancelled
                  </span>
                )}
                <span className="public-webinars__pill" style={{ background: 'rgba(0,0,0,0.45)', color: '#fff' }}>
                  <i className="fas fa-clock" aria-hidden="true" />
                  {formatScheduleRange(webinar)}
                </span>
              </div>

              <h1 className="serif-font" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, margin: '0 0 1rem' }}>
                {webinar.title}
              </h1>
              {webinar.subtitle && (
                <p className="public-webinars__lead" style={{ marginBottom: '1.25rem' }}>
                  {webinar.subtitle}
                </p>
              )}

              <div className="public-webinars__hero-actions">
                {webinar.status === 'LIVE' && (
                  <Link to={ROUTES.PUBLIC_WEBINAR_LIVE(webinar.slug)} className="public-webinars__btn public-webinars__btn--danger">
                    <i className="fas fa-broadcast-tower" aria-hidden="true" />
                    Enter Live Stream Room
                  </Link>
                )}
                {showRsvp && (
                  <button type="button" className="public-webinars__btn public-webinars__btn--warning" onClick={() => setRsvpOpen(true)}>
                    <i className="fas fa-ticket-alt" aria-hidden="true" />
                    RSVP / Register Free
                  </button>
                )}
                {showReplay && (
                  <a href="#replay-section" className="public-webinars__btn public-webinars__btn--success">
                    <i className="fas fa-play-circle" aria-hidden="true" />
                    Watch Full Replay
                  </a>
                )}
                <button
                  type="button"
                  className="public-webinars__btn public-webinars__btn--light"
                  onClick={() => downloadCalendarIcs(webinar)}
                >
                  <i className="fas fa-calendar-plus" aria-hidden="true" />
                  Add to Calendar
                </button>
              </div>
            </div>

            {bannerUrl && (
              <div style={{ textAlign: 'center' }}>
                <img src={bannerUrl} alt={webinar.title} className="public-webinars__detail-banner" />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="public-webinars__container public-webinars__section">
        {registration && (
          <div className="public-webinars__alert-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <i className="fas fa-check-circle fa-2x" aria-hidden="true" />
              <div>
                <h3 className="serif-font" style={{ margin: '0 0 0.25rem' }}>Registration Confirmed!</h3>
                <p style={{ margin: 0 }}>
                  You are successfully registered for <strong>{registration.webinarTitle}</strong>.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid #badbcc', paddingTop: '1rem' }}>
              <div>
                <small style={{ textTransform: 'uppercase', fontWeight: 600, color: '#64748b' }}>Your Ticket Code:</small>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace' }}>{registration.registrationCode}</div>
              </div>
              <button
                type="button"
                className="public-webinars__btn public-webinars__btn--success"
                onClick={() => downloadCalendarIcs(webinar)}
              >
                <i className="fas fa-calendar-check" aria-hidden="true" />
                Download Calendar Invite (.ics)
              </button>
            </div>
          </div>
        )}

        <div className="public-webinars__content-grid">
          <div>
            {webinar.status === 'LIVE' && (
              <div className="public-webinars__panel" style={{ background: '#111', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className="public-webinars__pill public-webinars__badge-live">LIVE STREAM</span>
                  <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Broadcasting Now</span>
                </div>
                <LiveEmbed webinar={webinar} />
              </div>
            )}

            {showReplay && (
              <div id="replay-section" className="public-webinars__panel" style={{ background: '#111', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className="public-webinars__pill public-webinars__btn--success" style={{ padding: '0.2rem 0.65rem' }}>
                    <i className="fas fa-play-circle" aria-hidden="true" />
                    FULL SESSION REPLAY
                  </span>
                  {webinar.replayDurationMinutes ? (
                    <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                      {formatDurationMinutes(webinar.replayDurationMinutes)}
                    </span>
                  ) : null}
                </div>
                <ReplayPlayer webinar={webinar} />
              </div>
            )}

            <div className="public-webinars__panel">
              <h2 className="serif-font" style={{ fontSize: '1.25rem', margin: '0 0 1rem' }}>
                <i className="fas fa-align-left" aria-hidden="true" style={{ marginRight: '0.5rem', color: '#791d24' }} />
                Session Agenda &amp; Overview
              </h2>
              {webinar.description ? (
                <div style={{ lineHeight: 1.7, color: '#475569', whiteSpace: 'pre-line' }}>{webinar.description}</div>
              ) : (
                <p style={{ margin: 0, color: '#64748b' }}>
                  Detailed agenda and session syllabus will be announced shortly.
                </p>
              )}
            </div>

            {speakers.length > 0 && (
              <div className="public-webinars__panel">
                <h2 className="serif-font" style={{ fontSize: '1.25rem', margin: '0 0 1.25rem' }}>
                  <i className="fas fa-users" aria-hidden="true" style={{ marginRight: '0.5rem', color: '#791d24' }} />
                  Distinguished Panelists
                </h2>
                <div className="public-webinars__speaker-grid">
                  {speakers.map((speaker) => (
                    <article key={speaker.name} className="public-webinars__speaker-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: '#791d24',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            flexShrink: 0,
                          }}
                        >
                          {speakerInitial(speaker.name)}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{speaker.name}</h3>
                          <small style={{ color: '#64748b' }}>
                            {[speaker.designation, speaker.organization].filter(Boolean).join(' • ')}
                          </small>
                          {speaker.linkedin && (
                            <div>
                              <a href={speaker.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#791d24' }}>
                                <i className="fab fa-linkedin" aria-hidden="true" /> LinkedIn
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      {speaker.bio && (
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>{speaker.bio}</p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside>
            <div className="public-webinars__panel">
              <h3 className="serif-font" style={{ fontSize: '1.05rem', margin: '0 0 1rem' }}>
                <i className="fas fa-ticket-alt" aria-hidden="true" style={{ marginRight: '0.5rem', color: '#c88937' }} />
                Registration Status
              </h3>

              {webinar.status === 'COMPLETED' && (
                <p style={{ margin: '0 0 1rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: '0.5rem', fontSize: '0.92rem' }}>
                  <i className="fas fa-check-circle" aria-hidden="true" style={{ marginRight: '0.35rem' }} />
                  This webinar has concluded. You can watch the full recording replay anytime.
                </p>
              )}
              {webinar.status === 'CANCELLED' && (
                <p style={{ margin: '0 0 1rem', padding: '0.75rem', background: '#fff3cd', borderRadius: '0.5rem', fontSize: '0.92rem' }}>
                  <i className="fas fa-exclamation-triangle" aria-hidden="true" style={{ marginRight: '0.35rem' }} />
                  This session has been cancelled or rescheduled.
                </p>
              )}
              {showRsvp && (
                <button
                  type="button"
                  className="public-webinars__btn public-webinars__btn--festival"
                  style={{ width: '100%', marginBottom: '1rem' }}
                  onClick={() => setRsvpOpen(true)}
                >
                  <i className="fas fa-ticket-alt" aria-hidden="true" />
                  Register for Free
                </button>
              )}

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                <li style={{ marginBottom: '0.65rem' }}>
                  <i className="fas fa-calendar-check" aria-hidden="true" style={{ marginRight: '0.5rem', color: '#791d24' }} />
                  <strong>Date:</strong>{' '}
                  {new Date(webinar.scheduledStartTime).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </li>
                <li style={{ marginBottom: '0.65rem' }}>
                  <i className="fas fa-clock" aria-hidden="true" style={{ marginRight: '0.5rem', color: '#791d24' }} />
                  <strong>Time:</strong> {formatScheduleRange(webinar)}
                </li>
                <li style={{ marginBottom: '0.65rem' }}>
                  <i className="fas fa-broadcast-tower" aria-hidden="true" style={{ marginRight: '0.5rem', color: '#791d24' }} />
                  <strong>Format:</strong> Virtual Session ({LIVE_PLATFORMS[webinar.livePlatform] ?? 'Live'})
                </li>
                <li>
                  <i className="fas fa-globe" aria-hidden="true" style={{ marginRight: '0.5rem', color: '#791d24' }} />
                  <strong>Access:</strong> Free Global Registration
                </li>
              </ul>
            </div>

            {resources.length > 0 && (
              <div className="public-webinars__panel">
                <h3 className="serif-font" style={{ fontSize: '1.05rem', margin: '0 0 1rem' }}>
                  <i className="fas fa-file-download" aria-hidden="true" style={{ marginRight: '0.5rem', color: '#791d24' }} />
                  Session Resources
                </h3>
                <ul className="public-webinars__resource-list">
                  {resources.map((resource) => (
                    <li key={`${resource.title}-${resource.url}`}>
                      <a href={resource.url} target="_blank" rel="noreferrer">
                        <i className="fas fa-download" aria-hidden="true" />
                        <span>
                          <strong>{resource.title}</strong>
                          {resource.type && (
                            <small style={{ display: 'block', color: '#64748b', textTransform: 'uppercase' }}>
                              {resource.type}
                            </small>
                          )}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {webinar.status === 'LIVE' && (
              <div className="public-webinars__panel">
                <Link to={ROUTES.PUBLIC_WEBINAR_LIVE(webinar.slug)} className="public-webinars__btn public-webinars__btn--danger" style={{ width: '100%' }}>
                  <i className="fas fa-video" aria-hidden="true" />
                  Open Live Room
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>

      <RsvpModal webinar={webinar} open={rsvpOpen} onClose={() => setRsvpOpen(false)} onSuccess={handleRsvpSuccess} />
    </PublicWebinarLayout>
  );
}

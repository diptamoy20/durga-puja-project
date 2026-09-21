import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PublicWebinarLayout } from '@/components/webinars/PublicWebinarLayout';
import { ROUTES } from '@/constants/routes';
import { publicWebinarService } from '@/services/eventsService';
import type { Webinar } from '@/types/events';
import { resolveLiveEmbedUrl } from '@/utils/webinarHelpers';

import '@/styles/public-webinars.css';

export function PublicWebinarLivePage() {
  const { slug } = useParams<{ slug: string }>();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    publicWebinarService
      .get(slug)
      .then(setWebinar)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unable to load live session.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const embedUrl = webinar ? resolveLiveEmbedUrl(webinar) : null;
  const embedCode = webinar?.liveEmbedCode?.trim();

  return (
    <PublicWebinarLayout brandLabel="Live Broadcast" brandTo={ROUTES.PUBLIC_WEBINARS}>
      <div className="public-webinars__live-shell">
        <div className="public-webinars__live-toolbar">
          <Link
            to={slug ? ROUTES.PUBLIC_WEBINAR_DETAIL(slug) : ROUTES.PUBLIC_WEBINARS}
            className="public-webinars__live-back"
          >
            <i className="fas fa-arrow-left" aria-hidden="true" />
            {webinar ? (
              <>
                <span className="public-webinars__pill public-webinars__badge-live">LIVE</span>
                <span>{webinar.title}</span>
              </>
            ) : (
              'Back to Webinar'
            )}
          </Link>
          {webinar && (
            <Link to={ROUTES.PUBLIC_WEBINAR_DETAIL(webinar.slug)} className="public-webinars__btn public-webinars__btn--light">
              Webinar Info
            </Link>
          )}
        </div>

        <div className="public-webinars__live-room">
          {loading ? (
            <div className="public-webinars__live-state">Loading live stream…</div>
          ) : error || !webinar ? (
            <div className="public-webinars__live-state public-webinars__live-state--error">
              <div>
                <p style={{ marginBottom: '1rem' }}>{error ?? 'Live session not found.'}</p>
                <Link to={ROUTES.PUBLIC_WEBINARS} className="public-webinars__btn public-webinars__btn--warning">
                  Back to Schedule
                </Link>
              </div>
            </div>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${webinar.title} live stream`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : embedCode ? (
            <div className="public-webinars__live-embed-wrap" dangerouslySetInnerHTML={{ __html: embedCode }} />
          ) : (
            <div className="public-webinars__live-state">
              <div>
                <i className="fas fa-broadcast-tower fa-3x public-webinars__live-waiting-icon" aria-hidden="true" />
                <h2 className="serif-font" style={{ margin: '0 0 0.5rem' }}>
                  Stream is Initializing
                </h2>
                <p style={{ margin: '0 0 1.5rem' }}>
                  The live broadcast will appear here once the session begins.
                </p>
                {webinar.liveMeetingUrl && (
                  <a
                    href={webinar.liveMeetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="public-webinars__btn public-webinars__btn--festival"
                  >
                    <i className="fas fa-video" aria-hidden="true" />
                    Join on Zoom / Meet
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicWebinarLayout>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { StaticMap } from '@/components/atlas/StaticMap';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { publicAtlasService } from '@/services/atlasService';
import type { PandalAtlas } from '@/types/atlas';

import '@/styles/public-atlas.css';

declare global {
  interface Window {
    pannellum?: {
      viewer: (id: string, config: Record<string, unknown>) => unknown;
    };
  }
}

export function PublicAtlasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pandal, setPandal] = useState<PandalAtlas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    publicAtlasService
      .get(Number(id))
      .then((p) => {
        setPandal(p);
        setActivePhoto(p.primaryPhotoUrl ?? p.photoUrls?.[0] ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Pandal not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!pandal?.is360Image || !pandal.fullVirtualTourUrl) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.onload = () => {
      window.pannellum?.viewer('pannellum-viewer', {
        type: 'equirectangular',
        panorama: pandal.fullVirtualTourUrl,
        autoLoad: true,
        hfov: 100,
        showZoomCtrl: true,
        showFullscreenCtrl: true,
      });
    };
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
    document.head.appendChild(link);

    return () => {
      script.remove();
      link.remove();
    };
  }, [pandal]);

  if (loading) return <PageLoader />;
  if (error || !pandal) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Pandal not found.'}</Alert>
        <Link to={ROUTES.PUBLIC_ATLAS} className="btn btn--secondary btn--md">Back to Atlas Map</Link>
      </div>
    );
  }

  const photos = pandal.photoUrls?.length ? pandal.photoUrls : [];

  return (
    <div className="public-atlas-page">
      <nav className="public-atlas-nav">
        <Link to={ROUTES.PUBLIC_ATLAS} className="public-atlas-nav__brand">
          <span>🪔</span>
          <span>Durga Puja <span>Atlas</span></span>
        </Link>
        <div className="public-atlas-nav__actions">
          <Link to={ROUTES.PUBLIC_ATLAS} className="btn btn--secondary btn--sm">Interactive Map</Link>
        </div>
      </nav>

      <header
        className="public-atlas-detail-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(86,16,22,0.85), rgba(121,29,36,0.95)), url(${activePhoto ?? '/assets/pandal-placeholder.svg'})`,
        }}
      >
        <div className="public-atlas-detail-hero__inner">
          <span className="public-atlas-detail-hero__badge">Verified & Approved Pandal</span>
          <h1 className="public-atlas-detail-hero__title">{pandal.name}</h1>
          <p className="public-atlas-detail-hero__location">{pandal.location}</p>
          <div className="public-atlas-detail-hero__chips">
            <span className="public-atlas-detail-chip public-atlas-detail-chip--neutral">{pandal.timing}</span>
            {pandal.hasLivestream && (
              <a href="#livestream-section" className="public-atlas-detail-chip public-atlas-detail-chip--live">
                Live Stream
              </a>
            )}
            {pandal.hasVirtualTour && (
              <a href="#virtual-tour-section" className="public-atlas-detail-chip public-atlas-detail-chip--tour">
                360° Tour
              </a>
            )}
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${pandal.latitude},${pandal.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn--primary btn--md"
          >
            Get Directions
          </a>
        </div>
      </header>

      <main className="public-atlas-detail-main">
        <div className="public-atlas-detail-grid">
          <div>
            {photos.length > 0 && (
              <section className="public-atlas-detail-panel">
                <h2>Pandal Photo Gallery</h2>
                {activePhoto && (
                  <img src={activePhoto} alt={pandal.name} className="public-atlas-detail-panel__hero-image" />
                )}
                {photos.length > 1 && (
                  <div className="public-atlas-detail-thumbs">
                    {photos.map((url) => (
                      <button key={url} type="button" onClick={() => setActivePhoto(url)}>
                        <img src={url} alt="Thumbnail" />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {pandal.ritualSchedule && (
              <section className="public-atlas-detail-panel">
                <h2>Ritual & Puja Schedule</h2>
                <pre>{pandal.ritualSchedule}</pre>
              </section>
            )}

            {pandal.hasLivestream && (
              <section id="livestream-section" className="public-atlas-detail-panel public-atlas-detail-panel--live">
                <h2>Official Live Stream</h2>
                {pandal.livestreamEmbedUrl && (
                  <div className="public-atlas-embed">
                    <iframe
                      src={pandal.livestreamEmbedUrl}
                      title="Live stream"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <a href={pandal.livestreamUrl ?? '#'} target="_blank" rel="noreferrer" className="btn btn--danger btn--md">
                  Watch on External Player
                </a>
              </section>
            )}

            {pandal.hasVirtualTour && (
              <section id="virtual-tour-section" className="public-atlas-detail-panel public-atlas-detail-panel--tour">
                <h2>360° Virtual Walkthrough</h2>
                {pandal.is360Image ? (
                  <div id="pannellum-viewer" style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }} />
                ) : pandal.virtualTourEmbedUrl ? (
                  <div className="public-atlas-embed">
                    <iframe
                      src={pandal.virtualTourEmbedUrl}
                      title="Virtual tour"
                      allow="fullscreen; accelerometer; gyroscope; magnetometer; vr"
                      allowFullScreen
                    />
                  </div>
                ) : null}
                <a
                  href={pandal.fullVirtualTourUrl ?? pandal.virtualTourUrl ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--secondary btn--md"
                >
                  Launch Full-Screen 360° Tour
                </a>
              </section>
            )}
          </div>

          <div>
            <section className="public-atlas-detail-panel">
              <h3>Location & Directions</h3>
              <p className="public-atlas-detail-sidebar-text">{pandal.location}</p>
              <StaticMap latitude={pandal.latitude} longitude={pandal.longitude} label={pandal.name} height={280} />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pandal.latitude},${pandal.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn--secondary btn--sm"
                style={{ marginTop: 12 }}
              >
                Open in Google Maps
              </a>
            </section>

            <section className="public-atlas-detail-panel">
              <h3>Visiting Hours</h3>
              <p style={{ fontWeight: 700, margin: 0 }}>{pandal.timing}</p>
              <p className="public-atlas-detail-sidebar-note">Timings may vary on Ashtami and Navami nights.</p>
              <Link to={ROUTES.PUBLIC_ATLAS} className="btn btn--primary btn--md" style={{ marginTop: 16 }}>
                Return to Interactive Atlas Map
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

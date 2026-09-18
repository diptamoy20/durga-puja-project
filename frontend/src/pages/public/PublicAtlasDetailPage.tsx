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
        style={{
          background: `linear-gradient(rgba(86,16,22,0.85), rgba(121,29,36,0.95)), url(${activePhoto ?? '/assets/pandal-placeholder.svg'}) center/cover`,
          color: '#fff',
          padding: '60px 24px 40px',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', marginBottom: 12, padding: '4px 12px', borderRadius: 20, border: '1px solid #c88937', color: '#ffd700' }}>
            Verified & Approved Pandal
          </span>
          <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>{pandal.name}</h1>
          <p style={{ margin: '0 0 16px', opacity: 0.9 }}>{pandal.location}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ background: '#fff', color: '#111', borderRadius: 999, padding: '6px 12px' }}>{pandal.timing}</span>
            {pandal.hasLivestream && <a href="#livestream-section" style={{ background: '#dc2626', color: '#fff', borderRadius: 999, padding: '6px 12px', textDecoration: 'none' }}>Live Stream</a>}
            {pandal.hasVirtualTour && <a href="#virtual-tour-section" style={{ background: '#0284c7', color: '#fff', borderRadius: 999, padding: '6px 12px', textDecoration: 'none' }}>360° Tour</a>}
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

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)', gap: 24 }}>
          <div>
            {photos.length > 0 && (
              <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #edf2f7' }}>
                <h2 style={{ marginTop: 0 }}>Pandal Photo Gallery</h2>
                {activePhoto && (
                  <img src={activePhoto} alt={pandal.name} style={{ width: '100%', height: 420, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
                )}
                {photos.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                    {photos.map((url) => (
                      <button key={url} type="button" onClick={() => setActivePhoto(url)} style={{ border: 0, padding: 0, cursor: 'pointer' }}>
                        <img src={url} alt="Thumbnail" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {pandal.ritualSchedule && (
              <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #edf2f7' }}>
                <h2 style={{ marginTop: 0 }}>Ritual & Puja Schedule</h2>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.8 }}>{pandal.ritualSchedule}</pre>
              </section>
            )}

            {pandal.hasLivestream && (
              <section id="livestream-section" style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #fecaca' }}>
                <h2 style={{ marginTop: 0 }}>Official Live Stream</h2>
                {pandal.livestreamEmbedUrl && (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12, marginBottom: 12 }}>
                    <iframe
                      src={pandal.livestreamEmbedUrl}
                      title="Live stream"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                    />
                  </div>
                )}
                <a href={pandal.livestreamUrl ?? '#'} target="_blank" rel="noreferrer" className="btn btn--danger btn--md">
                  Watch on External Player
                </a>
              </section>
            )}

            {pandal.hasVirtualTour && (
              <section id="virtual-tour-section" style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #bae6fd' }}>
                <h2 style={{ marginTop: 0 }}>360° Virtual Walkthrough</h2>
                {pandal.is360Image ? (
                  <div id="pannellum-viewer" style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }} />
                ) : pandal.virtualTourEmbedUrl ? (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12, marginBottom: 12 }}>
                    <iframe
                      src={pandal.virtualTourEmbedUrl}
                      title="Virtual tour"
                      allow="fullscreen; accelerometer; gyroscope; magnetometer; vr"
                      allowFullScreen
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
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
            <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #edf2f7' }}>
              <h3 style={{ marginTop: 0 }}>Location & Directions</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{pandal.location}</p>
              <StaticMap latitude={pandal.latitude} longitude={pandal.longitude} label={pandal.name} height={280} />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pandal.latitude},${pandal.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn--secondary btn--sm"
                style={{ width: '100%', marginTop: 12 }}
              >
                Open in Google Maps
              </a>
            </section>

            <section style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #edf2f7' }}>
              <h3 style={{ marginTop: 0 }}>Visiting Hours</h3>
              <p style={{ fontWeight: 700, margin: 0 }}>{pandal.timing}</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Timings may vary on Ashtami and Navami nights.</p>
              <Link to={ROUTES.PUBLIC_ATLAS} className="btn btn--primary btn--md" style={{ width: '100%', marginTop: 16 }}>
                Return to Interactive Atlas Map
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

import { ROUTES } from '@/constants/routes';
import { publicAtlasService } from '@/services/atlasService';
import type { AtlasFilterChip, PandalAtlas } from '@/types/atlas';

import '@/styles/public-atlas.css';

function createPinIcon() {
  return L.divIcon({
    className: 'custom-pin-wrapper',
    html: '<div class="custom-pin"><span class="custom-pin-inner">🪔</span></div>',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

export function PublicAtlasPage() {
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markerMapRef = useRef<Record<number, L.Marker>>({});
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [pandals, setPandals] = useState<PandalAtlas[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AtlasFilterChip>('all');
  const [selected, setSelected] = useState<PandalAtlas | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    publicAtlasService
      .list()
      .then(setPandals)
      .catch(() => {})
      .finally(() => setLoading(false));

    publicAtlasService
      .mapData()
      .then((res) => {
        if (res.data?.length) setPandals(res.data);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pandals.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'live' && p.hasLivestream) ||
        (filter === 'tour' && p.hasVirtualTour);
      return matchesQuery && matchesFilter;
    });
  }, [pandals, search, filter]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([22.572646, 88.363895], 12);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO &copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 40 });
    map.addLayer(cluster);

    mapRef.current = map;
    clusterRef.current = cluster;

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      markerMapRef.current = {};
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!map || !cluster) return;

    cluster.clearLayers();
    markerMapRef.current = {};
    const bounds: L.LatLngExpression[] = [];

    filtered.forEach((p) => {
      const marker = L.marker([p.latitude, p.longitude], {
        icon: createPinIcon(),
        title: p.name,
      });

      marker.bindPopup(
        `<div style="min-width:200px"><strong>${p.name}</strong><br/><small>${p.location}</small><br/><button type="button" id="popup-${p.id}" style="margin-top:8px;padding:4px 8px;background:#791d24;color:#fff;border:0;border-radius:4px;cursor:pointer">View Details →</button></div>`,
      );

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-${p.id}`);
        btn?.addEventListener('click', () => setSelected(p), { once: true });
      });

      marker.on('click', () => setSelected(p));
      cluster.addLayer(marker);
      markerMapRef.current[p.id] = marker;
      bounds.push([p.latitude, p.longitude]);
    });

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 15 });
    }
  }, [filtered]);

  const openOnMap = (pandal: PandalAtlas) => {
    setSelected(pandal);
    setMobileOpen(true);
    const map = mapRef.current;
    const marker = markerMapRef.current[pandal.id];
    map?.setView([pandal.latitude, pandal.longitude], 15);
    if (marker && clusterRef.current) {
      clusterRef.current.zoomToShowLayer(marker, () => marker.openPopup());
    }
  };

  return (
    <div className="public-atlas-page">
      <nav className="public-atlas-nav">
        <Link to={ROUTES.PUBLIC_ATLAS} className="public-atlas-nav__brand">
          <span>🪔</span>
          <span>Durga Puja <span>Atlas</span></span>
        </Link>
        <div className="public-atlas-nav__actions">
          <Link to={ROUTES.LOGIN} className="btn btn--secondary btn--sm">Login</Link>
        </div>
      </nav>

      <div className="public-atlas-container">
        <aside className={`public-atlas-sidebar ${mobileOpen ? 'is-mobile-open' : ''}`}>
          <div
            className="public-atlas-sidebar__header"
            onClick={() => setMobileOpen((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setMobileOpen((v) => !v);
            }}
            role="button"
            tabIndex={0}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Pandal Directory</h2>
              <span className="status-badge status-badge--danger">{filtered.length} Pandals</span>
            </div>
            <input
              type="search"
              className="field__control"
              placeholder="Search by name, street, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' }}>
              {(['all', 'live', 'tour'] as AtlasFilterChip[]).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`public-atlas-chip ${filter === chip ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter(chip);
                  }}
                >
                  {chip === 'all' ? 'All' : chip === 'live' ? 'Livestream' : '360° Tour'}
                </button>
              ))}
            </div>
          </div>

          <div className="public-atlas-sidebar__list">
            {loading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Loading atlas data…</p>
            ) : filtered.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>No pandals match your search.</p>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  className={`public-atlas-card ${selected?.id === p.id ? 'is-active' : ''}`}
                  onClick={() => openOnMap(p)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') openOnMap(p);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="public-atlas-card__row">
                    <img
                      src={p.primaryPhotoUrl ?? '/assets/pandal-placeholder.svg'}
                      alt={p.name}
                      className="public-atlas-card__thumb"
                    />
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>{p.name}</h3>
                      <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#64748b' }}>{p.location}</p>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.7rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 999, padding: '2px 8px' }}>
                          {p.timing.slice(0, 24)}
                        </span>
                        {p.hasLivestream && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 999, padding: '2px 8px' }}>Live</span>}
                        {p.hasVirtualTour && <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', borderRadius: 999, padding: '2px 8px' }}>360°</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <div ref={mapContainerRef} className="public-atlas-map" />

        <div className={`public-atlas-drawer ${selected ? 'is-open' : ''}`}>
          {selected && (
            <>
              <div className="public-atlas-drawer__header">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{selected.name}</h3>
                    <small style={{ opacity: 0.85 }}>{selected.location}</small>
                  </div>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => setSelected(null)} aria-label="Close">
                    ✕
                  </button>
                </div>
              </div>
              <div className="public-atlas-drawer__body">
                {(selected.photoUrls?.length ?? 0) > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Photo Gallery</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
                      {selected.photoUrls!.map((url, i) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Visiting Hours</div>
                  <div style={{ fontWeight: 600 }}>{selected.timing}</div>
                </div>

                {selected.ritualSchedule && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Ritual Schedule</div>
                    <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.85rem' }}>{selected.ritualSchedule}</pre>
                  </div>
                )}

                {selected.hasLivestream && selected.livestreamUrl && (
                  <a href={selected.livestreamUrl} target="_blank" rel="noreferrer" className="btn btn--danger btn--sm" style={{ width: '100%', marginBottom: 8 }}>
                    Watch Live Stream
                  </a>
                )}

                {selected.hasVirtualTour && (
                  <a
                    href={selected.fullVirtualTourUrl ?? selected.virtualTourUrl ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn--secondary btn--sm"
                    style={{ width: '100%', marginBottom: 8 }}
                  >
                    Launch 360° Virtual Tour
                  </a>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--secondary btn--sm"
                  style={{ width: '100%', marginBottom: 8 }}
                >
                  Get Directions
                </a>

                <Link to={ROUTES.PUBLIC_ATLAS_DETAIL(selected.id)} className="btn btn--primary btn--sm" style={{ width: '100%' }}>
                  Open Full Pandal Page
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
            <div className="public-atlas-sidebar__title-row">
              <h2 className="public-atlas-sidebar__title">Pandal Directory</h2>
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
            <div className="public-atlas-sidebar__filters">
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
              <p className="public-atlas-sidebar__empty">Loading atlas data…</p>
            ) : filtered.length === 0 ? (
              <p className="public-atlas-sidebar__empty">No pandals match your search.</p>
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
                    <div className="public-atlas-card__content">
                      <h3 className="public-atlas-card__name">{p.name}</h3>
                      <p className="public-atlas-card__location">{p.location}</p>
                      <div className="public-atlas-card__badges">
                        <span className="public-atlas-badge public-atlas-badge--timing">
                          {p.timing.slice(0, 24)}
                        </span>
                        {p.hasLivestream && (
                          <span className="public-atlas-badge public-atlas-badge--live">Live</span>
                        )}
                        {p.hasVirtualTour && (
                          <span className="public-atlas-badge public-atlas-badge--tour">360°</span>
                        )}
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
                <div className="public-atlas-drawer__title-row">
                  <div>
                    <h3 className="public-atlas-drawer__title">{selected.name}</h3>
                    <small className="public-atlas-drawer__location">{selected.location}</small>
                  </div>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => setSelected(null)} aria-label="Close">
                    ✕
                  </button>
                </div>
              </div>
              <div className="public-atlas-drawer__body">
                {(selected.photoUrls?.length ?? 0) > 0 && (
                  <div className="public-atlas-drawer__section">
                    <strong className="public-atlas-drawer__section-label">Photo Gallery</strong>
                    <div className="public-atlas-drawer__gallery">
                      {selected.photoUrls!.map((url, i) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt={`Photo ${i + 1}`} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="public-atlas-info-box">
                  <div className="public-atlas-info-box__label">Visiting Hours</div>
                  <div className="public-atlas-info-box__value">{selected.timing}</div>
                </div>

                {selected.ritualSchedule && (
                  <div className="public-atlas-info-box">
                    <div className="public-atlas-info-box__label">Ritual Schedule</div>
                    <pre>{selected.ritualSchedule}</pre>
                  </div>
                )}

                <div className="public-atlas-drawer__actions">
                  {selected.hasLivestream && selected.livestreamUrl && (
                    <a href={selected.livestreamUrl} target="_blank" rel="noreferrer" className="btn btn--danger btn--sm">
                      Watch Live Stream
                    </a>
                  )}

                  {selected.hasVirtualTour && (
                    <a
                      href={selected.fullVirtualTourUrl ?? selected.virtualTourUrl ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--secondary btn--sm"
                    >
                      Launch 360° Virtual Tour
                    </a>
                  )}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn--secondary btn--sm"
                  >
                    Get Directions
                  </a>

                  <Link to={ROUTES.PUBLIC_ATLAS_DETAIL(selected.id)} className="btn btn--primary btn--sm">
                    Open Full Pandal Page
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

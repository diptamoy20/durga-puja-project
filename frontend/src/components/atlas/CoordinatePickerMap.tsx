import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CoordinatePickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  height?: number;
  zoom?: number;
}

export function CoordinatePickerMap({
  latitude,
  longitude,
  onChange,
  height = 320,
  zoom = 13,
}: CoordinatePickerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([latitude, longitude], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
    marker.bindPopup('Pandal Location Pin').openPopup();

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChangeRef.current(Number(pos.lat.toFixed(7)), Number(pos.lng.toFixed(7)));
    });

    map.on('click', (event: any) => {
      marker.setLatLng(event.latlng);
      onChangeRef.current(
        Number(event.latlng.lat.toFixed(7)),
        Number(event.latlng.lng.toFixed(7)),
      );
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [zoom]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current.panTo([latitude, longitude]);
  }, [latitude, longitude]);

  const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current || !markerRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(7));
        const lng = Number(pos.coords.longitude.toFixed(7));
        markerRef.current?.setLatLng([lat, lng]);
        mapRef.current?.setView([lat, lng], 15);
        onChangeRef.current(lat, lng);
      },
      (err) => {
        alert(`Unable to retrieve your location: ${err.message}`);
      },
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-150)' }}>
        <button type="button" className="btn btn--secondary btn--sm" onClick={handleLocate}>
          <i className="fas fa-crosshairs" aria-hidden="true" /> Locate Me
        </button>
      </div>
      <div
        ref={containerRef}
        style={{ height, width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
      />
    </div>
  );
}

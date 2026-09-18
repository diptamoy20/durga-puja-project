import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StaticMapProps {
  latitude: number;
  longitude: number;
  label?: string;
  height?: number;
  zoom?: number;
}

export function StaticMap({ latitude, longitude, label, height = 280, zoom = 15 }: StaticMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false }).setView([latitude, longitude], zoom);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO &copy; OpenStreetMap',
    }).addTo(map);
    const marker = L.marker([latitude, longitude]).addTo(map);
    if (label) marker.bindPopup(label).openPopup();
    return () => {
      map.remove();
    };
  }, [latitude, longitude, label, zoom]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
    />
  );
}

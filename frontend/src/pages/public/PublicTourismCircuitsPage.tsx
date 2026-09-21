import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { publicTourismService } from "@/services/tourismService";
import type { TourismCircuit } from "@/types/tourism";
import "@/styles/public-tourism.css";

export function PublicTourismCircuitsPage() {
  const [circuits, setCircuits] = useState<TourismCircuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState("");

  useEffect(() => {
    publicTourismService.circuits.list()
      .then(setCircuits)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const regions = Array.from(new Set(circuits.map((c) => c.region))).sort();
  const filtered = regionFilter ? circuits.filter((c) => c.region === regionFilter) : circuits;

  return (
    <div className="public-tourism-list">
      <Link to={ROUTES.PUBLIC_TOURISM_CONCIERGE} className="public-tourism-list__back">Back to Tourism Concierge</Link>
      <div className="public-tourism-list__header">
        <h1 className="public-tourism-list__title">Pilgrimage Circuits</h1>
        <p className="public-tourism-list__subtitle">Curated routes through the best Durga Puja pandals across Kolkata and West Bengal.</p>
      </div>
      <div className="public-tourism-list__filters">
        <div className="public-tourism-list__filter-group">
          <label>Filter by Region</label>
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
            <option value="">All Regions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="public-tourism__loading">Loading circuits...</div>
      ) : (
        <div className="public-tourism__card-grid">
          {filtered.map((circuit) => (
            <Link key={circuit.id} to={ROUTES.PUBLIC_TOURISM_CIRCUIT_DETAIL(circuit.slug)} className="public-tourism__circuit-card">
              {circuit.coverImageUrl && (
                <div className="public-tourism__circuit-card-image"><img src={circuit.coverImageUrl} alt={circuit.name} loading="lazy" /></div>
              )}
              <div className="public-tourism__circuit-card-content">
                <div className="public-tourism__circuit-card-meta">
                  <span className="public-tourism__tag public-tourism__tag--region">{circuit.region}</span>
                  <span className="public-tourism__tag public-tourism__tag--duration">{circuit.duration}</span>
                </div>
                <h3 className="public-tourism__circuit-card-title">{circuit.name}</h3>
                <p className="public-tourism__circuit-card-desc">{circuit.description.slice(0, 120)}...</p>
                <div className="public-tourism__circuit-card-highlights">
                  {circuit.highlightPandals.slice(0, 3).map((p, i) => <span key={i} className="public-tourism__highlight-tag">{p.name}</span>)}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="public-tourism__empty"><p>No circuits found for the selected filter.</p></div>}
        </div>
      )}
    </div>
  );
}

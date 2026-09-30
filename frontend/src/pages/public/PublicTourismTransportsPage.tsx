import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { publicTourismService } from "@/services/tourismService";
import type { TourismTransport } from "@/types/tourism";
import "@/styles/public-tourism.css";

export function PublicTourismTransportsPage() {
  const [transports, setTransports] = useState<TourismTransport[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    publicTourismService.transports.list()
      .then(setTransports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(transports.map((t) => t.category))).sort();
  const filtered = categoryFilter ? transports.filter((t) => t.category === categoryFilter) : transports;

  return (
    <div className="public-tourism-list">
      <Link to={ROUTES.PUBLIC_TOURISM_CONCIERGE} className="public-tourism-list__back">Back to Tourism Concierge</Link>
      <div className="public-tourism-list__header">
        <h1 className="public-tourism-list__title">Transport Guide</h1>
        <p className="public-tourism-list__subtitle">Everything you need to know about getting around during Durga Puja - buses, metros, taxis and more.</p>
      </div>
      <div className="public-tourism-list__filters">
        <div className="public-tourism-list__filter-group">
          <label>Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="public-tourism__loading">Loading transport info...</div>
      ) : (
        <div className="public-tourism__card-grid">
          {filtered.map((transport) => (
            <div key={transport.id} className="public-tourism__transport-card">
              <h3 className="public-tourism__transport-name">{transport.name}</h3>
              <span className="public-tourism__transport-category">{transport.category}</span>
              <div className="public-tourism__transport-details">
                {transport.routeDescription && <p style={{ margin: "0 0 var(--space-2)" }}>{transport.routeDescription}</p>}
                {transport.operatingHours && <p style={{ margin: "0 0 var(--space-2)" }}><strong>Hours:</strong> {transport.operatingHours}</p>}
                {transport.fareGuide && <p style={{ margin: "0 0 var(--space-2)" }}><strong>Fare:</strong> {transport.fareGuide}</p>}
                {transport.bookingOrHelpline && <p style={{ margin: "0" }}><strong>Contact:</strong> {transport.bookingOrHelpline}</p>}
              </div>
              {transport.tips.length > 0 && (
                <ul className="public-tourism__transport-tips">
                  {transport.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div className="public-tourism__empty"><p>No transport information found.</p></div>}
        </div>
      )}
    </div>
  );
}

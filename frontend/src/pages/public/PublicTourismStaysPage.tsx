import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { publicTourismService } from "@/services/tourismService";
import type { TourismStay } from "@/types/tourism";
import "@/styles/public-tourism.css";

export function PublicTourismStaysPage() {
  const [stays, setStays] = useState<TourismStay[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [wbtdcOnly, setWbtdcOnly] = useState(false);

  useEffect(() => {
    publicTourismService.stays.list()
      .then(setStays)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const types = Array.from(new Set(stays.map((s) => s.type))).sort();
  const budgetTiers = Array.from(new Set(stays.map((s) => s.budgetTier))).sort();

  const filtered = stays.filter((s) => {
    if (typeFilter && s.type !== typeFilter) return false;
    if (budgetFilter && s.budgetTier !== budgetFilter) return false;
    if (wbtdcOnly && !s.isWbtdc) return false;
    return true;
  });

  return (
    <div className="public-tourism-list">
      <Link to={ROUTES.PUBLIC_TOURISM_CONCIERGE} className="public-tourism-list__back">Back to Tourism Concierge</Link>
      <div className="public-tourism-list__header">
        <h1 className="public-tourism-list__title">Verified Stays</h1>
        <p className="public-tourism-list__subtitle">WBTDC properties, hotels, and homestays verified for Durga Puja visitors.</p>
      </div>
      <div className="public-tourism-list__filters">
        <div className="public-tourism-list__filter-group">
          <label>Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="public-tourism-list__filter-group">
          <label>Budget</label>
          <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
            <option value="">All Budgets</option>
            {budgetTiers.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="public-tourism-list__filter-group" style={{ justifyContent: "flex-end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>
            <input type="checkbox" checked={wbtdcOnly} onChange={(e) => setWbtdcOnly(e.target.checked)} />
            WBTDC Only
          </label>
        </div>
      </div>
      {loading ? (
        <div className="public-tourism__loading">Loading stays...</div>
      ) : (
        <div className="public-tourism__card-grid">
          {filtered.map((stay) => (
            <div key={stay.id} className="public-tourism__stay-card">
              {stay.coverImageUrl && (
                <div style={{ height: "160px", overflow: "hidden", borderRadius: "var(--radius-md)", marginBottom: "var(--space-3)" }}>
                  <img src={stay.coverImageUrl} alt={stay.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div className="public-tourism__stay-card-header">
                <h3 className="public-tourism__stay-card-name">{stay.name}</h3>
                {stay.isWbtdc && <span className="public-tourism__wbtdc-badge">WBTDC</span>}
              </div>
              <div className="public-tourism__stay-card-meta">
                <span className="public-tourism__tag public-tourism__tag--region">{stay.type}</span>
                <span className="public-tourism__tag public-tourism__tag--duration">{stay.city}</span>
                {stay.starRating && <span className="public-tourism__tag public-tourism__tag--days">{"*".repeat(stay.starRating)}</span>}
              </div>
              {stay.description && <p style={{ fontSize: "0.85rem", color: "var(--colour-ink-soft)", margin: "0 0 var(--space-3)", lineHeight: "1.5" }}>{stay.description.slice(0, 100)}...</p>}
              <div className="public-tourism__stay-card-footer">
                <span className="public-tourism__price">{stay.priceRange}</span>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  {stay.contactPhone && <a href={`tel:${stay.contactPhone}`} className="btn btn--outline btn--sm">Call</a>}
                  {stay.bookingUrl && <a href={stay.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm">Book</a>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="public-tourism__empty"><p>No stays found for the selected filters.</p></div>}
        </div>
      )}
    </div>
  );
}

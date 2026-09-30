import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { publicTourismService } from "@/services/tourismService";
import type { TourismCircuit } from "@/types/tourism";
import "@/styles/public-tourism.css";

export function PublicTourismCircuitDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [circuit, setCircuit] = useState<TourismCircuit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    publicTourismService.circuits.get(slug)
      .then(setCircuit)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="public-tourism__loading">Loading circuit...</div>;
  if (error || !circuit) return (
    <div className="public-tourism__error">
      <p>Circuit not found.</p>
      <Link to={ROUTES.PUBLIC_TOURISM_CIRCUITS} className="btn btn--outline">Back to Circuits</Link>
    </div>
  );

  return (
    <div className="public-tourism-detail">
      <Link to={ROUTES.PUBLIC_TOURISM_CIRCUITS} className="public-tourism-list__back">All Circuits</Link>
      {circuit.coverImageUrl ? (
        <div className="public-tourism-detail__hero">
          <img src={circuit.coverImageUrl} alt={circuit.name} />
          <div className="public-tourism-detail__hero-overlay">
            <h1 className="public-tourism-detail__hero-title">{circuit.name}</h1>
          </div>
        </div>
      ) : (
        <h1 style={{ margin: "0 0 var(--space-4)", fontSize: "2rem", fontWeight: "800" }}>{circuit.name}</h1>
      )}
      <div className="public-tourism-detail__body">
        <div className="public-tourism-detail__content">
          <p className="public-tourism-detail__section-label">About this circuit</p>
          <p className="public-tourism-detail__desc">{circuit.description}</p>
          {circuit.highlightPandals.length > 0 && (
            <>
              <p className="public-tourism-detail__section-label">Highlight Pandals</p>
              <div className="public-tourism-detail__pandals">
                {circuit.highlightPandals.map((pandal, i) => (
                  <div key={i} className="public-tourism-detail__pandal">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ margin: 0 }}>{pandal.name}</h4>
                      <Link to={ROUTES.PUBLIC_ATLAS} className="btn btn--outline btn--sm" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                        📍 View on Pandal Atlas
                      </Link>
                    </div>
                    <p style={{ marginTop: '4px' }}>{pandal.location}</p>
                    {pandal.highlight && <p style={{ marginTop: "var(--space-1)", fontStyle: "italic" }}>{pandal.highlight}</p>}
                    {pandal.timing && <p style={{ fontSize: "0.8rem", color: "var(--colour-ink-faint)", marginTop: "var(--space-1)" }}>Timing: {pandal.timing}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
          {circuit.tags.length > 0 && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <p className="public-tourism-detail__section-label">Tags</p>
              <div className="public-tourism__circuit-card-highlights">
                {circuit.tags.map((tag, i) => <span key={i} className="public-tourism__highlight-tag">{tag}</span>)}
              </div>
            </div>
          )}
        </div>
        <div className="public-tourism-detail__sidebar">
          <p className="public-tourism-detail__section-label">Circuit Details</p>
          <ul className="public-tourism-detail__meta-list">
            <li className="public-tourism-detail__meta-item"><strong>Region</strong><span>{circuit.region}</span></li>
            <li className="public-tourism-detail__meta-item"><strong>Duration</strong><span>{circuit.duration}</span></li>
            {circuit.bestTimeOfDay && <li className="public-tourism-detail__meta-item"><strong>Best Time</strong><span>{circuit.bestTimeOfDay}</span></li>}
            {circuit.recommendedTransport && <li className="public-tourism-detail__meta-item"><strong>Transport</strong><span>{circuit.recommendedTransport}</span></li>}
            {circuit.crowdLevel && <li className="public-tourism-detail__meta-item"><strong>Crowd Level</strong><span>{circuit.crowdLevel}</span></li>}
            <li className="public-tourism-detail__meta-item"><strong>Pandals</strong><span>{circuit.highlightPandals.length} stops</span></li>
          </ul>
          <div style={{ marginTop: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Link to={ROUTES.PUBLIC_TRIP_PLANNER} className="btn btn--primary" style={{ textAlign: "center" }}>Plan Your Trip</Link>
            <Link to={ROUTES.PUBLIC_TOURISM_ENQUIRY} className="btn btn--outline" style={{ textAlign: "center" }}>Get Help</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

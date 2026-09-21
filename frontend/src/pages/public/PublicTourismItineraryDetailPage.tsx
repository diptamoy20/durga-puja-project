import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { publicTourismService } from "@/services/tourismService";
import type { TourismItinerary } from "@/types/tourism";
import "@/styles/public-tourism.css";

export function PublicTourismItineraryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [itinerary, setItinerary] = useState<TourismItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    publicTourismService.itineraries.get(slug)
      .then(setItinerary)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="public-tourism__loading">Loading itinerary...</div>;
  if (error || !itinerary) return (
    <div className="public-tourism__error">
      <p>Itinerary not found.</p>
      <Link to={ROUTES.PUBLIC_TOURISM_ITINERARIES} className="btn btn--outline">Back to Itineraries</Link>
    </div>
  );

  return (
    <div className="public-tourism-detail">
      <Link to={ROUTES.PUBLIC_TOURISM_ITINERARIES} className="public-tourism-list__back">All Itineraries</Link>
      {itinerary.coverImageUrl ? (
        <div className="public-tourism-detail__hero">
          <img src={itinerary.coverImageUrl} alt={itinerary.title} />
          <div className="public-tourism-detail__hero-overlay">
            <h1 className="public-tourism-detail__hero-title">{itinerary.title}</h1>
          </div>
        </div>
      ) : (
        <h1 style={{ margin: "0 0 var(--space-4)", fontSize: "2rem", fontWeight: "800" }}>{itinerary.title}</h1>
      )}
      <div className="public-tourism-detail__body">
        <div className="public-tourism-detail__content">
          <p className="public-tourism-detail__section-label">Overview</p>
          <p className="public-tourism-detail__desc">{itinerary.overview}</p>
          {itinerary.includedHighlights.length > 0 && (
            <div style={{ marginBottom: "var(--space-5)" }}>
              <p className="public-tourism-detail__section-label">What is Included</p>
              <ul style={{ margin: "0", paddingLeft: "var(--space-4)", color: "var(--colour-ink-soft)", fontSize: "0.9rem", lineHeight: "1.8" }}>
                {itinerary.includedHighlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          )}
          <p className="public-tourism-detail__section-label">Day-by-Day Plan</p>
          {itinerary.dayPlans.map((day) => (
            <div key={day.day} className="public-tourism__day-plan">
              <div className="public-tourism__day-plan-header">
                <span className="public-tourism__day-badge">Day {day.day}</span>
                <h3 className="public-tourism__day-plan-title">{day.title}</h3>
              </div>
              <div className="public-tourism__day-plan-body">
                {day.morning && <div className="public-tourism__day-slot"><span className="public-tourism__day-slot-label">Morning</span><span className="public-tourism__day-slot-text">{day.morning}</span></div>}
                {day.afternoon && <div className="public-tourism__day-slot"><span className="public-tourism__day-slot-label">Afternoon</span><span className="public-tourism__day-slot-text">{day.afternoon}</span></div>}
                {day.evening && <div className="public-tourism__day-slot"><span className="public-tourism__day-slot-label">Evening</span><span className="public-tourism__day-slot-text">{day.evening}</span></div>}
                {day.night && <div className="public-tourism__day-slot"><span className="public-tourism__day-slot-label">Night</span><span className="public-tourism__day-slot-text">{day.night}</span></div>}
              </div>
              {(day.foodHighlights || day.transportTip) && (
                <div style={{ padding: "0 var(--space-4) var(--space-4)", display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
                  {day.foodHighlights && <div><span className="public-tourism__day-slot-label">Food</span><p style={{ margin: "var(--space-1) 0 0", fontSize: "0.85rem", color: "var(--colour-ink-soft)" }}>{day.foodHighlights}</p></div>}
                  {day.transportTip && <div><span className="public-tourism__day-slot-label">Transport Tip</span><p style={{ margin: "var(--space-1) 0 0", fontSize: "0.85rem", color: "var(--colour-ink-soft)" }}>{day.transportTip}</p></div>}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="public-tourism-detail__sidebar">
          <p className="public-tourism-detail__section-label">Itinerary Details</p>
          <ul className="public-tourism-detail__meta-list">
            <li className="public-tourism-detail__meta-item"><strong>Duration</strong><span>{itinerary.durationDays} Days</span></li>
            <li className="public-tourism-detail__meta-item"><strong>Best For</strong><span>{itinerary.targetAudience}</span></li>
            <li className="public-tourism-detail__meta-item"><strong>Curated</strong><span>{itinerary.isCurated ? "Yes" : "No"}</span></li>
          </ul>
          <div style={{ marginTop: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Link to={ROUTES.PUBLIC_TRIP_PLANNER} className="btn btn--primary" style={{ textAlign: "center" }}>Customise Your Trip</Link>
            <Link to={ROUTES.PUBLIC_TOURISM_ENQUIRY} className="btn btn--outline" style={{ textAlign: "center" }}>Talk to an Expert</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

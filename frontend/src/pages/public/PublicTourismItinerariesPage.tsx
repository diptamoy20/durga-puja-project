import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { publicTourismService } from "@/services/tourismService";
import type { TourismItinerary } from "@/types/tourism";
import "@/styles/public-tourism.css";

export function PublicTourismItinerariesPage() {
  const [itineraries, setItineraries] = useState<TourismItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [audienceFilter, setAudienceFilter] = useState("");

  useEffect(() => {
    publicTourismService.itineraries.list()
      .then(setItineraries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const audiences = Array.from(new Set(itineraries.map((i) => i.targetAudience))).sort();
  const filtered = audienceFilter ? itineraries.filter((i) => i.targetAudience === audienceFilter) : itineraries;

  return (
    <div className="public-tourism-list">
      <Link to={ROUTES.PUBLIC_TOURISM_CONCIERGE} className="public-tourism-list__back">Back to Tourism Concierge</Link>
      <div className="public-tourism-list__header">
        <h1 className="public-tourism-list__title">Curated Itineraries</h1>
        <p className="public-tourism-list__subtitle">Day-by-day plans crafted by our tourism experts for every type of traveller.</p>
      </div>
      <div className="public-tourism-list__filters">
        <div className="public-tourism-list__filter-group">
          <label>Filter by Audience</label>
          <select value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value)}>
            <option value="">All Travellers</option>
            {audiences.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="public-tourism__loading">Loading itineraries...</div>
      ) : (
        <div className="public-tourism__card-grid public-tourism__card-grid--itinerary">
          {filtered.map((item) => (
            <Link key={item.id} to={ROUTES.PUBLIC_TOURISM_ITINERARY_DETAIL(item.slug)} className="public-tourism__itinerary-card">
              {item.coverImageUrl && (
                <div className="public-tourism__itinerary-card-image"><img src={item.coverImageUrl} alt={item.title} loading="lazy" /></div>
              )}
              <div className="public-tourism__itinerary-card-content">
                <div className="public-tourism__itinerary-card-meta">
                  <span className="public-tourism__tag public-tourism__tag--days">{item.durationDays} Days</span>
                  <span className="public-tourism__tag public-tourism__tag--audience">{item.targetAudience}</span>
                </div>
                <h3 className="public-tourism__itinerary-card-title">{item.title}</h3>
                <p className="public-tourism__itinerary-card-desc">{item.overview.slice(0, 120)}...</p>
                <ul className="public-tourism__itinerary-card-highlights">
                  {item.includedHighlights.slice(0, 3).map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="public-tourism__empty"><p>No itineraries found.</p></div>}
        </div>
      )}
    </div>
  );
}

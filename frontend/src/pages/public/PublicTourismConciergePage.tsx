import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { publicTourismService } from '@/services/tourismService';
import { TourismChatbot } from '@/components/tourism/TourismChatbot';
import type { TourismCircuit, TourismItinerary, TourismStay, TourismTransport, TourismKnowledge } from '@/types/tourism';

import '@/styles/public-tourism.css';

interface FeaturedContent {
  circuits: TourismCircuit[];
  itineraries: TourismItinerary[];
  stays: TourismStay[];
  transports: TourismTransport[];
  knowledge: TourismKnowledge[];
}

export function PublicTourismConciergePage() {
  const [featured, setFeatured] = useState<FeaturedContent>({
    circuits: [],
    itineraries: [],
    stays: [],
    transports: [],
    knowledge: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const [circuits, itineraries, stays, transports, knowledge] = await Promise.all([
          publicTourismService.circuits.featured().catch(() => []),
          publicTourismService.itineraries.curated().catch(() => []),
          publicTourismService.stays.featured().catch(() => []),
          publicTourismService.transports.list().catch(() => []),
          publicTourismService.knowledge.list().catch(() => []),
        ]);
        setFeatured({
          circuits: circuits.slice(0, 4),
          itineraries: itineraries.slice(0, 3),
          stays: stays.slice(0, 4),
          transports: transports.slice(0, 4),
          knowledge: knowledge.slice(0, 4),
        });
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  const stats = [
    { label: 'Curated Circuits', value: '12+', icon: '🗺️' },
    { label: 'Verified Stays', value: '200+', icon: '🏨' },
    { label: 'Transport Options', value: '50+', icon: '🚌' },
    { label: 'Travel Guides', value: '80+', icon: '📚' },
  ];

  return (
    <div className="public-tourism">
      <section className="public-tourism__hero">
        <div className="public-tourism__hero-content">
          <h1 className="public-tourism__hero-title">
            Durga Puja Tourism Concierge
          </h1>
          <p className="public-tourism__hero-subtitle">
            Plan your perfect pilgrimage to West Bengal's grandest celebration. Discover curated circuits,
            verified stays, and expert guidance for an unforgettable Durga Puja experience.
          </p>
          <div className="public-tourism__hero-actions">
            <Link to={ROUTES.PUBLIC_TRIP_PLANNER} className="btn btn--primary btn--lg">
              Start Trip Planner
            </Link>
            <Link to={ROUTES.PUBLIC_TOURISM_CIRCUITS} className="btn btn--outline btn--lg">
              Explore Circuits
            </Link>
          </div>
        </div>
        <div className="public-tourism__hero-visual">
          <div className="public-tourism__hero-stats">
            {stats.map((stat, i) => (
              <div key={i} className="public-tourism__stat">
                <span className="public-tourism__stat-icon" aria-hidden="true">{stat.icon}</span>
                <div className="public-tourism__stat-value">{stat.value}</div>
                <div className="public-tourism__stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="public-tourism__loading">Loading tourism concierge…</div>
      ) : (
        <>
          <section className="public-tourism__section">
            <div className="public-tourism__section-header">
              <h2 className="public-tourism__section-title">Featured Pilgrimage Circuits</h2>
              <Link to={ROUTES.PUBLIC_TOURISM_CIRCUITS} className="public-tourism__view-all">
                View all circuits →
              </Link>
            </div>
            <div className="public-tourism__card-grid">
              {featured.circuits.map((circuit) => (
                <Link key={circuit.id} to={ROUTES.PUBLIC_TOURISM_CIRCUIT_DETAIL(circuit.slug)} className="public-tourism__circuit-card">
                  {circuit.coverImageUrl && (
                    <div className="public-tourism__circuit-card-image">
                      <img src={circuit.coverImageUrl} alt={circuit.name} loading="lazy" />
                    </div>
                  )}
                  <div className="public-tourism__circuit-card-content">
                    <div className="public-tourism__circuit-card-meta">
                      <span className="public-tourism__tag public-tourism__tag--region">{circuit.region}</span>
                      <span className="public-tourism__tag public-tourism__tag--duration">{circuit.duration}</span>
                    </div>
                    <h3 className="public-tourism__circuit-card-title">{circuit.name}</h3>
                    <p className="public-tourism__circuit-card-desc">{circuit.description.slice(0, 120)}…</p>
                    <div className="public-tourism__circuit-card-highlights">
                      {circuit.highlightPandals.slice(0, 3).map((pandal, idx) => (
                        <span key={idx} className="public-tourism__highlight-tag">{pandal.name}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
              {featured.circuits.length === 0 && (
                <div className="public-tourism__empty">
                  <p>No featured circuits available at the moment.</p>
                </div>
              )}
            </div>
          </section>

          <section className="public-tourism__section public-tourism__section--alt">
            <div className="public-tourism__section-header">
              <h2 className="public-tourism__section-title">Curated Itineraries</h2>
              <Link to={ROUTES.PUBLIC_TOURISM_ITINERARIES} className="public-tourism__view-all">
                View all itineraries →
              </Link>
            </div>
            <div className="public-tourism__card-grid public-tourism__card-grid--itinerary">
              {featured.itineraries.map((itinerary) => (
                <Link key={itinerary.id} to={ROUTES.PUBLIC_TOURISM_ITINERARY_DETAIL(itinerary.slug)} className="public-tourism__itinerary-card">
                  {itinerary.coverImageUrl && (
                    <div className="public-tourism__itinerary-card-image">
                      <img src={itinerary.coverImageUrl} alt={itinerary.title} loading="lazy" />
                    </div>
                  )}
                  <div className="public-tourism__itinerary-card-content">
                    <div className="public-tourism__itinerary-card-meta">
                      <span className="public-tourism__tag public-tourism__tag--days">{itinerary.durationDays} Days</span>
                      <span className="public-tourism__tag public-tourism__tag--audience">{itinerary.targetAudience}</span>
                    </div>
                    <h3 className="public-tourism__itinerary-card-title">{itinerary.title}</h3>
                    <p className="public-tourism__itinerary-card-desc">{itinerary.overview.slice(0, 120)}…</p>
                    <ul className="public-tourism__itinerary-card-highlights">
                      {itinerary.includedHighlights.slice(0, 3).map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </Link>
              ))}
              {featured.itineraries.length === 0 && (
                <div className="public-tourism__empty">
                  <p>No curated itineraries available at the moment.</p>
                </div>
              )}
            </div>
          </section>

          <div className="public-tourism__quick-links">
            <Link to={ROUTES.PUBLIC_TOURISM_STAYS} className="public-tourism__quick-card">
              <div className="public-tourism__quick-icon">🏨</div>
              <h3>Verified Stays</h3>
              <p>WBTDC properties, hotels & homestays</p>
              <span className="public-tourism__quick-count">{featured.stays.length}+ options</span>
            </Link>
            <Link to={ROUTES.PUBLIC_TOURISM_TRANSPORTS} className="public-tourism__quick-card">
              <div className="public-tourism__quick-icon">🚌</div>
              <h3>Transport Guide</h3>
              <p>Buses, trains, metros & local tips</p>
              <span className="public-tourism__quick-count">{featured.transports.length}+ routes</span>
            </Link>
            <Link to={ROUTES.PUBLIC_TOURISM_KNOWLEDGE} className="public-tourism__quick-card">
              <div className="public-tourism__quick-icon">📚</div>
              <h3>Travel Knowledge</h3>
              <p>Rituals, etiquette, food & packing</p>
              <span className="public-tourism__quick-count">{featured.knowledge.length}+ guides</span>
            </Link>
            <Link to={ROUTES.PUBLIC_TOURISM_OPERATORS} className="public-tourism__quick-card">
              <div className="public-tourism__quick-icon">🤝</div>
              <h3>Tour Operators</h3>
              <p>Verified packages & custom tours</p>
              <span className="public-tourism__quick-count">Verified partners</span>
            </Link>
          </div>

          <section className="public-tourism__section public-tourism__section--cta">
            <div className="public-tourism__cta-card">
              <div className="public-tourism__cta-content">
                <h2>Need Personalized Help?</h2>
                <p>Our tourism concierge team can create a custom itinerary, recommend stays, and connect you with verified tour operators.</p>
                <Link to={ROUTES.PUBLIC_TOURISM_ENQUIRY} className="btn btn--primary btn--lg">
                  Submit Enquiry
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
      <TourismChatbot mode="floating" />
    </div>
  );
}
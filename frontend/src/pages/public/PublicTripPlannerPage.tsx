import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { publicTourismService } from '@/services/tourismService';
import { TourismChatbot } from '@/components/tourism/TourismChatbot';
import type {
  TourismCircuit,
  TourismStay,
  TourismTransport,
  TourismFestivalDay,
  TourismItinerary,
  TourismKnowledge,
  TourismRecommendationResponse,
} from '@/types/tourism';
import '@/styles/public-tourism.css';

// 9 Flow Steps matching tender specification
type FlowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const FLOW_STEPS = [
  { num: 1, label: 'User Requirements', icon: '📝' },
  { num: 2, label: 'Circuits', icon: '🗺️' },
  { num: 3, label: 'Stay', icon: '🏨' },
  { num: 4, label: 'Transport', icon: '🚌' },
  { num: 5, label: 'Festival Calendar', icon: '📅' },
  { num: 6, label: 'Curated Itineraries', icon: '🗓️' },
  { num: 7, label: 'AI Assistant', icon: '🤖' },
  { num: 8, label: 'Recommended Info', icon: '💡' },
  { num: 9, label: 'Personalized Enquiry', icon: '✉️' },
];

const DURATION_OPTIONS = ['1-2 Days', '3-4 Days', '5-7 Days', 'Full Festival (10+ Days)'];
const REGION_OPTIONS = [
  'North Kolkata (Heritage & Bonedi Bari)',
  'South Kolkata (Mega Thematic Pandals)',
  'Central Kolkata & College Square',
  'Salt Lake & East Kolkata',
  'Outskirts (Bawali / Belur / Riverfront)',
];
const TRAVELLER_OPTIONS = [
  'Solo Explorer',
  'Couple / Duo',
  'Family with Children',
  'Senior Citizens',
  'Cultural & Photography Group',
];
const INTEREST_OPTIONS = [
  'Ancestral Bonedi Bari Pujas',
  'UNESCO Contemporary Art Pandals',
  'Dhunuchi Naach & Folk Music',
  'Sacred Rituals & Sandhi Puja',
  'Belur Math Kumari Puja',
  'Authentic Bengali Bhog Dining',
  'Midnight Street Food Walks',
  'Riverfront Immersion Cruises',
  'Kumartuli Idol Artisans Walk',
];
const STAY_OPTIONS = [
  'WBTDCL Government Tourism Lodges (Official & Secured)',
  'Heritage Zamindari Palaces (Royal Experience)',
  '5-Star Luxury Hotels (Full Amenities)',
  'Mid-Range Boutique City Hotels',
  'Budget Friendly Guesthouses & Homestays',
];
const TRANSPORT_OPTIONS = [
  'Kolkata Metro (All-Night AC Festive Transit)',
  'Govt Puja Parikrama AC Guided Coaches',
  'Hooghly Riverfront Ferry & Immersion Boats',
  'Yatri Sathi Govt Police Safe Cabs',
  'Chauffeured AC Private Rental',
];
const PUJA_PREFERENCES = [
  'VIP Fast-Track Pandal Access Pass',
  'Elderly Wheelchair Accessibility',
  'Professional Bilingual Guide',
  'Sandhi Puja (108 Lotus Ceremony) Seating',
  'Sindoor Khela Participation & Photography',
  'Red Road UNESCO Immersion Carnival Passes',
];

export function PublicTripPlannerPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<FlowStep>(1);
  const [language, setLanguage] = useState<'en' | 'bn' | 'hi'>('en');

  // Form requirements state
  const [formData, setFormData] = useState({
    startDate: '2026-10-16',
    endDate: '2026-10-20',
    duration: '3-4 Days',
    regions: ['North Kolkata (Heritage & Bonedi Bari)', 'South Kolkata (Mega Thematic Pandals)'],
    travellers: 'Family with Children',
    interests: ['Ancestral Bonedi Bari Pujas', 'UNESCO Contemporary Art Pandals'],
    stayPreference: 'WBTDCL Government Tourism Lodges (Official & Secured)',
    transportPreference: 'Kolkata Metro (All-Night AC Festive Transit)',
    pujaPreferences: ['VIP Fast-Track Pandal Access Pass'],
  });

  // Recommended & Live Data
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<TourismRecommendationResponse | null>(null);
  const [allCircuits, setAllCircuits] = useState<TourismCircuit[]>([]);
  const [allStays, setAllStays] = useState<TourismStay[]>([]);
  const [allTransports, setAllTransports] = useState<TourismTransport[]>([]);
  const [allCalendar, setAllCalendar] = useState<TourismFestivalDay[]>([]);
  const [allItineraries, setAllItineraries] = useState<TourismItinerary[]>([]);
  const [allKnowledge, setAllKnowledge] = useState<TourismKnowledge[]>([]);

  useEffect(() => {
    loadAllTourismData();
  }, []);

  const loadAllTourismData = async () => {
    try {
      const [circuits, stays, transports, calendar, itineraries, knowledge] = await Promise.all([
        publicTourismService.circuits.list().catch(() => []),
        publicTourismService.stays.list().catch(() => []),
        publicTourismService.transports.list().catch(() => []),
        publicTourismService.festivalDays.list().catch(() => []),
        publicTourismService.itineraries.list().catch(() => []),
        publicTourismService.knowledge.list().catch(() => []),
      ]);
      setAllCircuits(circuits);
      setAllStays(stays);
      setAllTransports(transports);
      setAllCalendar(calendar);
      setAllItineraries(itineraries);
      setAllKnowledge(knowledge);
    } catch {
      // Handled silently
    }
  };

  const toggleMultiSelect = (field: 'regions' | 'interests' | 'pujaPreferences', val: string) => {
    setFormData((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(val) ? current.filter((item) => item !== val) : [...current, val],
      };
    });
  };

  const handleComputeRecommendations = async () => {
    setLoading(true);
    try {
      const data = await publicTourismService.recommendations.get({
        duration: formData.duration,
        travellers: formData.travellers,
        interests: formData.interests,
        regions: formData.regions,
        stayPreference: formData.stayPreference,
        transportPreference: formData.transportPreference,
        pujaPreferences: formData.pujaPreferences,
      });
      setRecommendations(data);
      setActiveStep(2);
    } catch {
      setActiveStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToEnquiry = () => {
    // Navigate to Enquiry Page with pre-filled state
    navigate(ROUTES.PUBLIC_TOURISM_ENQUIRY, {
      state: {
        plannerPref: {
          startDate: formData.startDate,
          endDate: formData.endDate,
          durationPreference: formData.duration,
          interests: formData.interests,
          stayPreference: formData.stayPreference,
          transportPreference: formData.transportPreference,
          pujaPreferences: formData.pujaPreferences,
          preferredCircuits: recommendations?.recommendedCircuits.map((c) => c.circuit.name) || [],
          numberOfTravellers: formData.travellers.includes('Solo')
            ? 1
            : formData.travellers.includes('Couple')
            ? 2
            : 4,
        },
      },
    });
  };

  return (
    <div className="trip-planner">
      {/* Header */}
      <div className="trip-planner__header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="trip-planner__title">Durga Puja Tourism Concierge Planner</h1>
            <p className="trip-planner__subtitle">
              Follow our tender-guided 9-stage pilgrimage planning flow for Durga Puja 2026.
            </p>
          </div>
          <div className="tourism-chatbot__lang-pills" style={{ background: 'var(--colour-surface)', border: '1px solid var(--colour-border)' }}>
            <button
              type="button"
              className={`tourism-chatbot__lang-btn ${language === 'en' ? 'tourism-chatbot__lang-btn--active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              type="button"
              className={`tourism-chatbot__lang-btn ${language === 'bn' ? 'tourism-chatbot__lang-btn--active' : ''}`}
              onClick={() => setLanguage('bn')}
            >
              বাংলা
            </button>
            <button
              type="button"
              className={`tourism-chatbot__lang-btn ${language === 'hi' ? 'tourism-chatbot__lang-btn--active' : ''}`}
              onClick={() => setLanguage('hi')}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* 9-Step Planned Flow Timeline Indicator */}
      <nav className="trip-planner__steps" aria-label="Planning flow progress" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        {FLOW_STEPS.map((step) => {
          const isDone = activeStep > step.num;
          const isActive = activeStep === step.num;
          return (
            <div
              key={step.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                opacity: activeStep >= step.num ? 1 : 0.65,
              }}
              onClick={() => setActiveStep(step.num as FlowStep)}
            >
              <div className={`trip-planner__step ${isActive ? 'trip-planner__step--active' : ''} ${isDone ? 'trip-planner__step--done' : ''}`}>
                <span className="trip-planner__step-num">
                  {isDone ? '✓' : step.icon}
                </span>
                <span style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{step.label}</span>
              </div>
              {step.num < 9 && <div className="trip-planner__step-connector" />}
            </div>
          );
        })}
      </nav>

      {/* Summary Note Bar when computed */}
      {recommendations?.summaryNote && (
        <div className="trip-planner__summary-note" style={{ marginBottom: 'var(--space-5)' }}>
          <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>💡</span>
          <span><strong>Personalized Recommendation: </strong>{recommendations.summaryNote}</span>
        </div>
      )}

      {/* =========================================================================
          STEP 1: User Requirement / Input
          ========================================================================= */}
      {activeStep === 1 && (
        <div className="trip-planner__card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontSize: '1.5rem' }}>📝</span>
            <h2 className="trip-planner__card-title" style={{ margin: 0 }}>
              Step 1: Enter Your Travel Requirements & Preferences
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Arrival Date</label>
              <input
                type="date"
                className="tourism-chatbot__input"
                value={formData.startDate}
                onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)' }}>Maha Sasthi is Oct 16, 2026</span>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Departure Date</label>
              <input
                type="date"
                className="tourism-chatbot__input"
                value={formData.endDate}
                onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)' }}>Dashami is Oct 20; Carnival is Oct 23</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 'var(--space-4) 0 var(--space-2)' }}>Trip Duration</h3>
          <div className="trip-planner__options-grid">
            {DURATION_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={`trip-planner__option ${formData.duration === opt ? 'trip-planner__option--selected' : ''}`}
                onClick={() => setFormData((p) => ({ ...p, duration: opt }))}
              >
                {opt}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 'var(--space-4) 0 var(--space-2)' }}>Who is Travelling?</h3>
          <div className="trip-planner__options-grid">
            {TRAVELLER_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={`trip-planner__option ${formData.travellers === opt ? 'trip-planner__option--selected' : ''}`}
                onClick={() => setFormData((p) => ({ ...p, travellers: opt }))}
              >
                {opt}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 'var(--space-4) 0 var(--space-2)' }}>
            Preferred Regions (Select all that apply)
          </h3>
          <div className="trip-planner__options-grid">
            {REGION_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={`trip-planner__option ${formData.regions.includes(opt) ? 'trip-planner__option--selected' : ''}`}
                onClick={() => toggleMultiSelect('regions', opt)}
              >
                {opt}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 'var(--space-4) 0 var(--space-2)' }}>
            Special Interests & Experiences
          </h3>
          <div className="trip-planner__options-grid">
            {INTEREST_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={`trip-planner__option ${formData.interests.includes(opt) ? 'trip-planner__option--selected' : ''}`}
                onClick={() => toggleMultiSelect('interests', opt)}
              >
                {opt}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 'var(--space-4) 0 var(--space-2)' }}>Accommodation Preference</h3>
          <div className="trip-planner__options-grid">
            {STAY_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={`trip-planner__option ${formData.stayPreference === opt ? 'trip-planner__option--selected' : ''}`}
                onClick={() => setFormData((p) => ({ ...p, stayPreference: opt }))}
              >
                {opt}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 'var(--space-4) 0 var(--space-2)' }}>Transport Preference</h3>
          <div className="trip-planner__options-grid">
            {TRANSPORT_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={`trip-planner__option ${formData.transportPreference === opt ? 'trip-planner__option--selected' : ''}`}
                onClick={() => setFormData((p) => ({ ...p, transportPreference: opt }))}
              >
                {opt}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 'var(--space-4) 0 var(--space-2)' }}>
            Durga Puja Specific Requirements
          </h3>
          <div className="trip-planner__options-grid">
            {PUJA_PREFERENCES.map((opt) => (
              <div
                key={opt}
                className={`trip-planner__option ${formData.pujaPreferences.includes(opt) ? 'trip-planner__option--selected' : ''}`}
                onClick={() => toggleMultiSelect('pujaPreferences', opt)}
              >
                {opt}
              </div>
            ))}
          </div>

          <div className="trip-planner__actions" style={{ marginTop: 'var(--space-6)' }}>
            <Link to={ROUTES.PUBLIC_TOURISM_CONCIERGE} className="btn btn--outline">
              Back to Overview
            </Link>
            <button
              type="button"
              className="btn btn--primary btn--lg"
              disabled={loading}
              onClick={handleComputeRecommendations}
            >
              {loading ? 'Matching Pilgrimage Circuits...' : 'Compute Recommendation Flow →'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: Recommended Circuits (Pandal Atlas Integration)
          ========================================================================= */}
      {activeStep === 2 && (
        <div className="trip-planner__card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🗺️</span>
              <h2 className="trip-planner__card-title" style={{ margin: 0 }}>
                Step 2: Recommended Pilgrimage Circuits
              </h2>
            </div>
            <Link to={ROUTES.PUBLIC_TOURISM_CIRCUITS} className="public-tourism__view-all">
              Browse all {allCircuits.length} circuits →
            </Link>
          </div>

          <p style={{ color: 'var(--colour-ink-soft)', marginBottom: 'var(--space-4)' }}>
            Curated trails aligned with your region, crowd tolerance, and devotional preferences. Each circuit integrates with the Pandal Atlas for real-time navigation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {(recommendations?.recommendedCircuits || allCircuits.slice(0, 3).map((c) => ({ circuit: c, matchScore: 95, matchReasons: ['High cultural significance', 'Curated festival route'] }))).map(
              ({ circuit, matchScore, matchReasons }) => (
                <div key={circuit.id} className="trip-planner__circuit-match">
                  <div className="trip-planner__match-score">
                    <span>{matchScore}%</span>
                    <span style={{ fontSize: '0.65rem' }}>match</span>
                  </div>
                  <div className="trip-planner__match-info">
                    <h4>{circuit.name}</h4>
                    <p style={{ margin: '0 0 var(--space-2)', fontSize: '0.85rem', color: 'var(--colour-ink-soft)' }}>
                      📍 {circuit.region} • ⏱️ {circuit.duration} • 🚶 Best: {circuit.bestTimeOfDay}
                    </p>
                    <p style={{ fontSize: '0.88rem', margin: '0 0 var(--space-2)' }}>{circuit.description}</p>
                    <ul className="trip-planner__match-reasons">
                      {matchReasons.map((r, i) => (
                        <li key={i} className="trip-planner__match-reason">✓ {r}</li>
                      ))}
                    </ul>

                    {/* Integrated Pandal Atlas Links */}
                    {circuit.highlightPandals && circuit.highlightPandals.length > 0 && (
                      <div style={{ marginTop: 'var(--space-2)' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--colour-brand)' }}>
                          Integrated Pandals (view on Atlas):
                        </span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {circuit.highlightPandals.map((p, idx) => (
                            <Link
                              key={idx}
                              to={ROUTES.PUBLIC_ATLAS}
                              className="public-tourism__highlight-tag"
                              title={`${p.name}: ${p.highlight || p.location}`}
                              style={{ textDecoration: 'none' }}
                            >
                              📍 {p.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ alignSelf: 'center', marginLeft: 'auto' }}>
                    <Link to={ROUTES.PUBLIC_TOURISM_CIRCUIT_DETAIL(circuit.slug)} className="btn btn--outline btn--sm">
                      Full Trail Details
                    </Link>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="trip-planner__actions" style={{ marginTop: 'var(--space-5)' }}>
            <button type="button" className="btn btn--outline" onClick={() => setActiveStep(1)}>
              ← Back to Requirements
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setActiveStep(3)}>
              Next: Recommended Stay (Step 3) →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: Stay / Accommodation
          ========================================================================= */}
      {activeStep === 3 && (
        <div className="trip-planner__card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🏨</span>
              <h2 className="trip-planner__card-title" style={{ margin: 0 }}>
                Step 3: Verified Stays & Government Tourism Lodges
              </h2>
            </div>
            <Link to={ROUTES.PUBLIC_TOURISM_STAYS} className="public-tourism__view-all">
              View all stays →
            </Link>
          </div>

          <p style={{ color: 'var(--colour-ink-soft)', marginBottom: 'var(--space-4)' }}>
            Official West Bengal Tourism Development Corporation (WBTDCL) properties and verified heritage homestays with direct transport links to pandal routes.
          </p>

          <div className="public-tourism__card-grid">
            {(recommendations?.suggestedStays || allStays.slice(0, 4)).map((stay) => (
              <div key={stay.id} className="public-tourism__stay-card">
                {stay.coverImageUrl && (
                  <div style={{ height: '140px', overflow: 'hidden' }}>
                    <img src={stay.coverImageUrl} alt={stay.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: 'var(--space-4)' }}>
                  <div className="public-tourism__stay-card-header">
                    <h4 className="public-tourism__stay-card-name" style={{ fontSize: '1.05rem' }}>{stay.name}</h4>
                    {stay.isWbtdc && <span className="public-tourism__wbtdc-badge">WBTDCL Govt</span>}
                  </div>
                  <div className="public-tourism__stay-card-meta">
                    <span className="public-tourism__tag public-tourism__tag--region">{stay.type}</span>
                    <span className="public-tourism__tag public-tourism__tag--duration">{stay.district}</span>
                    <span className="public-tourism__tag" style={{ background: '#fef3c7', color: '#92400e' }}>
                      ★ {stay.starRating || 4} Stars
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--colour-ink-soft)', margin: 'var(--space-2) 0' }}>
                    {stay.location}
                  </p>
                  <div className="public-tourism__stay-card-footer">
                    <span className="public-tourism__price">{stay.priceRange}</span>
                    {stay.bookingUrl && (
                      <a href={stay.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm">
                        Check Availability
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="trip-planner__actions" style={{ marginTop: 'var(--space-5)' }}>
            <button type="button" className="btn btn--outline" onClick={() => setActiveStep(2)}>
              ← Back to Circuits
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setActiveStep(4)}>
              Next: Transport Logistics (Step 4) →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: Transport Information
          ========================================================================= */}
      {activeStep === 4 && (
        <div className="trip-planner__card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🚌</span>
              <h2 className="trip-planner__card-title" style={{ margin: 0 }}>
                Step 4: Festive Transport & Navigation Guide
              </h2>
            </div>
            <Link to={ROUTES.PUBLIC_TOURISM_TRANSPORTS} className="public-tourism__view-all">
              View all transport options →
            </Link>
          </div>

          <p style={{ color: 'var(--colour-ink-soft)', marginBottom: 'var(--space-4)' }}>
            Special Puja Parikrama coaches, 24x7 all-night Metro corridors, river immersion cruises, and police prepaid taxi booths.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {(recommendations?.recommendedTransports || allTransports.slice(0, 4)).map((t) => (
              <div
                key={t.id}
                style={{
                  background: 'var(--colour-surface)',
                  border: '1px solid var(--colour-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{t.name}</h4>
                  <span className="public-tourism__tag public-tourism__tag--region">{t.category}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--colour-ink-soft)', marginBottom: '8px' }}>
                  <strong>Operating Hours: </strong>{t.operatingHours}
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  <strong>Fare Guide: </strong>{t.fareGuide}
                </div>
                <p style={{ fontSize: '0.88rem', margin: '0 0 var(--space-3)' }}>{t.routeDescription}</p>
                {t.tips && Array.isArray(t.tips) && (
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--colour-ink-soft)' }}>
                    {t.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                )}
                {t.bookingOrHelpline && (
                  <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--colour-brand)', fontWeight: 600 }}>
                    📞 Helpline / Booking: {t.bookingOrHelpline}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="trip-planner__actions" style={{ marginTop: 'var(--space-5)' }}>
            <button type="button" className="btn btn--outline" onClick={() => setActiveStep(3)}>
              ← Back to Stay
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setActiveStep(5)}>
              Next: Festival Calendar (Step 5) →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 5: Festival Calendar
          ========================================================================= */}
      {activeStep === 5 && (
        <div className="trip-planner__card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontSize: '1.5rem' }}>📅</span>
            <h2 className="trip-planner__card-title" style={{ margin: 0 }}>
              Step 5: Durga Puja 2026 Festival Calendar & Ritual Confluences
            </h2>
          </div>

          <p style={{ color: 'var(--colour-ink-soft)', marginBottom: 'var(--space-4)' }}>
            Timing is vital for Durga Puja. Explore sacred tithi timings, auspicious hours for Pushpanjali, Sandhi Puja, Kumari Puja, and Sindoor Khela.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {allCalendar.map((day) => (
              <div
                key={day.id}
                style={{
                  background: 'var(--colour-surface)',
                  border: '1px solid var(--colour-border)',
                  borderLeft: '4px solid var(--colour-brand)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--colour-brand)', fontWeight: 800 }}>
                    {day.tithiName}
                  </h3>
                  <span className="public-tourism__tag public-tourism__tag--duration" style={{ fontSize: '0.85rem' }}>
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ margin: '8px 0', fontSize: '0.88rem' }}>
                  <strong>Rituals & Significance: </strong>{day.rituals}
                </div>
                <div style={{ margin: '8px 0', fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>
                  ⏱️ Best Tourist Visiting Windows: {day.bestTimeWindows}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--colour-ink-soft)' }}>
                  💡 <strong>Tourist Tip: </strong>{day.tourismTips}
                </p>
                {day.highlights && Array.isArray(day.highlights) && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {day.highlights.map((h, i) => (
                      <span key={i} className="public-tourism__highlight-tag">✨ {h}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="trip-planner__actions" style={{ marginTop: 'var(--space-5)' }}>
            <button type="button" className="btn btn--outline" onClick={() => setActiveStep(4)}>
              ← Back to Transport
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setActiveStep(6)}>
              Next: Curated Day-by-Day Itineraries (Step 6) →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 6: Curated Itineraries
          ========================================================================= */}
      {activeStep === 6 && (
        <div className="trip-planner__card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🗓️</span>
              <h2 className="trip-planner__card-title" style={{ margin: 0 }}>
                Step 6: Curated Day-by-Day Itineraries
              </h2>
            </div>
            <Link to={ROUTES.PUBLIC_TOURISM_ITINERARIES} className="public-tourism__view-all">
              View all itineraries →
            </Link>
          </div>

          {recommendations?.recommendedItinerary ? (
            <div style={{ border: '2px solid var(--colour-brand)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-5)', background: 'rgba(155, 28, 28, 0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span className="public-tourism__tag" style={{ background: 'var(--colour-brand)', color: '#fff', fontWeight: 700 }}>
                    ★ Best Matched for You
                  </span>
                  <h3 style={{ margin: '8px 0', fontSize: '1.25rem', fontWeight: 800 }}>
                    {recommendations.recommendedItinerary.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--colour-ink-soft)' }}>
                    ⏱️ {recommendations.recommendedItinerary.durationDays} Days • 👥 Target: {recommendations.recommendedItinerary.targetAudience}
                  </div>
                </div>
                <Link to={ROUTES.PUBLIC_TOURISM_ITINERARY_DETAIL(recommendations.recommendedItinerary.slug)} className="btn btn--outline btn--sm">
                  View Full Day-by-Day Breakdown
                </Link>
              </div>

              <p style={{ margin: 'var(--space-3) 0', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {recommendations.recommendedItinerary.overview}
              </p>

              {recommendations.recommendedItinerary.dayPlans && Array.isArray(recommendations.recommendedItinerary.dayPlans) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'var(--space-4)' }}>
                  {recommendations.recommendedItinerary.dayPlans.map((dp: any, idx: number) => (
                    <div key={idx} style={{ background: 'var(--colour-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--colour-border)' }}>
                      <strong>Day {dp.day || idx + 1}: {dp.title}</strong>
                      <p style={{ margin: '4px 0', fontSize: '0.85rem', color: 'var(--colour-ink-soft)' }}>
                        🌅 <em>Morning: </em>{dp.morning}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '0.85rem', color: 'var(--colour-ink-soft)' }}>
                        🌆 <em>Evening: </em>{dp.evening}
                      </p>
                      {dp.pandals && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {dp.pandals.map((p: string, pIdx: number) => (
                            <span key={pIdx} className="public-tourism__highlight-tag">📍 {p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="public-tourism__card-grid public-tourism__card-grid--itinerary">
              {allItineraries.map((itinerary) => (
                <Link key={itinerary.id} to={ROUTES.PUBLIC_TOURISM_ITINERARY_DETAIL(itinerary.slug)} className="public-tourism__itinerary-card">
                  <div className="public-tourism__itinerary-card-content">
                    <span className="public-tourism__tag public-tourism__tag--days">{itinerary.durationDays} Days</span>
                    <h3 className="public-tourism__itinerary-card-title">{itinerary.title}</h3>
                    <p className="public-tourism__itinerary-card-desc">{itinerary.overview.slice(0, 120)}…</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="trip-planner__actions" style={{ marginTop: 'var(--space-5)' }}>
            <button type="button" className="btn btn--outline" onClick={() => setActiveStep(5)}>
              ← Back to Calendar
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setActiveStep(7)}>
              Next: Consult AI Assistant (Step 7) →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 7: AI Assistant / Chatbot
          ========================================================================= */}
      {activeStep === 7 && (
        <div className="trip-planner__card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <div>
              <h2 className="trip-planner__card-title" style={{ margin: 0 }}>
                Step 7: Interactive Concierge AI Assistant
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--colour-ink-soft)' }}>
                Ask anything about your planned route in English, Bengali, or Hindi. The AI utilizes live festival knowledge.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <TourismChatbot mode="inline" initialLanguage={language} />
          </div>

          <div className="trip-planner__actions" style={{ marginTop: 'var(--space-5)' }}>
            <button type="button" className="btn btn--outline" onClick={() => setActiveStep(6)}>
              ← Back to Itineraries
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setActiveStep(8)}>
              Next: Recommended Travel Guidelines (Step 8) →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 8: Recommended Information (Knowledge Base)
          ========================================================================= */}
      {activeStep === 8 && (
        <div className="trip-planner__card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <h2 className="trip-planner__card-title" style={{ margin: 0 }}>
                Step 8: Essential Logistics & Cultural Knowledge
              </h2>
            </div>
            <Link to={ROUTES.PUBLIC_TOURISM_KNOWLEDGE} className="public-tourism__view-all">
              View all travel guides →
            </Link>
          </div>

          <p style={{ color: 'var(--colour-ink-soft)', marginBottom: 'var(--space-4)' }}>
            Safety, dress code, photography guidelines, crowd navigation, and essential emergency contacts curated by West Bengal Tourism.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {allKnowledge.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--colour-surface)',
                  border: '1px solid var(--colour-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                }}
              >
                <span className="public-tourism__tag public-tourism__tag--region" style={{ marginBottom: '8px' }}>
                  {item.category}
                </span>
                <h4 style={{ margin: '8px 0', fontSize: '1.05rem', fontWeight: 700 }}>{item.title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--colour-ink-soft)', margin: '0 0 var(--space-3)' }}>
                  {item.content}
                </p>
                {item.quickTips && item.quickTips.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem' }}>
                    {item.quickTips.map((tip, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="trip-planner__actions" style={{ marginTop: 'var(--space-5)' }}>
            <button type="button" className="btn btn--outline" onClick={() => setActiveStep(7)}>
              ← Back to AI Assistant
            </button>
            <button type="button" className="btn btn--primary btn--lg" onClick={() => setActiveStep(9)}>
              Next: Submit Official Personalized Enquiry (Step 9) →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 9: Personalized Enquiry Confirmation & Submission
          ========================================================================= */}
      {activeStep === 9 && (
        <div className="trip-planner__card" style={{ border: '2px solid var(--colour-brand)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontSize: '1.8rem' }}>✉️</span>
            <div>
              <h2 className="trip-planner__card-title" style={{ margin: 0, color: 'var(--colour-brand)' }}>
                Step 9: Review & Submit Your Personalized Enquiry
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--colour-ink-soft)' }}>
                All your preferences, selected circuits, stay and transport options will be securely forwarded to the official West Bengal Tourism Concierge desk.
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--colour-canvas)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Plan Summary to be Forwarded:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.85rem' }}>
              <div><strong>Dates: </strong>{formData.startDate} to {formData.endDate}</div>
              <div><strong>Duration: </strong>{formData.duration}</div>
              <div><strong>Travellers: </strong>{formData.travellers}</div>
              <div><strong>Stay: </strong>{formData.stayPreference}</div>
              <div><strong>Transport: </strong>{formData.transportPreference}</div>
              <div><strong>Regions: </strong>{formData.regions.join(', ')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={handleProceedToEnquiry}
            >
              Confirm & Open Official Concierge Enquiry Form →
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setActiveStep(1)}
            >
              Start Planner Over
            </button>
          </div>
        </div>
      )}

      {/* Floating chatbot assistant so it is accessible at any time */}
      <TourismChatbot mode="floating" initialLanguage={language} />
    </div>
  );
}

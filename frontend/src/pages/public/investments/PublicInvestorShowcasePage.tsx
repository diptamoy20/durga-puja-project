import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { publicInvestmentService } from '@/services/investmentService';
import { ExpressInterestModal } from './ExpressInterestModal';
import type { InvestmentOpportunity, IndustryAssociation } from '@/types/investments';

import '@/styles/public-investments.css';

const SECTORS = [
  'All Sectors',
  'Tourism & Hospitality',
  'Handicrafts & Artisans',
  'Creative Economy',
  'IT & Cultural Tech',
  'Smart City & Clean Tech',
  'F&B & Agri-business',
];

export function PublicInvestorShowcasePage() {
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [associations, setAssociations] = useState<IndustryAssociation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [search, setSearch] = useState('');
  const [selectedAssociation, setSelectedAssociation] = useState<string>('');
  const [generalModalOpen, setGeneralModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [oppRes, assocRes] = await Promise.all([
          publicInvestmentService.opportunities.list({ perPage: 50 }),
          publicInvestmentService.associations.list(),
        ]);
        setOpportunities(oppRes.items);
        setAssociations(assocRes);
      } catch {
        // Handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      if (selectedSector !== 'All Sectors' && opp.sector !== selectedSector) {
        return false;
      }
      if (selectedAssociation && String(opp.associationId) !== selectedAssociation) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesSummary = opp.summary?.toLowerCase().includes(q) || false;
        const matchesLocation = opp.location.toLowerCase().includes(q);
        const matchesSector = opp.sector.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesLocation && !matchesSector) {
          return false;
        }
      }
      return true;
    });
  }, [opportunities, selectedSector, selectedAssociation, search]);

  const stats = [
    { label: 'Active Curated Projects', value: '25+' },
    { label: 'Investment Pipeline', value: '₹500+ Cr' },
    { label: 'Partner Chambers & Bodies', value: `${associations.length || 5}+` },
    { label: 'Single Window Fast-Track', value: '100%' },
  ];

  return (
    <div className="investor-showcase">
      {/* Hero Banner */}
      <section className="investor-hero">
        <div className="investor-hero__badge">
          <span>🏛️</span> West Bengal Global Investment & Heritage Promotion
        </div>
        <h1 className="investor-hero__title">
          Durga Puja & Cultural Heritage Investor Showcase
        </h1>
        <p className="investor-hero__subtitle">
          Discover high-impact investment opportunities in Bengal’s creative economy, UNESCO-recognized heritage tourism, artisan clusters, boutique riverfront hospitality, and cultural technology platforms.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <Button variant="ghost" onClick={() => setGeneralModalOpen(true)} style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
            💼 Express General Investor Interest
          </Button>
          <a href="#browse-projects" className="btn btn--primary" style={{ background: '#f59e0b', color: '#78350f', fontWeight: 700, borderColor: '#f59e0b' }}>
            Explore Opportunities ↓
          </a>
        </div>

        <div className="investor-hero__stats">
          {stats.map((stat, idx) => (
            <div key={idx} className="investor-stat">
              <div className="investor-stat__value">{stat.value}</div>
              <div className="investor-stat__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section id="browse-projects" className="investor-filter-bar">
        <div className="investor-filter-bar__sectors">
          {SECTORS.map((sector) => (
            <button
              key={sector}
              type="button"
              className={`sector-chip ${selectedSector === sector ? 'sector-chip--active' : ''}`}
              onClick={() => setSelectedSector(sector)}
            >
              {sector}
            </button>
          ))}
        </div>

        <div className="investor-filter-bar__inputs">
          <input
            type="text"
            className="field__control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, keyword, or district..."
            style={{ flex: 1, padding: '8px 12px' }}
          />
          <select
            className="field__control"
            value={selectedAssociation}
            onChange={(e) => setSelectedAssociation(e.target.value)}
            style={{ minWidth: '220px', padding: '8px 12px' }}
          >
            <option value="">All Chambers & Associations</option>
            {associations.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {a.code} - {a.name}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => { setSearch(''); setSelectedSector('All Sectors'); setSelectedAssociation(''); }}>
            Reset
          </Button>
        </div>
      </section>

      {/* Projects Grid */}
      {loading ? (
        <PageLoader label="Loading investment showcase opportunities..." />
      ) : filteredOpportunities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px' }}>No Published Opportunities Found</h3>
          <p style={{ color: 'var(--colour-ink-soft)', maxWidth: '400px', margin: '0 auto 20px' }}>
            No investment opportunities match your search criteria or are currently published.
          </p>
          <Button variant="primary" onClick={() => { setSearch(''); setSelectedSector('All Sectors'); setSelectedAssociation(''); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="investor-grid">
          {filteredOpportunities.map((opp) => (
            <Link
              key={opp.id}
              to={ROUTES.PUBLIC_INVESTOR_OPPORTUNITY_DETAIL(opp.slug)}
              className="opp-card"
            >
              <div className="opp-card__image-wrap">
                <img
                  src={
                    opp.coverImageUrl ||
                    'https://images.unsplash.com/photo-1590059390047-94a56a6ecfa1?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={opp.title}
                  className="opp-card__image"
                  loading="lazy"
                />
                {opp.isFeatured && <div className="opp-card__badge">Featured</div>}
                <div className="opp-card__scale-tag">{opp.investmentRange}</div>
              </div>

              <div className="opp-card__body">
                <div className="opp-card__sector">{opp.sector}</div>
                <h3 className="opp-card__title">{opp.title}</h3>
                <p className="opp-card__summary">{opp.summary || opp.description.replace(/<[^>]*>?/gm, '').slice(0, 140) + '...'}</p>

                <div className="opp-card__meta-list">
                  <div className="opp-card__meta-row">
                    <span className="opp-card__meta-label">Location:</span>
                    <span className="opp-card__meta-val">📍 {opp.location}</span>
                  </div>
                  {opp.projectType && (
                    <div className="opp-card__meta-row">
                      <span className="opp-card__meta-label">Project Model:</span>
                      <span className="opp-card__meta-val">{opp.projectType}</span>
                    </div>
                  )}
                  {opp.expectedRoi && (
                    <div className="opp-card__meta-row">
                      <span className="opp-card__meta-label">Expected Yield:</span>
                      <span className="opp-card__meta-val" style={{ color: '#047857' }}>{opp.expectedRoi}</span>
                    </div>
                  )}
                </div>

                {opp.association && (
                  <div className="opp-card__chamber">
                    <span>🏛️</span> {opp.association.name} ({opp.association.code})
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Partner Industry Associations Section */}
      {associations.length > 0 && (
        <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px', marginTop: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--colour-ink)' }}>
              Industry Associations & Facilitation Chambers
            </h2>
            <p style={{ color: 'var(--colour-ink-soft)', maxWidth: '600px', margin: '0 auto' }}>
              Enquiries and joint venture proposals are routed to state industry bodies ensuring single-window administrative support.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {associations.map((assoc) => (
              <div
                key={assoc.id}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#991b1b' }}>
                  {assoc.code}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--colour-ink)' }}>
                  {assoc.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)' }}>
                  Category: <strong>{assoc.category}</strong>
                </div>
                {assoc.contactPerson && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)', marginTop: 'auto' }}>
                    Contact: {assoc.contactPerson}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* General Investor Enquiry Modal */}
      <ExpressInterestModal
        isOpen={generalModalOpen}
        onClose={() => setGeneralModalOpen(false)}
      />
    </div>
  );
}

export default PublicInvestorShowcasePage;

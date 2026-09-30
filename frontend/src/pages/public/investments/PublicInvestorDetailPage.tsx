import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { ROUTES } from '@/constants/routes';
import { publicInvestmentService } from '@/services/investmentService';
import { ExpressInterestModal } from './ExpressInterestModal';
import type { InvestmentOpportunity } from '@/types/investments';

import '@/styles/public-investments.css';

export function PublicInvestorDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [opportunity, setOpportunity] = useState<InvestmentOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    publicInvestmentService.opportunities
      .get(slug)
      .then(setOpportunity)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Opportunity not found or is not published.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <PageLoader label="Loading opportunity details..." />;
  }

  if (error || !opportunity) {
    return (
      <div className="investor-detail" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Alert variant="warning">{error || 'Opportunity not available.'}</Alert>
        <div style={{ marginTop: '20px' }}>
          <Link to={ROUTES.PUBLIC_INVESTOR_SHOWCASE} className="btn btn--primary">
            ← Back to Investor Showcase
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="investor-detail">
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '16px', fontSize: '0.875rem', color: 'var(--colour-ink-soft)' }}>
        <Link to={ROUTES.PUBLIC_INVESTOR_SHOWCASE} style={{ color: '#b91c1c', textDecoration: 'none', fontWeight: 600 }}>
          ← All Opportunities
        </Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>{opportunity.sector}</span>
      </nav>

      <div className="investor-detail__header">
        <div className="investor-detail__badge-bar">
          <span className="sector-chip sector-chip--active">{opportunity.sector}</span>
          {opportunity.category && (
            <span className="sector-chip">{opportunity.category}</span>
          )}
          <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 700 }}>
            💰 Investment Scale: {opportunity.investmentRange}
          </span>
          {opportunity.isFeatured && (
            <span style={{ background: '#b91c1c', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
              ★ Featured
            </span>
          )}
        </div>

        <h1 className="investor-detail__title">{opportunity.title}</h1>
        {opportunity.summary && (
          <p style={{ fontSize: '1.125rem', lineHeight: 1.6, color: 'var(--colour-ink-soft)', margin: 0 }}>
            {opportunity.summary}
          </p>
        )}
      </div>

      <div className="investor-detail__layout">
        {/* Main Content */}
        <div className="investor-detail__content">
          <img
            src={
              opportunity.coverImageUrl ||
              'https://images.unsplash.com/photo-1590059390047-94a56a6ecfa1?auto=format&fit=crop&w=1200&q=80'
            }
            alt={opportunity.title}
            className="investor-detail__hero-img"
          />

          {/* Key Indicators Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Location</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px', color: '#111827' }}>📍 {opportunity.location}</div>
            </div>
            {opportunity.district && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>District</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px', color: '#111827' }}>{opportunity.district}</div>
              </div>
            )}
            {opportunity.projectType && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Project Model</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px', color: '#111827' }}>{opportunity.projectType}</div>
              </div>
            )}
            {opportunity.expectedRoi && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Target ROI / Yield</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px', color: '#047857' }}>{opportunity.expectedRoi}</div>
              </div>
            )}
          </div>

          {/* Detailed Description */}
          <div
            className="investor-prose"
            dangerouslySetInnerHTML={{
              __html: /<[a-z][\s\S]*>/i.test(opportunity.description)
                ? opportunity.description
                : opportunity.description.split(/\n\s*\n/).map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join(''),
            }}
          />

          {/* Project Highlights */}
          {opportunity.highlights && opportunity.highlights.length > 0 && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 14px', color: '#0f172a' }}>
                ⭐ Key Strategic Highlights
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {opportunity.highlights.map((item, idx) => (
                  <li key={idx} style={{ fontSize: '0.925rem', color: '#334155' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Government Incentives & Single Window Support */}
          {opportunity.incentives && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 10px', color: '#166534' }}>
                🏛️ State Incentives & Regulatory Support
              </h3>
              <p style={{ margin: 0, fontSize: '0.925rem', lineHeight: 1.6, color: '#14532d' }}>
                {opportunity.incentives}
              </p>
            </div>
          )}

          {/* Attached Documents / Project Decks */}
          {opportunity.documents && opportunity.documents.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 14px', color: '#111827' }}>
                📄 Project Documentation & Decks
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {opportunity.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'var(--colour-ink)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>📑</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doc.title}</div>
                        {doc.fileSize && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Size: {doc.fileSize}</div>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: '#b91c1c', fontWeight: 600 }}>Download ↓</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions & Chamber */}
        <div className="investor-sidebar">
          {/* Primary CTA */}
          <div className="investor-cta-card">
            <h3 className="investor-cta-card__title">Interested in this Opportunity?</h3>
            <p className="investor-cta-card__text">
              Submit your expression of interest to connect directly with the assigned Industry Chamber, receive project data rooms, and arrange state facilitation meetings.
            </p>
            <Button
              variant="primary"
              size="lg"
              style={{ width: '100%', background: '#f59e0b', borderColor: '#f59e0b', color: '#78350f', fontWeight: 800 }}
              onClick={() => setModalOpen(true)}
            >
              Express Interest / Enquire
            </Button>
          </div>

          {/* Assigned Industry Chamber / Association */}
          {opportunity.association && (
            <div className="investor-chamber-card">
              <div className="investor-chamber-card__title">Facilitating Industry Body</div>
              <h4 className="investor-chamber-card__name">{opportunity.association.name}</h4>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#991b1b', marginBottom: '8px' }}>
                {opportunity.association.code} · {opportunity.association.category}
              </div>
              {opportunity.association.description && (
                <p className="investor-chamber-card__desc">{opportunity.association.description}</p>
              )}
              {opportunity.association.contactPerson && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--colour-ink-soft)', marginBottom: '4px' }}>
                  <strong>Representative:</strong> {opportunity.association.contactPerson}
                </div>
              )}
              {opportunity.association.email && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--colour-ink-soft)', marginBottom: '4px' }}>
                  <strong>Email:</strong> {opportunity.association.email}
                </div>
              )}
              {opportunity.association.website && (
                <div style={{ marginTop: '12px' }}>
                  <a
                    href={opportunity.association.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8125rem', color: '#b91c1c', fontWeight: 600 }}
                  >
                    Visit Chamber Website ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Express Interest Modal */}
      <ExpressInterestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        opportunity={opportunity}
        association={opportunity.association}
      />
    </div>
  );
}

export default PublicInvestorDetailPage;

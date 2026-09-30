import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { publicTourismService } from "@/services/tourismService";
import { categoryService, subcategoryService } from "@/services/contentService";
import type { TourismOperator } from "@/types/tourism";
import type { Category, Subcategory } from "@/types/content";
import "@/styles/public-tourism.css";

const DEFAULT_OPERATOR_TYPES = [
  'Govt Accredited Tour Operator',
  'WBTDCL Approved Partner',
  'Registered Heritage Tour Agency',
  'Cultural Walking Tour Specialist',
  'Luxury VIP Parikrama Service',
  'Private Destination Management Company',
  'Festival Transport & Logistics Partner',
];

export function PublicTourismOperatorsPage() {
  const [operators, setOperators] = useState<TourismOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [masterTypes, setMasterTypes] = useState<string[]>(DEFAULT_OPERATOR_TYPES);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ops, categories] = await Promise.all([
          publicTourismService.operators.verified().catch(() => []),
          categoryService.listActive().catch(() => []),
        ]);
        setOperators(ops);

        let opCat = categories.find(
          (c: Category) => c.slug.toLowerCase() === 'tour-operator' || c.name.toLowerCase() === 'tour operator' || c.name.toLowerCase().includes('operator')
        );

        const opTypes = ops.map((o: TourismOperator) => o.operatorType).filter(Boolean);
        if (opCat) {
          try {
            const subRes = await subcategoryService.list({ categoryId: opCat.id, status: 'ACTIVE', perPage: 100 });
            const subNames = (subRes.items || []).map((s: Subcategory) => s.name);
            setMasterTypes(Array.from(new Set([...subNames, ...DEFAULT_OPERATOR_TYPES, ...opTypes])).sort());
          } catch {
            setMasterTypes(Array.from(new Set([...DEFAULT_OPERATOR_TYPES, ...opTypes])).sort());
          }
        } else {
          setMasterTypes(Array.from(new Set([...DEFAULT_OPERATOR_TYPES, ...opTypes])).sort());
        }
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filtered = typeFilter ? operators.filter((o) => o.operatorType.toLowerCase() === typeFilter.toLowerCase()) : operators;

  return (
    <div className="public-tourism-list">
      <Link to={ROUTES.PUBLIC_TOURISM_CONCIERGE} className="public-tourism-list__back">Back to Tourism Concierge</Link>
      <div className="public-tourism-list__header">
        <h1 className="public-tourism-list__title">Verified Tour Operators</h1>
        <p className="public-tourism-list__subtitle">Trusted operators offering curated Durga Puja packages and custom tours.</p>
      </div>
      <div className="public-tourism-list__filters">
        <div className="public-tourism-list__filter-group">
          <label>Operator Subcategory</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Subcategories ({operators.length})</option>
            {masterTypes.map((t) => {
              const count = operators.filter((o) => o.operatorType.toLowerCase() === t.toLowerCase()).length;
              return (
                <option key={t} value={t}>
                  {t} {count > 0 ? `(${count})` : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="public-tourism__loading">Loading operators...</div>
      ) : (
        <div className="public-tourism__card-grid">
          {filtered.map((op) => (
            <div key={op.id} className="public-tourism__operator-card">
              <div>
                <h3 className="public-tourism__operator-name">{op.name}</h3>
                {op.rating && <div style={{ color: "var(--colour-warning)", fontSize: "0.85rem", marginTop: "var(--space-1)" }}>{"* ".repeat(Math.round(op.rating)).trim()} ({op.rating})</div>}
              </div>
              <div className="public-tourism__operator-meta">
                <span className="public-tourism__tag public-tourism__tag--region">{op.operatorType}</span>
                {op.isVerified && <span className="public-tourism__tag public-tourism__tag--days">Verified</span>}
              </div>
              {op.packagesOffered.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--colour-ink-faint)", margin: "0 0 var(--space-2)" }}>Packages</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {op.packagesOffered.slice(0, 2).map((pkg, i) => (
                      <div key={i} style={{ fontSize: "0.85rem", padding: "var(--space-2) var(--space-3)", background: "var(--colour-canvas)", borderRadius: "var(--radius-sm)" }}>
                        <strong>{pkg.name}</strong> - {pkg.price} ({pkg.duration})
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="public-tourism__operator-contact">
                {op.contactPerson && <span>Contact: {op.contactPerson}</span>}
                <a href={`tel:${op.phone}`}>{op.phone}</a>
                <a href={`mailto:${op.email}`}>{op.email}</a>
                {op.website && <a href={op.website} target="_blank" rel="noopener noreferrer">Visit Website</a>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="public-tourism__empty"><p>No verified operators found.</p></div>}
        </div>
      )}
      <div style={{ marginTop: "var(--space-6)", textAlign: "center", padding: "var(--space-5)", background: "var(--colour-brand-tint)", borderRadius: "var(--radius-lg)" }}>
        <h3 style={{ margin: "0 0 var(--space-2)" }}>Need a Custom Tour?</h3>
        <p style={{ color: "var(--colour-ink-soft)", margin: "0 0 var(--space-4)" }}>Our concierge team can connect you with the right operator for your needs.</p>
        <Link to={ROUTES.PUBLIC_TOURISM_ENQUIRY} className="btn btn--primary">Submit Enquiry</Link>
      </div>
    </div>
  );
}

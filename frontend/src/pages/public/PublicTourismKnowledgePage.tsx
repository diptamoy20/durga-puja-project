import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { publicTourismService } from "@/services/tourismService";
import type { TourismKnowledge } from "@/types/tourism";
import "@/styles/public-tourism.css";

export function PublicTourismKnowledgePage() {
  const [items, setItems] = useState<TourismKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    publicTourismService.knowledge.list()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(items.map((i) => i.category))).sort();
  const filtered = categoryFilter ? items.filter((i) => i.category === categoryFilter) : items;

  return (
    <div className="public-tourism-list">
      <Link to={ROUTES.PUBLIC_TOURISM_CONCIERGE} className="public-tourism-list__back">Back to Tourism Concierge</Link>
      <div className="public-tourism-list__header">
        <h1 className="public-tourism-list__title">Travel Knowledge Base</h1>
        <p className="public-tourism-list__subtitle">Essential guides on rituals, etiquette, food, and what to pack for Durga Puja.</p>
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
        <div className="public-tourism__loading">Loading guides...</div>
      ) : (
        <div className="public-tourism__card-grid">
          {filtered.map((item) => (
            <div key={item.id} className="public-tourism__knowledge-card">
              <div className="public-tourism__knowledge-card-category">{item.category}</div>
              <h3 className="public-tourism__knowledge-card-title">{item.title}</h3>
              <p className="public-tourism__knowledge-card-content">{item.content.slice(0, 200)}...</p>
              {item.quickTips.length > 0 && (
                <ul className="public-tourism__knowledge-card-tips">
                  {item.quickTips.slice(0, 4).map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div className="public-tourism__empty"><p>No guides found for the selected category.</p></div>}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { adminTourismService } from '@/services/tourismService';
import { categoryService } from '@/services/contentService';
import { ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import type { TourismKnowledge } from '@/types/tourism';

const DEFAULT_MASTER_CATEGORIES = [
  'Cultural Etiquette',
  'Crowd Safety & Timing',
  'Emergency & Police Assistance',
  'VIP Passes & Diaspora Services',
  'Food & Feasts',
  'Photography & Media Guidelines',
  'Transport & Metro Navigation',
  'Accessibility & Senior Citizen Care',
  'Puja Ritual Schedules',
  'Traditional Attire & Sanctum Protocols',
];

export function TourismKnowledgeManagePage() {
  const [knowledgeList, setKnowledgeList] = useState<TourismKnowledge[]>([]);
  const [masterCategories, setMasterCategories] = useState<string[]>(DEFAULT_MASTER_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TourismKnowledge | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [formData, setFormData] = useState({
    category: 'Cultural Etiquette',
    title: '',
    content: '',
    quickTips: 'Wear comfortable walking footwear, Keep hydration and wet wipes, Respect traditional sanctum protocols',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadKnowledge();
    loadMasterCategories();
  }, []);

  const loadMasterCategories = async () => {
    try {
      const activeCats = await categoryService.listActive();
      const catNames = (activeCats || []).map((c) => c.name).filter(Boolean);
      setMasterCategories((prev) => {
        const combined = new Set([...DEFAULT_MASTER_CATEGORIES, ...prev, ...catNames]);
        return Array.from(combined);
      });
    } catch (err) {
      console.warn('Could not fetch master categories from contentService, using defaults:', err);
    }
  };

  const loadKnowledge = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminTourismService.knowledge.list();
      const items = res.items || [];
      setKnowledgeList(items);

      // Merge any existing categories from the database into the master category list
      const existingCats = items.map((i) => i.category).filter(Boolean);
      setMasterCategories((prev) => {
        const combined = new Set([...prev, ...existingCats]);
        return Array.from(combined);
      });
    } catch (err) {
      console.error('Failed to load knowledge:', err);
      setError('Unable to load travel knowledge base.');
    } finally {
      setLoading(false);
    }
  };

  // Distinct categories from existing items for filtering with item counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of knowledgeList) {
      const cat = item.category || 'Uncategorized';
      map[cat] = (map[cat] || 0) + 1;
    }
    return map;
  }, [knowledgeList]);

  const uniqueAvailableCategories = useMemo(() => {
    const set = new Set([...masterCategories, ...Object.keys(categoryCounts)]);
    return Array.from(set).sort();
  }, [masterCategories, categoryCounts]);

  const filteredKnowledgeList = useMemo(() => {
    return knowledgeList.filter((item) => {
      const matchCategory =
        selectedCategoryFilter === 'all' ||
        item.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.quickTips && item.quickTips.some((tip) => tip.toLowerCase().includes(q)));

      return matchCategory && matchQuery;
    });
  }, [knowledgeList, selectedCategoryFilter, searchQuery]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    const defaultCat = masterCategories[0] || 'Cultural Etiquette';
    setFormData({
      category: defaultCat,
      title: '',
      content: '',
      quickTips: 'Wear comfortable walking footwear, Keep hydration and wet wipes, Respect traditional sanctum protocols',
      sortOrder: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: TourismKnowledge) => {
    setEditingItem(item);
    const isCustom = !masterCategories.includes(item.category);
    setIsCustomCategory(isCustom);
    setCustomCategoryInput(isCustom ? item.category : '');
    setFormData({
      category: item.category,
      title: item.title,
      content: item.content,
      quickTips: (item.quickTips || []).join(', '),
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleCategorySelectChange = (value: string) => {
    if (value === '__custom__') {
      setIsCustomCategory(true);
      setCustomCategoryInput('');
      setFormData((p) => ({ ...p, category: '' }));
    } else {
      setIsCustomCategory(false);
      setCustomCategoryInput('');
      setFormData((p) => ({ ...p, category: value }));
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete guide "${title}"?`)) return;
    try {
      await adminTourismService.knowledge.remove(id);
      setKnowledgeList((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error('Failed to delete guide:', err);
      alert('Failed to delete travel guide.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = (isCustomCategory ? customCategoryInput.trim() : formData.category.trim());
    if (!finalCategory) {
      alert('Please select or specify a category.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        category: finalCategory,
        quickTips: formData.quickTips.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (editingItem) {
        await adminTourismService.knowledge.update(editingItem.id, payload);
      } else {
        await adminTourismService.knowledge.create(payload);
      }

      // Add category to master list if custom
      if (!masterCategories.includes(finalCategory)) {
        setMasterCategories((prev) => [...prev, finalCategory]);
      }

      setShowModal(false);
      loadKnowledge();
    } catch (err) {
      console.error('Failed to save knowledge:', err);
      alert('Failed to save travel guide.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Knowledge Base & Guidelines"
        description="Manage festival guidelines, safety advisories, and VIP pass protocols."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Tourism Concierge' }]}
        actions={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            + Add Travel Guide
          </Button>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {/* Filter Card */}
      <Card className="mb-4">
        <form className="form-grid form-grid--3" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label className="field__label" htmlFor="knowledge-cat-filter">
              Category
            </label>
            <select
              id="knowledge-cat-filter"
              className="field__control"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories ({knowledgeList.length})</option>
              {uniqueAvailableCategories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                return (
                  <option key={cat} value={cat}>
                    {cat} {count > 0 ? `(${count})` : '(0)'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="knowledge-search">
              Search
            </label>
            <input
              id="knowledge-search"
              type="search"
              className="field__control"
              placeholder="Search title, content, or tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="field" style={{ alignSelf: 'end' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {(selectedCategoryFilter !== 'all' || searchQuery) && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setSelectedCategoryFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>

      {/* Table Card */}
      <Card>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Guide Title</th>
                <th>Content Preview</th>
                <th>Quick Tips</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Loading travel knowledge base…
                  </td>
                </tr>
              ) : filteredKnowledgeList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    No travel guides found.
                  </td>
                </tr>
              ) : (
                filteredKnowledgeList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Badge variant="info">{item.category}</Badge>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--colour-ink-soft)', fontSize: '13px' }}>
                        {item.content}
                      </div>
                    </td>
                    <td>
                      {item.quickTips?.length ? (
                        <span style={{ fontSize: '12.5px', color: 'var(--colour-ink-soft)' }}>
                          {item.quickTips.slice(0, 2).join(' • ')}
                          {item.quickTips.length > 2 && ` (+${item.quickTips.length - 2} more)`}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--colour-ink-faint)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {item.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Draft</Badge>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(item)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id, item.title)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        title={editingItem ? 'Edit Travel Guide' : 'Create New Travel Guide'}
        onClose={() => setShowModal(false)}
        footer={
          <div className="form-actions">
            <Button variant="secondary" size="md" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingItem ? 'Update Guide' : 'Create Guide'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave}>
          <div className="field">
            <label className="field__label" htmlFor="guide-category-select">
              Category <span className="field__required">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: isCustomCategory ? '1fr 1fr' : '1fr', gap: 'var(--space-2)' }}>
              <select
                id="guide-category-select"
                required={!isCustomCategory}
                className="field__control"
                value={isCustomCategory ? '__custom__' : formData.category}
                onChange={(e) => handleCategorySelectChange(e.target.value)}
              >
                <optgroup label="Categories">
                  {masterCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom Option">
                  <option value="__custom__">+ Enter Custom Category...</option>
                </optgroup>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  required
                  className="field__control"
                  placeholder="Type new custom category..."
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  autoFocus
                />
              )}
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="guide-title">
              Guide Title <span className="field__required">*</span>
            </label>
            <input
              id="guide-title"
              type="text"
              required
              className="field__control"
              placeholder="e.g. Traditional Attire & Sanctum Protocols"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="guide-content">
              Detailed Advisory & Guidelines <span className="field__required">*</span>
            </label>
            <textarea
              id="guide-content"
              rows={4}
              required
              className="field__control"
              placeholder="Provide comprehensive instructions, background cultural context, and DOs and DONTs..."
              value={formData.content}
              onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="guide-tips">
              Quick Practical Tips (comma-separated)
            </label>
            <input
              id="guide-tips"
              type="text"
              className="field__control"
              placeholder="e.g. Wear comfortable walking shoes, Keep hydration, Respect sanctum rules"
              value={formData.quickTips}
              onChange={(e) => setFormData((p) => ({ ...p, quickTips: e.target.value }))}
            />
          </div>

          <div className="field">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              />
              <span>Publish this guide to Public Tourism Hub</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}

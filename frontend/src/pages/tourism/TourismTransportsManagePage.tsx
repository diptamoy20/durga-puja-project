import { useState, useEffect, useMemo } from 'react';
import { adminTourismService } from '@/services/tourismService';
import { categoryService, subcategoryService } from '@/services/contentService';
import { ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import type { TourismTransport } from '@/types/tourism';
import type { Category, Subcategory } from '@/types/content';

const DEFAULT_TRANSPORT_SUBCATEGORIES = [
  'Metro Corridor',
  'Special AC Bus / Parikrama Coach',
  'Heritage River Cruise & Ferry',
  'Tourist Taxi & App Cab',
  'Suburban Railway',
  'Heritage Tramway',
  'E-Rickshaw & Local Shuttle',
];

export function TourismTransportsManagePage() {
  const [transports, setTransports] = useState<TourismTransport[]>([]);
  const [transportCategory, setTransportCategory] = useState<Category | null>(null);
  const [masterSubcategories, setMasterSubcategories] = useState<string[]>(DEFAULT_TRANSPORT_SUBCATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TourismTransport | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Metro Corridor',
    operatingHours: '6:00 AM - 4:00 AM (All-Night on Saptami, Ashtami, Navami)',
    routeDescription: '',
    fareGuide: '₹5 to ₹25 (Tourist Smart Card available)',
    bookingOrHelpline: '',
    coverImageUrl: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load Transports
      const transportRes = await adminTourismService.transports.list();
      const items = transportRes.items || [];
      setTransports(items);

      // 2. Load Master Taxonomy: Category "Transport" and its Subcategories
      try {
        const categories = await categoryService.listActive();
        let transCat = categories.find(
          (c) => c.slug.toLowerCase() === 'transport' || c.name.toLowerCase() === 'transport',
        );

        if (!transCat && categories.length > 0) {
          // If not existing yet, attempt to find by partial match or fallback
          transCat = categories.find((c) => c.name.toLowerCase().includes('transport'));
        }

        if (transCat) {
          setTransportCategory(transCat);
          const subRes = await subcategoryService.list({
            categoryId: transCat.id,
            status: 'ACTIVE',
            perPage: 100,
          });
          const fetchedSubNames = (subRes.items || []).map((s: Subcategory) => s.name);
          const existingTransportCats = items.map((i) => i.category).filter(Boolean);
          const merged = Array.from(
            new Set([...fetchedSubNames, ...DEFAULT_TRANSPORT_SUBCATEGORIES, ...existingTransportCats]),
          );
          setMasterSubcategories(merged);
        } else {
          const existingTransportCats = items.map((i) => i.category).filter(Boolean);
          setMasterSubcategories(
            Array.from(new Set([...DEFAULT_TRANSPORT_SUBCATEGORIES, ...existingTransportCats])),
          );
        }
      } catch (catErr) {
        console.warn('Could not load master taxonomy categories/subcategories:', catErr);
        const existingTransportCats = items.map((i) => i.category).filter(Boolean);
        setMasterSubcategories(
          Array.from(new Set([...DEFAULT_TRANSPORT_SUBCATEGORIES, ...existingTransportCats])),
        );
      }
    } catch (err) {
      console.error('Failed to load transports:', err);
      setError('Unable to load festive transport options.');
    } finally {
      setLoading(false);
    }
  };

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of transports) {
      const cat = item.category || 'Uncategorized';
      map[cat] = (map[cat] || 0) + 1;
    }
    return map;
  }, [transports]);

  const uniqueAvailableCategories = useMemo(() => {
    const set = new Set([...masterSubcategories, ...Object.keys(categoryCounts)]);
    return Array.from(set).sort();
  }, [masterSubcategories, categoryCounts]);

  const filteredTransports = useMemo(() => {
    return transports.filter((item) => {
      const matchCategory =
        selectedCategoryFilter === 'all' ||
        item.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.routeDescription.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchCategory && matchQuery;
    });
  }, [transports, selectedCategoryFilter, searchQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Selected image exceeds 15MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const resultStr = readerEvent.target?.result;
      if (typeof resultStr !== 'string') return;

      const img = new Image();
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({ ...prev, coverImageUrl: compressedDataUrl }));
        } else {
          setFormData((prev) => ({ ...prev, coverImageUrl: resultStr }));
        }
      };
      img.onerror = () => {
        setFormData((prev) => ({ ...prev, coverImageUrl: resultStr }));
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    const defaultCat = masterSubcategories[0] || 'Metro Corridor';
    setFormData({
      name: '',
      category: defaultCat,
      operatingHours: '6:00 AM - 4:00 AM (All-Night on Saptami, Ashtami, Navami)',
      routeDescription: '',
      fareGuide: '₹5 to ₹25 (Tourist Smart Card available)',
      bookingOrHelpline: '',
      coverImageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      sortOrder: 0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: TourismTransport) => {
    setEditingItem(item);
    const isCustom = !masterSubcategories.includes(item.category);
    setIsCustomCategory(isCustom);
    setCustomCategoryInput(isCustom ? item.category : '');
    setFormData({
      name: item.name,
      category: item.category,
      operatingHours: item.operatingHours,
      routeDescription: item.routeDescription,
      fareGuide: item.fareGuide,
      bookingOrHelpline: item.bookingOrHelpline || '',
      coverImageUrl: item.coverImageUrl || '',
      isActive: item.isActive,
      sortOrder: item.sortOrder || 0,
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

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete transport option "${name}"?`)) return;
    try {
      await adminTourismService.transports.remove(id);
      setTransports((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete transport option:', err);
      alert('Failed to delete transport option.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isCustomCategory ? customCategoryInput.trim() : formData.category.trim();
    if (!finalCategory) {
      alert('Please select or enter a transport subcategory.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        category: finalCategory,
      };

      if (editingItem) {
        await adminTourismService.transports.update(editingItem.id, payload);
      } else {
        await adminTourismService.transports.create(payload);
      }

      // If custom subcategory, sync to master taxonomy if transportCategory is available
      if (isCustomCategory && transportCategory) {
        try {
          await subcategoryService.create({
            categoryId: transportCategory.id,
            name: finalCategory,
            slug: finalCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: `${finalCategory} transport option for festive transit.`,
            status: 'ACTIVE',
          });
        } catch {
          // Ignore if already created or backend synced
        }
      }

      if (!masterSubcategories.includes(finalCategory)) {
        setMasterSubcategories((prev) => [...prev, finalCategory]);
      }

      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      console.error('Failed to save transport:', err);
      const errMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        'Failed to save transport.';
      alert(`Error saving transport: ${errMsg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Festive Transit & Transports"
        description="Manage Durga Puja transport options and festive travel routes."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Tourism Concierge' }]}
        actions={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            + Add Transport Option
          </Button>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {/* Filter Card */}
      <Card className="mb-4">
        <form
          className="form-grid form-grid--3"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="field">
            <label className="field__label" htmlFor="transport-search">
              Search Transit Route / Mode
            </label>
            <input
              id="transport-search"
              type="search"
              className="field__control"
              placeholder="Search metro, bus, ferry, route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="transport-category-filter">
              Transport Subcategory Filter
            </label>
            <select
              id="transport-category-filter"
              className="field__control"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            >
              <option value="all">🌐 All Subcategories ({transports.length})</option>
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

          <div className="field" style={{ alignSelf: 'end' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setSelectedCategoryFilter('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
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
                <th style={{ width: '80px' }}>Cover</th>
                <th>Transport Service Name</th>
                <th>Transport Subcategory</th>
                <th>Route & Operating Schedule</th>
                <th>Fare & Helpline</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Loading festive transports…
                  </td>
                </tr>
              ) : filteredTransports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    {transports.length === 0
                      ? 'No transport options found.'
                      : 'No transport options match the selected subcategory filter.'}
                  </td>
                </tr>
              ) : (
                filteredTransports.map((t) => (
                  <tr key={t.id}>
                    <td>
                      {t.coverImageUrl ? (
                        <img
                          src={t.coverImageUrl}
                          alt={t.name}
                          style={{
                            width: '56px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid var(--colour-border)',
                            display: 'block',
                          }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '56px',
                            height: '40px',
                            borderRadius: '4px',
                            background: 'var(--colour-canvas)',
                            border: '1px solid var(--colour-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                          }}
                        >
                          🚇
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--colour-brand)' }}>{t.name}</div>
                    </td>
                    <td>
                      <span
                        className="badge badge--success"
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                        onClick={() => setSelectedCategoryFilter(t.category)}
                        title="Click to filter by this subcategory"
                      >
                        🏷️ {t.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px' }}>
                      <div style={{ fontWeight: 600 }}>{t.routeDescription}</div>
                      <div style={{ color: 'var(--colour-ink-soft)', fontSize: '11.5px', marginTop: '2px' }}>
                        ⏰ {t.operatingHours}
                      </div>
                    </td>
                    <td style={{ fontSize: '12.5px' }}>
                      <div style={{ color: '#d97706', fontWeight: 600 }}>🎟️ {t.fareGuide}</div>
                      {t.bookingOrHelpline && (
                        <div style={{ color: 'var(--colour-ink-soft)', fontSize: '11.5px', marginTop: '2px' }}>
                          📞 {t.bookingOrHelpline}
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge variant={t.isActive ? 'success' : 'neutral'}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-1)' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(t)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(t.id, t.name)}>
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

      {/* Modal with Subcategory Selection */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Transport Option' : 'Add Transport Option'}
      >
        <form onSubmit={handleSave}>
          <div className="field mb-4">
            <label className="field__label" htmlFor="transport-name">
              Transport Service Name *
            </label>
            <input
              id="transport-name"
              type="text"
              className="field__control"
              required
              placeholder="e.g. Green Line Underwater Ganga Metro"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          {/* Subcategory Selection */}
          <div className="field mb-4">
            <label className="field__label" htmlFor="transport-subcategory-select">
              Transport Subcategory *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: isCustomCategory ? '1fr 1fr' : '1fr', gap: '8px' }}>
              <select
                id="transport-subcategory-select"
                className="field__control"
                required={!isCustomCategory}
                value={isCustomCategory ? '__custom__' : formData.category}
                onChange={(e) => handleCategorySelectChange(e.target.value)}
              >
                <optgroup label="Available Subcategories">
                  {masterSubcategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom">
                  <option value="__custom__">➕ Enter New / Custom Transport Subcategory...</option>
                </optgroup>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  className="field__control"
                  required
                  placeholder="Type custom subcategory..."
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  autoFocus
                />
              )}
            </div>
          </div>

          <div className="form-grid form-grid--2 mb-4">
            <div className="field">
              <label className="field__label" htmlFor="transport-hours">
                Operating Schedule & Frequency *
              </label>
              <input
                id="transport-hours"
                type="text"
                className="field__control"
                required
                placeholder="e.g. 6:00 AM - 4:00 AM (Trains every 6 mins)"
                value={formData.operatingHours}
                onChange={(e) => setFormData((p) => ({ ...p, operatingHours: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="transport-fare">
                Fare Guide & Ticketing *
              </label>
              <input
                id="transport-fare"
                type="text"
                className="field__control"
                required
                placeholder="e.g. ₹5 to ₹25 (Tourist Smart Card available)"
                value={formData.fareGuide}
                onChange={(e) => setFormData((p) => ({ ...p, fareGuide: e.target.value }))}
              />
            </div>
          </div>

          <div className="field mb-4">
            <label className="field__label" htmlFor="transport-route">
              Route & Connectivity Description *
            </label>
            <textarea
              id="transport-route"
              className="field__control"
              rows={2}
              required
              placeholder="e.g. Howrah Maidan to Esplanade connecting North & South transit hubs under the Hooghly river..."
              value={formData.routeDescription}
              onChange={(e) => setFormData((p) => ({ ...p, routeDescription: e.target.value }))}
            />
          </div>

          <div className="field mb-4">
            <label className="field__label" htmlFor="transport-helpline">
              Helpline / Official Booking Info
            </label>
            <input
              id="transport-helpline"
              type="text"
              className="field__control"
              placeholder="e.g. Metro Helpline: 1800-345-6789 / www.mtp.indianrailways.gov.in"
              value={formData.bookingOrHelpline}
              onChange={(e) => setFormData((p) => ({ ...p, bookingOrHelpline: e.target.value }))}
            />
          </div>

          {/* Cover Photo / Image Upload Section */}
          <div className="field mb-4" style={{ background: 'var(--colour-canvas)', border: '1px solid var(--colour-border)', borderRadius: '8px', padding: '14px' }}>
            <label className="field__label" style={{ marginBottom: '8px' }}>
              📸 Transport Cover Photo & Thumbnail
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  📁 Upload Photo from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '12px', color: 'var(--colour-ink-soft)' }}>or enter image URL:</span>
              </div>

              <input
                type="text"
                className="field__control"
                placeholder="https://images.unsplash.com/... or paste image URL"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData((p) => ({ ...p, coverImageUrl: e.target.value }))}
              />

              {formData.coverImageUrl && (
                <div style={{ position: 'relative', marginTop: '6px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--colour-border)', maxHeight: '140px', background: '#000' }}>
                  <img
                    src={formData.coverImageUrl}
                    alt="Transport Preview"
                    style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, coverImageUrl: '' }))}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✕ Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="checkbox-grid mb-4">
            <label className="field__label checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              />
              Active Transport Option
            </label>
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button type="button" variant="secondary" size="md" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? 'Saving...' : editingItem ? 'Update Transport' : 'Create Transport'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

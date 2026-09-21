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
import type { TourismCircuit } from '@/types/tourism';
import type { Category, Subcategory } from '@/types/content';

const DEFAULT_CIRCUIT_SUBCATEGORIES = [
  'North Kolkata Heritage & Bonedi Bari',
  'South Kolkata Contemporary & Art Odyssey',
  'Central Kolkata & Colonial Riverbank',
  'Salt Lake & Eastern Corridor',
  'Howrah & Hooghly Riverfront',
  'Rarh Bengal & Santiniketan',
];

export function TourismCircuitsManagePage() {
  const [circuits, setCircuits] = useState<TourismCircuit[]>([]);
  const [circuitCategory, setCircuitCategory] = useState<Category | null>(null);
  const [masterSubcategories, setMasterSubcategories] = useState<string[]>(DEFAULT_CIRCUIT_SUBCATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCircuit, setEditingCircuit] = useState<TourismCircuit | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);
  const [customSubcategoryInput, setCustomSubcategoryInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    region: 'North Kolkata Heritage & Bonedi Bari',
    description: '',
    duration: '1 Day (8 - 10 Hours)',
    bestTimeOfDay: 'Morning 8:00 AM - 1:00 PM',
    recommendedTransport: 'AC Metro + Walking Trail',
    crowdLevel: 'Moderate to High',
    tags: 'Heritage, Bonedi Bari, Traditional',
    coverImageUrl: '',
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load Circuits
      const circuitRes = await adminTourismService.circuits.list();
      const items = circuitRes.items || [];
      setCircuits(items);

      // 2. Load Master Taxonomy: Category "Circuit" and its Subcategories
      try {
        const categories = await categoryService.listActive();
        let circCat = categories.find(
          (c) => c.slug.toLowerCase() === 'circuit' || c.name.toLowerCase() === 'circuit',
        );

        if (!circCat && categories.length > 0) {
          circCat = categories.find((c) => c.name.toLowerCase().includes('circuit'));
        }

        if (circCat) {
          setCircuitCategory(circCat);
          const subRes = await subcategoryService.list({
            categoryId: circCat.id,
            status: 'ACTIVE',
            perPage: 100,
          });
          const fetchedSubNames = (subRes.items || []).map((s: Subcategory) => s.name);
          const existingCircuitRegions = items.map((i) => i.region).filter(Boolean);
          const merged = Array.from(
            new Set([...fetchedSubNames, ...DEFAULT_CIRCUIT_SUBCATEGORIES, ...existingCircuitRegions]),
          );
          setMasterSubcategories(merged);
        } else {
          const existingCircuitRegions = items.map((i) => i.region).filter(Boolean);
          setMasterSubcategories(
            Array.from(new Set([...DEFAULT_CIRCUIT_SUBCATEGORIES, ...existingCircuitRegions])),
          );
        }
      } catch (catErr) {
        console.warn('Could not load master taxonomy categories/subcategories:', catErr);
        const existingCircuitRegions = items.map((i) => i.region).filter(Boolean);
        setMasterSubcategories(
          Array.from(new Set([...DEFAULT_CIRCUIT_SUBCATEGORIES, ...existingCircuitRegions])),
        );
      }
    } catch (err) {
      console.error('Failed to load circuits:', err);
      setError('Unable to load circuits.');
    } finally {
      setLoading(false);
    }
  };

  const subcategoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of circuits) {
      const reg = item.region || 'Uncategorized';
      map[reg] = (map[reg] || 0) + 1;
    }
    return map;
  }, [circuits]);

  const uniqueAvailableSubcategories = useMemo(() => {
    const set = new Set([...masterSubcategories, ...Object.keys(subcategoryCounts)]);
    return Array.from(set).sort();
  }, [masterSubcategories, subcategoryCounts]);

  const filteredCircuits = useMemo(() => {
    return circuits.filter((item) => {
      const matchSubcategory =
        selectedSubcategoryFilter === 'all' ||
        item.region.toLowerCase() === selectedSubcategoryFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(q)));

      return matchSubcategory && matchQuery;
    });
  }, [circuits, selectedSubcategoryFilter, searchQuery]);

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
    setEditingCircuit(null);
    setIsCustomSubcategory(false);
    setCustomSubcategoryInput('');
    const defaultSub = masterSubcategories[0] || 'North Kolkata Heritage & Bonedi Bari';
    setFormData({
      name: '',
      slug: '',
      region: defaultSub,
      description: '',
      duration: '1 Day (8 - 10 Hours)',
      bestTimeOfDay: 'Morning 8:00 AM - 1:00 PM',
      recommendedTransport: 'AC Metro + Walking Trail',
      crowdLevel: 'Moderate to High',
      tags: 'Heritage, Bonedi Bari, Traditional',
      coverImageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
      isFeatured: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (circuit: TourismCircuit) => {
    setEditingCircuit(circuit);
    const isCustom = !masterSubcategories.includes(circuit.region);
    setIsCustomSubcategory(isCustom);
    setCustomSubcategoryInput(isCustom ? circuit.region : '');
    setFormData({
      name: circuit.name,
      slug: circuit.slug,
      region: circuit.region,
      description: circuit.description,
      duration: circuit.duration,
      bestTimeOfDay: circuit.bestTimeOfDay || 'Morning & Afternoon',
      recommendedTransport: circuit.recommendedTransport || 'Metro + Walking',
      crowdLevel: circuit.crowdLevel || 'Moderate',
      tags: Array.isArray(circuit.tags) ? circuit.tags.join(', ') : (circuit.tags || ''),
      coverImageUrl: circuit.coverImageUrl || '',
      isFeatured: circuit.isFeatured,
      isActive: circuit.isActive,
    });
    setShowModal(true);
  };

  const handleSubcategorySelectChange = (value: string) => {
    if (value === '__custom__') {
      setIsCustomSubcategory(true);
      setCustomSubcategoryInput('');
      setFormData((p) => ({ ...p, region: '' }));
    } else {
      setIsCustomSubcategory(false);
      setCustomSubcategoryInput('');
      setFormData((p) => ({ ...p, region: value }));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete circuit "${name}"?`)) return;
    try {
      await adminTourismService.circuits.remove(id);
      setCircuits((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete circuit:', err);
      alert('Failed to delete circuit.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubcategory = isCustomSubcategory ? customSubcategoryInput.trim() : formData.region.trim();
    if (!finalSubcategory) {
      alert('Please select or enter a circuit subcategory.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        region: finalSubcategory,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tags: typeof formData.tags === 'string'
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : formData.tags,
      };

      if (editingCircuit) {
        await adminTourismService.circuits.update(editingCircuit.id, payload);
      } else {
        await adminTourismService.circuits.create(payload);
      }

      // If custom subcategory was entered, sync to master taxonomy if circuitCategory is available
      if (isCustomSubcategory && circuitCategory) {
        try {
          await subcategoryService.create({
            categoryId: circuitCategory.id,
            name: finalSubcategory,
            slug: finalSubcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: `${finalSubcategory} circuit subcategory for Durga Puja pilgrimage trails.`,
            status: 'ACTIVE',
          });
        } catch {
          // Ignore if already created or backend synced
        }
      }

      if (!masterSubcategories.includes(finalSubcategory)) {
        setMasterSubcategories((prev) => [...prev, finalSubcategory]);
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to save circuit:', err);
      alert('Failed to save circuit. Please check details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Pilgrimage Circuits"
        description="Manage curated pilgrimage circuits, highlighted pandals, route logistics, and featured status."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Tourism Concierge' }]}
        actions={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            + Create Circuit
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
            <label className="field__label" htmlFor="circuit-search">
              Search Circuit
            </label>
            <input
              id="circuit-search"
              type="search"
              className="field__control"
              placeholder="Search circuit name, description, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="circuit-subcategory-filter">
              Circuit Subcategory Filter
            </label>
            <select
              id="circuit-subcategory-filter"
              className="field__control"
              value={selectedSubcategoryFilter}
              onChange={(e) => setSelectedSubcategoryFilter(e.target.value)}
            >
              <option value="all">🌐 All Subcategories ({circuits.length})</option>
              {uniqueAvailableSubcategories.map((reg) => {
                const count = subcategoryCounts[reg] || 0;
                return (
                  <option key={reg} value={reg}>
                    {reg} {count > 0 ? `(${count})` : '(0)'}
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
                  setSelectedSubcategoryFilter('all');
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
                <th>Circuit Name</th>
                <th>Circuit Region / Trail</th>
                <th>Duration & Timings</th>
                <th>Crowd Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Loading pilgrimage circuits…
                  </td>
                </tr>
              ) : filteredCircuits.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    {circuits.length === 0
                      ? 'No circuits found.'
                      : 'No circuits match the selected subcategory filter.'}
                  </td>
                </tr>
              ) : (
                filteredCircuits.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.coverImageUrl ? (
                        <img
                          src={c.coverImageUrl}
                          alt={c.name}
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
                          🗺️
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--colour-brand)' }}>{c.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--colour-ink-soft)', marginTop: '2px' }}>
                        /{c.slug}
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge badge--success"
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                        onClick={() => setSelectedSubcategoryFilter(c.region)}
                        title="Click to filter by this subcategory"
                      >
                        🏷️ {c.region}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px' }}>
                      <div style={{ fontWeight: 600 }}>⏳ {c.duration}</div>
                      {c.bestTimeOfDay && (
                        <div style={{ color: 'var(--colour-ink-soft)', fontSize: '11.5px', marginTop: '2px' }}>
                          ⏰ {c.bestTimeOfDay}
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge variant="info">{c.crowdLevel || 'Moderate'}</Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <Badge variant={c.isActive ? 'success' : 'neutral'}>
                          {c.isActive ? 'Active' : 'Draft'}
                        </Badge>
                        {c.isFeatured && (
                          <Badge variant="warning">
                            ⭐ Featured
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-1)' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(c)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(c.id, c.name)}>
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
        title={editingCircuit ? 'Edit Pilgrimage Circuit' : 'Create Pilgrimage Circuit'}
      >
        <form onSubmit={handleSave}>
          <div className="field mb-4">
            <label className="field__label" htmlFor="circuit-name">
              Circuit Name *
            </label>
            <input
              id="circuit-name"
              type="text"
              className="field__control"
              required
              placeholder="e.g. North Kolkata Heritage & Bonedi Bari Trail"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          {/* Subcategory Selection */}
          <div className="field mb-4">
            <label className="field__label" htmlFor="circuit-subcategory-select">
              Circuit Region / Trail *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: isCustomSubcategory ? '1fr 1fr' : '1fr', gap: '8px' }}>
              <select
                id="circuit-subcategory-select"
                className="field__control"
                required={!isCustomSubcategory}
                value={isCustomSubcategory ? '__custom__' : formData.region}
                onChange={(e) => handleSubcategorySelectChange(e.target.value)}
              >
                <optgroup label="Available Circuit Regions">
                  {masterSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom">
                  <option value="__custom__">➕ Enter New / Custom Circuit Subcategory...</option>
                </optgroup>
              </select>

              {isCustomSubcategory && (
                <input
                  type="text"
                  className="field__control"
                  required
                  placeholder="Type custom circuit subcategory..."
                  value={customSubcategoryInput}
                  onChange={(e) => setCustomSubcategoryInput(e.target.value)}
                  autoFocus
                />
              )}
            </div>
          </div>

          <div className="form-grid form-grid--2 mb-4">
            <div className="field">
              <label className="field__label" htmlFor="circuit-duration">
                Duration Estimate *
              </label>
              <input
                id="circuit-duration"
                type="text"
                className="field__control"
                required
                placeholder="e.g. 1 Day (8 - 10 Hours)"
                value={formData.duration}
                onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="circuit-time">
                Best Time of Day
              </label>
              <input
                id="circuit-time"
                type="text"
                className="field__control"
                placeholder="e.g. Morning 8:00 AM - 1:00 PM"
                value={formData.bestTimeOfDay}
                onChange={(e) => setFormData((p) => ({ ...p, bestTimeOfDay: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-grid form-grid--2 mb-4">
            <div className="field">
              <label className="field__label" htmlFor="circuit-transport">
                Recommended Transport
              </label>
              <input
                id="circuit-transport"
                type="text"
                className="field__control"
                placeholder="e.g. AC Metro + Walking Trail"
                value={formData.recommendedTransport}
                onChange={(e) => setFormData((p) => ({ ...p, recommendedTransport: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="circuit-crowd">
                Crowd Level
              </label>
              <select
                id="circuit-crowd"
                className="field__control"
                value={formData.crowdLevel}
                onChange={(e) => setFormData((p) => ({ ...p, crowdLevel: e.target.value }))}
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="Moderate to High">Moderate to High</option>
                <option value="High">High</option>
                <option value="Peak">Peak</option>
              </select>
            </div>
          </div>

          <div className="field mb-4">
            <label className="field__label" htmlFor="circuit-description">
              Overview & Cultural Description *
            </label>
            <textarea
              id="circuit-description"
              className="field__control"
              rows={3}
              required
              placeholder="Describe the historical and cultural highlights of this circuit..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="field mb-4">
            <label className="field__label" htmlFor="circuit-tags">
              Tags (comma-separated)
            </label>
            <input
              id="circuit-tags"
              type="text"
              className="field__control"
              placeholder="e.g. Heritage, Bonedi Bari, Traditional, North Kolkata"
              value={formData.tags}
              onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
            />
          </div>

          {/* Cover Photo / Image Upload Section */}
          <div className="field mb-4" style={{ background: 'var(--colour-canvas)', border: '1px solid var(--colour-border)', borderRadius: '8px', padding: '14px' }}>
            <label className="field__label" style={{ marginBottom: '8px' }}>
              📸 Circuit Cover Photo & Banner
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
                    alt="Circuit Preview"
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
                checked={formData.isFeatured}
                onChange={(e) => setFormData((p) => ({ ...p, isFeatured: e.target.checked }))}
              />
              ⭐ Featured Circuit on Homepage
            </label>
            <label className="field__label checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              />
              Active & Published
            </label>
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button type="button" variant="secondary" size="md" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? 'Saving...' : editingCircuit ? 'Update Circuit' : 'Create Circuit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

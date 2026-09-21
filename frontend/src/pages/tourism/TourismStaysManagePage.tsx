import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminTourismService } from '@/services/tourismService';
import { ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import type { TourismStay } from '@/types/tourism';

export function TourismStaysManagePage() {
  const [stays, setStays] = useState<TourismStay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wbtdcOnly, setWbtdcOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStay, setEditingStay] = useState<TourismStay | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'Govt Tourism Property',
    location: '',
    city: 'Kolkata',
    district: 'Kolkata',
    priceRange: '₹2,500 - ₹4,500 / night',
    budgetTier: 'MID_RANGE',
    starRating: 3,
    contactPhone: '',
    contactEmail: '',
    bookingUrl: '',
    description: '',
    coverImageUrl: '',
    amenities: 'Air Conditioning, Complimentary Breakfast, Wi-Fi, 24/7 Front Desk',
    isWbtdc: false,
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    loadStays();
  }, [wbtdcOnly]);

  const loadStays = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminTourismService.stays.list({
        isWbtdc: wbtdcOnly ? 'true' : undefined,
      });
      setStays(res.items || []);
    } catch (err) {
      console.error('Failed to load stays:', err);
      setError('Unable to load accommodations.');
    } finally {
      setLoading(false);
    }
  };

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
    setEditingStay(null);
    setFormData({
      name: '',
      slug: '',
      type: 'Govt Tourism Property',
      location: '',
      city: 'Kolkata',
      district: 'Kolkata',
      priceRange: '₹2,500 - ₹4,500 / night',
      budgetTier: 'MID_RANGE',
      starRating: 3,
      contactPhone: '',
      contactEmail: '',
      bookingUrl: '',
      description: '',
      coverImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      amenities: 'Air Conditioning, Complimentary Breakfast, Wi-Fi, 24/7 Front Desk',
      isWbtdc: false,
      isFeatured: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (stay: TourismStay) => {
    setEditingStay(stay);
    setFormData({
      name: stay.name,
      slug: stay.slug,
      type: stay.type,
      location: stay.location,
      city: stay.city || 'Kolkata',
      district: stay.district || 'Kolkata',
      priceRange: stay.priceRange,
      budgetTier: stay.budgetTier,
      starRating: stay.starRating || 3,
      contactPhone: stay.contactPhone || '',
      contactEmail: stay.contactEmail || '',
      bookingUrl: stay.bookingUrl || '',
      description: stay.description || '',
      coverImageUrl: stay.coverImageUrl || '',
      amenities: Array.isArray(stay.amenities) ? stay.amenities.join(', ') : (stay.amenities || ''),
      isWbtdc: stay.isWbtdc,
      isFeatured: stay.isFeatured,
      isActive: stay.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete accommodation "${name}"?`)) return;
    try {
      await adminTourismService.stays.remove(id);
      setStays((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete stay:', err);
      alert('Failed to delete accommodation.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        amenities: typeof formData.amenities === 'string'
          ? formData.amenities.split(',').map((a) => a.trim()).filter(Boolean)
          : formData.amenities,
      };

      if (editingStay) {
        await adminTourismService.stays.update(editingStay.id, payload);
      } else {
        await adminTourismService.stays.create(payload);
      }
      setShowModal(false);
      loadStays();
    } catch (err) {
      console.error('Failed to save stay:', err);
      alert('Failed to save accommodation.');
    } finally {
      setSaving(false);
    }
  };

  const filteredStays = stays.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page">
      <PageHeader
        title="Stays & Accommodations"
        description="Manage WBTDCL tourist lodges, verified heritage hotels, luxury properties, and pricing tiers."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Tourism Concierge' }]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Link to={ROUTES.PUBLIC_TOURISM_STAYS} target="_blank" className="btn btn--secondary btn--md">
              Public View ↗
            </Link>
            <Button variant="primary" size="md" onClick={handleOpenCreate}>
              + Add Accommodation
            </Button>
          </div>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {/* Filter Card */}
      <Card className="mb-4">
        <form className="form-grid form-grid--3" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label className="field__label" htmlFor="stay-search">
              Search Properties
            </label>
            <input
              id="stay-search"
              type="search"
              className="field__control"
              placeholder="Search by name, district, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="stay-filter-govt">
              Authority Filter
            </label>
            <select
              id="stay-filter-govt"
              className="field__control"
              value={wbtdcOnly ? 'wbtdc' : 'all'}
              onChange={(e) => setWbtdcOnly(e.target.value === 'wbtdc')}
            >
              <option value="all">All Properties ({stays.length})</option>
              <option value="wbtdc">Official WBTDCL Properties Only</option>
            </select>
          </div>

          <div className="field" style={{ alignSelf: 'end' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {(searchQuery || wbtdcOnly) && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setSearchQuery('');
                    setWbtdcOnly(false);
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
                <th style={{ width: '60px' }}>Photo</th>
                <th>Property Name</th>
                <th>Type</th>
                <th>District</th>
                <th>Price Range</th>
                <th>Tier</th>
                <th>Authority</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Loading accommodations…
                  </td>
                </tr>
              ) : filteredStays.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    No accommodations found.
                  </td>
                </tr>
              ) : (
                filteredStays.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.coverImageUrl ? (
                        <img
                          src={s.coverImageUrl}
                          alt={s.name}
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--colour-border)' }}
                        />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'var(--colour-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid var(--colour-border)' }}>
                          🏨
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--colour-ink)' }}>{s.name}</div>
                      {s.description && (
                        <div style={{ fontSize: '12px', color: 'var(--colour-ink-soft)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.description}
                        </div>
                      )}
                    </td>
                    <td>{s.type}</td>
                    <td>{s.district}</td>
                    <td>
                      <span style={{ color: 'var(--colour-ink-soft)', fontSize: '13px' }}>{s.priceRange}</span>
                    </td>
                    <td>
                      <Badge variant="info">{s.budgetTier}</Badge>
                    </td>
                    <td>
                      {s.isWbtdc ? <Badge variant="success">WBTDCL</Badge> : <Badge variant="neutral">Private</Badge>}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(s)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(s.id, s.name)}>
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
        title={editingStay ? 'Edit Accommodation' : 'Create New Accommodation'}
        onClose={() => setShowModal(false)}
        footer={
          <div className="form-actions">
            <Button variant="secondary" size="md" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingStay ? 'Update Stay' : 'Create Stay'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave}>
          <div className="field">
            <label className="field__label" htmlFor="stay-name">
              Property Name <span className="field__required">*</span>
            </label>
            <input
              id="stay-name"
              type="text"
              required
              className="field__control"
              placeholder="e.g. WBTDCL Udayan Tourism Property"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          {/* Photo & Cover Image Section */}
          <div className="field" style={{ background: 'var(--colour-canvas)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--colour-border)' }}>
            <label className="field__label">
              📸 Property Photo & Cover Image
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="btn btn--secondary btn--sm" style={{ cursor: 'pointer' }}>
                  📁 Upload Photo from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '12px', color: 'var(--colour-ink-soft)' }}>or enter web image URL:</span>
              </div>

              <input
                type="text"
                className="field__control"
                placeholder="https://images.unsplash.com/... or paste image URL"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData((p) => ({ ...p, coverImageUrl: e.target.value }))}
              />

              {/* Sample Presets */}
              <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--colour-ink-soft)', fontWeight: 600 }}>Presets:</span>
                {[
                  { label: '🏨 Heritage Lodge', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
                  { label: '🏢 Luxury Hotel', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80' },
                  { label: '🌿 Boutique Resort', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' },
                  { label: '🏡 Bonedi Homestay', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' },
                ].map((pr) => (
                  <button
                    key={pr.label}
                    type="button"
                    className="btn btn--ghost btn--sm"
                    style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid var(--colour-border)' }}
                    onClick={() => setFormData((p) => ({ ...p, coverImageUrl: pr.url }))}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>

              {formData.coverImageUrl && (
                <div style={{ position: 'relative', marginTop: 'var(--space-1)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--colour-border)', maxHeight: '140px', background: '#000' }}>
                  <img
                    src={formData.coverImageUrl}
                    alt="Stay Preview"
                    style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, coverImageUrl: '' }))}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✕ Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label" htmlFor="stay-type">
                Type <span className="field__required">*</span>
              </label>
              <input
                id="stay-type"
                type="text"
                required
                className="field__control"
                placeholder="e.g. Govt Tourism Property"
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="stay-price">
                Price Range
              </label>
              <input
                id="stay-price"
                type="text"
                className="field__control"
                placeholder="e.g. ₹2,500 - ₹4,500 / night"
                value={formData.priceRange}
                onChange={(e) => setFormData((p) => ({ ...p, priceRange: e.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="stay-location">
              Location Address <span className="field__required">*</span>
            </label>
            <input
              id="stay-location"
              type="text"
              required
              className="field__control"
              placeholder="e.g. DG Block, Sector II, Salt Lake, Kolkata 700091"
              value={formData.location}
              onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
            />
          </div>

          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label" htmlFor="stay-district">
                District
              </label>
              <input
                id="stay-district"
                type="text"
                className="field__control"
                value={formData.district}
                onChange={(e) => setFormData((p) => ({ ...p, district: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="stay-tier">
                Budget Tier
              </label>
              <select
                id="stay-tier"
                className="field__control"
                value={formData.budgetTier}
                onChange={(e) => setFormData((p) => ({ ...p, budgetTier: e.target.value }))}
              >
                <option value="BUDGET">Budget</option>
                <option value="MID_RANGE">Mid-Range</option>
                <option value="PREMIUM">Premium</option>
                <option value="LUXURY">Luxury</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="stay-amenities">
              Amenities (comma separated)
            </label>
            <input
              id="stay-amenities"
              type="text"
              className="field__control"
              placeholder="Air Conditioning, Complimentary Breakfast, Wi-Fi, 24/7 Front Desk"
              value={formData.amenities}
              onChange={(e) => setFormData((p) => ({ ...p, amenities: e.target.value }))}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="stay-desc">
              Description & Overview
            </label>
            <textarea
              id="stay-desc"
              rows={3}
              className="field__control"
              placeholder="Describe the property ambience, proximity to famous pandals, and booking benefits..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label" htmlFor="stay-phone">
                Contact Phone
              </label>
              <input
                id="stay-phone"
                type="text"
                className="field__control"
                placeholder="+91 33 2359 8652"
                value={formData.contactPhone}
                onChange={(e) => setFormData((p) => ({ ...p, contactPhone: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="stay-booking">
                Booking URL
              </label>
              <input
                id="stay-booking"
                type="url"
                className="field__control"
                placeholder="https://wbtourism.gov.in/property/..."
                value={formData.bookingUrl}
                onChange={(e) => setFormData((p) => ({ ...p, bookingUrl: e.target.value }))}
              />
            </div>
          </div>

          <div className="checkbox-grid" style={{ marginTop: 'var(--space-2)' }}>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.isWbtdc}
                onChange={(e) => setFormData((p) => ({ ...p, isWbtdc: e.target.checked }))}
              />
              <span>Official WBTDCL Property</span>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((p) => ({ ...p, isFeatured: e.target.checked }))}
              />
              <span>Featured Property</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}

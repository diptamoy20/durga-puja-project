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
import type { TourismOperator } from '@/types/tourism';
import type { Category, Subcategory } from '@/types/content';

const DEFAULT_OPERATOR_TYPES = [
  'Govt Accredited Tour Operator',
  'WBTDCL Approved Partner',
  'Registered Heritage Tour Agency',
  'Cultural Walking Tour Specialist',
  'Luxury VIP Parikrama Service',
  'Private Destination Management Company',
  'Festival Transport & Logistics Partner',
];

export function TourismOperatorsManagePage() {
  const [operators, setOperators] = useState<TourismOperator[]>([]);
  const [operatorCategory, setOperatorCategory] = useState<Category | null>(null);
  const [masterTypes, setMasterTypes] = useState<string[]>(DEFAULT_OPERATOR_TYPES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TourismOperator | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCustomType, setIsCustomType] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    licenseNo: '',
    operatorType: 'Govt Accredited Tour Operator',
    contactPerson: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    rating: 4.8,
    isVerified: true,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load Operators
      const res = await adminTourismService.operators.list();
      const items = res.items || [];
      setOperators(items);

      // 2. Load Master Taxonomy: Category "Tour Operator" and its Subcategories
      try {
        const categories = await categoryService.listActive();
        let opCat = categories.find(
          (c: Category) => c.slug.toLowerCase() === 'tour-operator' || c.name.toLowerCase() === 'tour operator',
        );

        if (!opCat && categories.length > 0) {
          opCat = categories.find((c: Category) => c.name.toLowerCase().includes('operator'));
        }

        if (opCat) {
          setOperatorCategory(opCat);
          const subRes = await subcategoryService.list({
            categoryId: opCat.id,
            status: 'ACTIVE',
            perPage: 100,
          });
          const fetchedSubNames = (subRes.items || []).map((s: Subcategory) => s.name);
          const existingOperatorTypes = items.map((i) => i.operatorType).filter(Boolean);
          const merged = Array.from(
            new Set([...fetchedSubNames, ...DEFAULT_OPERATOR_TYPES, ...existingOperatorTypes]),
          );
          setMasterTypes(merged);
        } else {
          const existingOperatorTypes = items.map((i) => i.operatorType).filter(Boolean);
          setMasterTypes(
            Array.from(new Set([...DEFAULT_OPERATOR_TYPES, ...existingOperatorTypes])),
          );
        }
      } catch (catErr) {
        console.warn('Could not load master taxonomy operator categories/subcategories:', catErr);
        const existingOperatorTypes = items.map((i) => i.operatorType).filter(Boolean);
        setMasterTypes(
          Array.from(new Set([...DEFAULT_OPERATOR_TYPES, ...existingOperatorTypes])),
        );
      }
    } catch (err) {
      console.error('Failed to load operators:', err);
      setError('Unable to load tour operators.');
    } finally {
      setLoading(false);
    }
  };

  const typeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of operators) {
      const type = item.operatorType || 'Uncategorized';
      map[type] = (map[type] || 0) + 1;
    }
    return map;
  }, [operators]);

  const uniqueAvailableTypes = useMemo(() => {
    const set = new Set([...masterTypes, ...Object.keys(typeCounts)]);
    return Array.from(set).sort();
  }, [masterTypes, typeCounts]);

  const filteredOperators = useMemo(() => {
    return operators.filter((item) => {
      const matchType =
        selectedTypeFilter === 'all' ||
        item.operatorType.toLowerCase() === selectedTypeFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.operatorType.toLowerCase().includes(q) ||
        (item.licenseNo && item.licenseNo.toLowerCase().includes(q)) ||
        (item.contactPerson && item.contactPerson.toLowerCase().includes(q)) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q);

      return matchType && matchQuery;
    });
  }, [operators, selectedTypeFilter, searchQuery]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsCustomType(false);
    setCustomTypeInput('');
    setFormData({
      name: '',
      licenseNo: '',
      operatorType: masterTypes[0] || 'Govt Accredited Tour Operator',
      contactPerson: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      rating: 4.8,
      isVerified: true,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: TourismOperator) => {
    setEditingItem(item);
    const isCustom = !masterTypes.includes(item.operatorType);
    setIsCustomType(isCustom);
    setCustomTypeInput(isCustom ? item.operatorType : '');
    setFormData({
      name: item.name,
      licenseNo: item.licenseNo || '',
      operatorType: item.operatorType,
      contactPerson: item.contactPerson || '',
      phone: item.phone,
      email: item.email,
      website: item.website || '',
      address: item.address || '',
      rating: Number(item.rating) || 4.5,
      isVerified: item.isVerified,
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleTypeSelectChange = (value: string) => {
    if (value === '__custom__') {
      setIsCustomType(true);
      setCustomTypeInput('');
      setFormData((p) => ({ ...p, operatorType: '' }));
    } else {
      setIsCustomType(false);
      setCustomTypeInput('');
      setFormData((p) => ({ ...p, operatorType: value }));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete tour operator "${name}"?`)) return;
    try {
      await adminTourismService.operators.remove(id);
      setOperators((prev) => prev.filter((op) => op.id !== id));
    } catch (err) {
      console.error('Failed to delete operator:', err);
      alert('Failed to delete tour operator.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalType = (isCustomType ? customTypeInput.trim() : formData.operatorType.trim());
    if (!finalType) {
      alert('Please select or specify an operator type.');
      return;
    }

    setSaving(true);
    try {
      // If custom type, sync to master taxonomy if operatorCategory is available
      if (isCustomType && operatorCategory) {
        try {
          await subcategoryService.create({
            categoryId: operatorCategory.id,
            name: finalType,
            slug: finalType.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: `${finalType} tour operator category.`,
            status: 'ACTIVE',
          });
        } catch (subErr) {
          console.log('Subcategory might already exist in master taxonomy:', subErr);
        }
      }

      const payload = {
        ...formData,
        operatorType: finalType,
        rating: Number(formData.rating) || 4.5,
      };

      if (editingItem) {
        await adminTourismService.operators.update(editingItem.id, payload);
      } else {
        await adminTourismService.operators.create(payload);
      }

      if (!masterTypes.includes(finalType)) {
        setMasterTypes((prev) => [...prev, finalType]);
      }

      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      console.error('Failed to save operator:', err);
      const errMsg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as Error)?.message || 'Failed to save tour operator.';
      alert(`Error saving tour operator: ${errMsg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Tour Operators Directory"
        description="Manage verified West Bengal tourism partners, accreditation licenses, and curated festive packages."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Tourism Concierge' }]}
        actions={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            + Add Tour Operator
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
            <label className="field__label" htmlFor="operator-search">
              Search Agency / Contact
            </label>
            <input
              id="operator-search"
              type="search"
              className="field__control"
              placeholder="Search agency, license, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="operator-type-filter">
              Operator Subcategory Filter
            </label>
            <select
              id="operator-type-filter"
              className="field__control"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
            >
              <option value="all">🌐 All Subcategories ({operators.length})</option>
              {uniqueAvailableTypes.map((type) => {
                const count = typeCounts[type] || 0;
                return (
                  <option key={type} value={type}>
                    {type} {count > 0 ? `(${count})` : '(0)'}
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
                  setSelectedTypeFilter('all');
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
                <th>Agency Name</th>
                <th>Operator Subcategory</th>
                <th>Contact Details</th>
                <th>Rating</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Loading tour operators…
                  </td>
                </tr>
              ) : filteredOperators.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    {operators.length === 0 ? 'No tour operators found.' : 'No tour operators match the selected filter.'}
                  </td>
                </tr>
              ) : (
                filteredOperators.map((op) => (
                  <tr key={op.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--colour-brand)' }}>{op.name}</div>
                      {op.contactPerson && (
                        <div style={{ fontSize: '11.5px', color: 'var(--colour-ink-soft)', marginTop: '2px' }}>
                          Contact: {op.contactPerson}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge badge--success"
                        style={{ cursor: 'pointer', marginBottom: '4px', display: 'inline-block' }}
                        onClick={() => setSelectedTypeFilter(op.operatorType)}
                      >
                        🏷️ {op.operatorType}
                      </span>
                      <div style={{ fontSize: '11.5px', color: 'var(--colour-ink-soft)' }}>
                        {op.licenseNo || 'Accredited Partner'}
                      </div>
                    </td>
                    <td style={{ color: 'var(--colour-ink-soft)', fontSize: '12.5px' }}>
                      <div>📞 {op.phone}</div>
                      <div>✉️ {op.email}</div>
                      {op.website && (
                        <div>
                          <a href={op.website} target="_blank" rel="noreferrer" style={{ color: 'var(--colour-brand)', textDecoration: 'none' }}>
                            🌐 {op.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ color: '#d97706', fontWeight: 700 }}>★ {Number(op.rating || 4.5).toFixed(1)}</span>
                    </td>
                    <td>
                      <Badge variant={op.isVerified ? 'success' : 'neutral'}>
                        {op.isVerified ? 'Verified Partner' : 'Pending'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-1)' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(op)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(op.id, op.name)}>
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

      {/* Modal with Master Data Dropdown */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Tour Operator' : 'Add Tour Operator'}
      >
        <form onSubmit={handleSave}>
          <div className="field mb-4">
            <label className="field__label" htmlFor="operator-name">
              Agency Name *
            </label>
            <input
              id="operator-name"
              type="text"
              className="field__control"
              required
              placeholder="e.g. Bengal Heritage Walks & Cultural Tours"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="field mb-4">
            <label className="field__label" htmlFor="operator-type-select">
              Operator Subcategory *
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: isCustomType ? '1fr 1fr' : '1fr', gap: '8px' }}>
              <select
                id="operator-type-select"
                className="field__control"
                required={!isCustomType}
                value={isCustomType ? '__custom__' : formData.operatorType}
                onChange={(e) => handleTypeSelectChange(e.target.value)}
              >
                <optgroup label="Available Operator Subcategories">
                  {masterTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom">
                  <option value="__custom__">➕ Enter New / Custom Operator Type...</option>
                </optgroup>
              </select>

              {isCustomType && (
                <input
                  type="text"
                  className="field__control"
                  required
                  placeholder="Type custom operator type..."
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  autoFocus
                />
              )}
            </div>
          </div>

          <div className="form-grid form-grid--2 mb-4">
            <div className="field">
              <label className="field__label" htmlFor="operator-contact-person">
                Contact Person
              </label>
              <input
                id="operator-contact-person"
                type="text"
                className="field__control"
                placeholder="e.g. Subhasish Sen"
                value={formData.contactPerson}
                onChange={(e) => setFormData((p) => ({ ...p, contactPerson: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="operator-license">
                Govt License / Reg No
              </label>
              <input
                id="operator-license"
                type="text"
                className="field__control"
                placeholder="e.g. WBTDC/REG/2026/088"
                value={formData.licenseNo}
                onChange={(e) => setFormData((p) => ({ ...p, licenseNo: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-grid form-grid--2 mb-4">
            <div className="field">
              <label className="field__label" htmlFor="operator-phone">
                Phone *
              </label>
              <input
                id="operator-phone"
                type="tel"
                className="field__control"
                required
                placeholder="+91 98300 12345"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="operator-email">
                Email *
              </label>
              <input
                id="operator-email"
                type="email"
                className="field__control"
                required
                placeholder="tours@agency.in"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-grid form-grid--2 mb-4">
            <div className="field">
              <label className="field__label" htmlFor="operator-website">
                Website URL
              </label>
              <input
                id="operator-website"
                type="url"
                className="field__control"
                placeholder="https://agency.in"
                value={formData.website}
                onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="operator-rating">
                Rating (1-5)
              </label>
              <input
                id="operator-rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                className="field__control"
                value={formData.rating}
                onChange={(e) => setFormData((p) => ({ ...p, rating: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="field mb-4">
            <label className="field__label" htmlFor="operator-address">
              Office Address
            </label>
            <input
              id="operator-address"
              type="text"
              className="field__control"
              placeholder="e.g. Park Street, Kolkata, West Bengal"
              value={formData.address}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
            />
          </div>

          <div className="checkbox-grid mb-4">
            <label className="field__label checkbox-label">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData((p) => ({ ...p, isVerified: e.target.checked }))}
              />
              Verified Partner
            </label>
            <label className="field__label checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button type="button" variant="secondary" size="md" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? 'Saving...' : editingItem ? 'Update Operator' : 'Create Operator'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

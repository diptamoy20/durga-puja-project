import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { adminInvestmentService } from '@/services/investmentService';
import type {
  IndustryAssociation,
  CreateIndustryAssociationDto,
} from '@/types/investments';

import '@/styles/investments-admin.css';

const DEFAULT_SECTORS = [
  'Tourism & Hospitality',
  'Artisans & Handicrafts',
  'Creative Economy & Media',
  'Riverfront & Heritage Infrastructure',
  'Cultural Technology & Metaverse',
  'Textiles & Handlooms',
  'Food & Culinary Tourism',
];

export const IndustryAssociationsPage: React.FC = () => {
  const toast = useToast();
  const { can } = useAuth();

  const [associations, setAssociations] = useState<IndustryAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & View Mode
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssociation, setEditingAssociation] = useState<IndustryAssociation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sectorInput, setSectorInput] = useState('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<IndustryAssociation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<CreateIndustryAssociationDto>({
    name: '',
    code: '',
    description: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: 'Kolkata',
    state: 'West Bengal',
    sectorsCovered: [],
    displayOrder: 0,
    isActive: true,
  });

  const canManage = can(PERMISSIONS.MANAGE_ASSOCIATIONS) || can(PERMISSIONS.VIEW_INVESTMENTS);

  useEffect(() => {
    fetchAssociations();
  }, []);

  const fetchAssociations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminInvestmentService.getAssociations();
      setAssociations(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load industry associations');
      toast.error('Unable to fetch industry associations.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered List
  const filteredAssociations = useMemo(() => {
    return associations.filter((assoc) => {
      const matchSearch =
        !search.trim() ||
        assoc.name.toLowerCase().includes(search.toLowerCase()) ||
        assoc.code.toLowerCase().includes(search.toLowerCase()) ||
        (assoc.contactPerson && assoc.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
        (assoc.city && assoc.city.toLowerCase().includes(search.toLowerCase()));

      const matchSector =
        !sectorFilter ||
        (Array.isArray(assoc.sectorsCovered) &&
          assoc.sectorsCovered.some((s) => s.toLowerCase() === sectorFilter.toLowerCase()));

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' ? assoc.isActive : !assoc.isActive);

      return matchSearch && matchSector && matchStatus;
    });
  }, [associations, search, sectorFilter, statusFilter]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const totalChambers = associations.length;
    const activeChambers = associations.filter((a) => a.isActive).length;
    const totalOpportunities = associations.reduce(
      (acc, a) => acc + (a._count?.opportunities ?? 0),
      0,
    );
    const allSectors = new Set<string>();
    associations.forEach((a) => {
      if (Array.isArray(a.sectorsCovered)) {
        a.sectorsCovered.forEach((s) => allSectors.add(s));
      }
    });

    return {
      totalChambers,
      activeChambers,
      totalOpportunities,
      sectorCount: allSectors.size,
    };
  }, [associations]);

  const handleOpenCreateModal = () => {
    setEditingAssociation(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      city: 'Kolkata',
      state: 'West Bengal',
      sectorsCovered: ['Tourism & Hospitality', 'Creative Economy & Media'],
      displayOrder: 0,
      isActive: true,
    });
    setSectorInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (assoc: IndustryAssociation) => {
    setEditingAssociation(assoc);
    setFormData({
      name: assoc.name,
      code: assoc.code,
      description: assoc.description || '',
      contactPerson: assoc.contactPerson || '',
      email: assoc.email || '',
      phone: assoc.phone || '',
      website: assoc.website || '',
      address: assoc.address || '',
      city: assoc.city || 'Kolkata',
      state: assoc.state || 'West Bengal',
      sectorsCovered: Array.isArray(assoc.sectorsCovered) ? [...assoc.sectorsCovered] : [],
      displayOrder: assoc.displayOrder || 0,
      isActive: assoc.isActive,
    });
    setSectorInput('');
    setIsModalOpen(true);
  };

  const handleAddSector = () => {
    if (!sectorInput.trim()) return;
    const trimmed = sectorInput.trim();
    if (!formData.sectorsCovered?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        sectorsCovered: [...(prev.sectorsCovered || []), trimmed],
      }));
    }
    setSectorInput('');
  };

  const handleRemoveSector = (secToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sectorsCovered: (prev.sectorsCovered || []).filter((s) => s !== secToRemove),
    }));
  };

  const handleSelectPredefinedSector = (sec: string) => {
    if (!formData.sectorsCovered?.includes(sec)) {
      setFormData((prev) => ({
        ...prev,
        sectorsCovered: [...(prev.sectorsCovered || []), sec],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.code?.trim()) {
      toast.error('Please provide chamber name and acronym code.');
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      category: formData.category || (formData.sectorsCovered && formData.sectorsCovered[0]) || 'Chamber of Commerce',
      email: formData.email?.trim() || null,
      phone: formData.phone?.trim() || null,
      website: formData.website?.trim() || null,
      address: formData.address?.trim() || null,
      city: formData.city?.trim() || 'Kolkata',
      state: formData.state?.trim() || 'West Bengal',
      sectorsCovered: formData.sectorsCovered || [],
    };

    try {
      setSubmitting(true);
      if (editingAssociation) {
        await adminInvestmentService.updateAssociation(editingAssociation.id, payload);
        toast.success(`"${formData.name}" updated successfully.`);
      } else {
        await adminInvestmentService.createAssociation(payload);
        toast.success(`"${formData.name}" added successfully.`);
      }
      setIsModalOpen(false);
      fetchAssociations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save association');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminInvestmentService.deleteAssociation(String(deleteTarget.id));
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchAssociations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete association');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page investor-admin-page">
      {/* Header */}
      <PageHeader
        title="Industry Associations & Chambers"
        description="Partner chambers of commerce and industry federations facilitating investor routing, opportunity dossiers, and Single Window coordination."
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Investor Showcase', to: ROUTES.ADMIN_INVESTMENTS },
          { label: 'Chambers & Associations' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to={ROUTES.ADMIN_INVESTMENTS} className="btn btn--secondary btn--md">
              ← All Opportunities
            </Link>
            {canManage && (
              <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
                + Add Chamber / Association
              </Button>
            )}
          </div>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      {/* Top Stats Counters */}
      <div className="chamber-stats-grid">
        <div className="chamber-stat-card">
          <div className="chamber-stat-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            🏛️
          </div>
          <div className="chamber-stat-info">
            <span className="chamber-stat-value">{stats.totalChambers}</span>
            <span className="chamber-stat-label">Total Chambers</span>
          </div>
        </div>

        <div className="chamber-stat-card">
          <div className="chamber-stat-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
            ✅
          </div>
          <div className="chamber-stat-info">
            <span className="chamber-stat-value">{stats.activeChambers}</span>
            <span className="chamber-stat-label">Active Nodal Desks</span>
          </div>
        </div>

        <div className="chamber-stat-card">
          <div className="chamber-stat-icon" style={{ background: '#fffbeb', color: '#b45309' }}>
            💼
          </div>
          <div className="chamber-stat-info">
            <span className="chamber-stat-value">{stats.totalOpportunities}</span>
            <span className="chamber-stat-label">Opportunities Linked</span>
          </div>
        </div>

        <div className="chamber-stat-card">
          <div className="chamber-stat-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            🏷️
          </div>
          <div className="chamber-stat-info">
            <span className="chamber-stat-value">{stats.sectorCount}</span>
            <span className="chamber-stat-label">Sectors Covered</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flex: '1 1 400px', flexWrap: 'wrap' }}>
            <div className="field" style={{ flex: '1 1 200px', margin: 0 }}>
              <input
                type="search"
                className="field__control"
                placeholder="Search chamber by name, acronym, city, or contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="field" style={{ width: '180px', margin: 0 }}>
              <select
                className="field__control"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
              >
                <option value="">All Sector Specializations</option>
                {DEFAULT_SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="field" style={{ width: '130px', margin: 0 }}>
              <select
                className="field__control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {(search || sectorFilter || statusFilter !== 'ALL') && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSearch('');
                  setSectorFilter('');
                  setStatusFilter('ALL');
                }}
              >
                Reset
              </Button>
            )}
          </div>

          {/* View Switcher Toggle */}
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞ Grid View
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              ☰ Table View
            </button>
          </div>
        </div>
      </Card>

      {/* Body Content */}
      {loading ? (
        <PageLoader label="Loading industry chambers and associations..." />
      ) : filteredAssociations.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏛️</div>
          <h3 style={{ margin: '0 0 8px', fontWeight: 800 }}>No Industry Chambers Found</h3>
          <p style={{ color: 'var(--colour-ink-soft)', maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            {search || sectorFilter || statusFilter !== 'ALL'
              ? 'No chambers match your active filter criteria. Try adjusting search filters.'
              : 'Add partner chambers to link them to investment opportunities and facilitate lead routing.'}
          </p>
          {canManage && (
            <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
              + Add First Chamber
            </Button>
          )}
        </Card>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="chambers-grid">
          {filteredAssociations.map((assoc) => (
            <div key={assoc.id} className="chamber-card">
              <div>
                <div className="chamber-card-header">
                  <span className="chamber-badge-code">{assoc.code}</span>
                  <StatusBadge status={assoc.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>

                <h3 className="chamber-name">{assoc.name}</h3>

                <p className="chamber-description">
                  {assoc.description || 'No detailed overview provided for this industry chamber.'}
                </p>

                {/* Contact Dossier Box */}
                <div className="chamber-contact-box">
                  <div className="chamber-contact-item" title={assoc.contactPerson || 'Nodal Officer'}>
                    <span className="icon">👤</span>
                    <span>{assoc.contactPerson || 'Nodal Secretariat'}</span>
                  </div>
                  {assoc.email && (
                    <div className="chamber-contact-item" title={assoc.email}>
                      <span className="icon">✉️</span>
                      <a href={`mailto:${assoc.email}`}>{assoc.email}</a>
                    </div>
                  )}
                  {assoc.phone && (
                    <div className="chamber-contact-item" title={assoc.phone}>
                      <span className="icon">📞</span>
                      <span>{assoc.phone}</span>
                    </div>
                  )}
                  {assoc.website && (
                    <div className="chamber-contact-item" title={assoc.website}>
                      <span className="icon">🌐</span>
                      <a href={assoc.website} target="_blank" rel="noopener noreferrer">
                        {assoc.website.replace(/^https?:\/\//, '')} ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Sectors Covered */}
                {Array.isArray(assoc.sectorsCovered) && assoc.sectorsCovered.length > 0 && (
                  <div className="chamber-sectors-wrap">
                    {assoc.sectorsCovered.map((s, idx) => (
                      <span key={idx} className="chamber-sector-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="chamber-footer">
                <span className="chamber-opp-count">
                  💼 {assoc._count?.opportunities ?? 0} Opportunities
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEditModal(assoc)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(assoc)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Acronym</th>
                  <th>Chamber Name</th>
                  <th>Key Contact</th>
                  <th>Email & Phone</th>
                  <th>Sectors Covered</th>
                  <th>Opportunities</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssociations.map((assoc) => (
                  <tr key={assoc.id}>
                    <td>
                      <span className="chamber-badge-code">{assoc.code}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--colour-ink)' }}>{assoc.name}</div>
                      {assoc.website && (
                        <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                          <a
                            href={assoc.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#2563eb', textDecoration: 'none' }}
                          >
                            {assoc.website.replace(/^https?:\/\//, '')} ↗
                          </a>
                        </div>
                      )}
                    </td>
                    <td>{assoc.contactPerson || '-'}</td>
                    <td>
                      <div>{assoc.email || '-'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{assoc.phone || ''}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                        {Array.isArray(assoc.sectorsCovered) &&
                          assoc.sectorsCovered.slice(0, 2).map((s, idx) => (
                            <span key={idx} className="chamber-sector-tag">
                              {s}
                            </span>
                          ))}
                        {Array.isArray(assoc.sectorsCovered) && assoc.sectorsCovered.length > 2 && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>
                            +{assoc.sectorsCovered.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="chamber-opp-count">
                        {assoc._count?.opportunities ?? 0}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={assoc.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEditModal(assoc)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(assoc)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAssociation ? `Edit Chamber: ${editingAssociation.code}` : 'Add New Chamber / Industry Association'}
          size="lg"
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="chamber-form-grid">
              <div className="field">
                <label className="field__label">
                  Association / Chamber Name <span className="field__required">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="field__control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bengal Chamber of Commerce & Industry"
                />
              </div>

              <div className="field">
                <label className="field__label">
                  Code / Acronym <span className="field__required">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="field__control"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. BCCI"
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label">Description & Chamber Role</label>
              <textarea
                rows={3}
                className="field__control"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Overview of chamber mandate, expertise, and nodal investment coordination..."
              />
            </div>

            <div className="chamber-form-grid">
              <div className="field">
                <label className="field__label">Nodal Contact Person</label>
                <input
                  type="text"
                  className="field__control"
                  value={formData.contactPerson || ''}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g. Sri Subhasish Mitra, Secretary General"
                />
              </div>

              <div className="field">
                <label className="field__label">Official Email</label>
                <input
                  type="email"
                  className="field__control"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="investments@bengalchamber.com"
                />
              </div>
            </div>

            <div className="chamber-form-grid">
              <div className="field">
                <label className="field__label">Contact Phone</label>
                <input
                  type="text"
                  className="field__control"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 33 2222 0000"
                />
              </div>

              <div className="field">
                <label className="field__label">Official Website</label>
                <input
                  type="url"
                  className="field__control"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.bengalchamber.com"
                />
              </div>
            </div>

            <div className="chamber-form-grid">
              <div className="field">
                <label className="field__label">City / Headquarters</label>
                <input
                  type="text"
                  className="field__control"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Kolkata"
                />
              </div>

              <div className="field">
                <label className="field__label">Status</label>
                <select
                  className="field__control"
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Active (Accepting Opportunity Routing)</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {/* Sectors Covered Builder */}
            <div className="field">
              <label className="field__label">Sectors Covered</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="field__control"
                  value={sectorInput}
                  onChange={(e) => setSectorInput(e.target.value)}
                  placeholder="Type a custom sector and click Add..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSector();
                    }
                  }}
                />
                <Button type="button" variant="secondary" size="md" onClick={handleAddSector}>
                  Add
                </Button>
              </div>

              {/* Quick Preset Badges */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                  Quick Add Presets:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {DEFAULT_SECTORS.map((sec) => {
                    const isAdded = formData.sectorsCovered?.includes(sec);
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => handleSelectPredefinedSector(sec)}
                        disabled={isAdded}
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: '1px solid #cbd5e1',
                          background: isAdded ? '#f1f5f9' : '#ffffff',
                          color: isAdded ? '#94a3b8' : '#334155',
                          cursor: isAdded ? 'default' : 'pointer',
                        }}
                      >
                        {isAdded ? '✓ ' : '+ '}
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Selected Sector Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(formData.sectorsCovered || []).map((sec) => (
                  <span key={sec} className="sector-input-chip">
                    {sec}
                    <button type="button" onClick={() => handleRemoveSector(sec)}>
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
              >
                {editingAssociation ? 'Update Chamber' : 'Create Chamber'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Industry Association?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Any linked opportunities will lose their assigned nodal chamber.`}
        confirmLabel="Delete Chamber"
        destructive={true}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default IndustryAssociationsPage;

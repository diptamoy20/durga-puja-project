import { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { categoryService, subcategoryService } from '@/services/contentService';
import { useToast } from '@/hooks/useToast';
import type { Category, Subcategory } from '@/types/content';

export function SubcategoriesPage() {
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [catId, setCatId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deletingSub, setDeletingSub] = useState<Subcategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load categories once
  useEffect(() => {
    categoryService.list().then((res) => setCategories(res.items)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await subcategoryService.list(selectedCategory || undefined);
      setSubcategories(items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subcategories.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreateModal = () => {
    setEditingSub(null);
    setCatId(selectedCategory || (categories[0]?.id ?? ''));
    setName('');
    setDescription('');
    setStatus('ACTIVE');
    setModalOpen(true);
  };

  const openEditModal = (sub: Subcategory) => {
    setEditingSub(sub);
    setCatId(sub.categoryId);
    setName(sub.name);
    setDescription(sub.description ?? '');
    setStatus(sub.status as 'ACTIVE' | 'INACTIVE');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !catId) return;
    setSaving(true);
    try {
      if (editingSub) {
        await subcategoryService.update(editingSub.id, { name, description, status });
        toast.success('Subcategory updated successfully.');
      } else {
        await subcategoryService.create({ categoryId: Number(catId), name, description });
        toast.success('Subcategory created successfully.');
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save subcategory.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSub) return;
    setDeleting(true);
    try {
      await subcategoryService.remove(deletingSub.id);
      toast.success('Subcategory deleted successfully.');
      setDeletingSub(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete subcategory.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page__title">Subcategories</h1>
          <p className="page__subtitle">Manage nested classification for articles and content.</p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateModal}>
          + Add Subcategory
        </Button>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="filter-bar">
          <div className="filter-bar__filters">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
              <span>Filter by Category:</span>
              <select
                className="field__control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    Loading subcategories…
                  </td>
                </tr>
              ) : subcategories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    No subcategories found.
                  </td>
                </tr>
              ) : (
                subcategories.map((sub) => (
                  <tr key={sub.id}>
                    <td><strong>{sub.name}</strong></td>
                    <td><code>{sub.slug}</code></td>
                    <td>{sub.category?.name ?? categories.find((c) => c.id === sub.categoryId)?.name ?? '—'}</td>
                    <td>{sub.description ?? '—'}</td>
                    <td>
                      <StatusBadge tone={sub.status === 'ACTIVE' ? 'success' : 'muted'}>
                        {sub.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-150)' }}>
                        <Button variant="secondary" size="sm" onClick={() => openEditModal(sub)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeletingSub(sub)}>
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

      <Modal
        open={modalOpen}
        title={editingSub ? 'Edit Subcategory' : 'Create Subcategory'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave}>
          {!editingSub && (
            <div className="field">
              <label className="field__label" htmlFor="subCat">Parent Category *</label>
              <select
                id="subCat"
                required
                className="field__control"
                value={catId}
                onChange={(e) => setCatId(Number(e.target.value))}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label className="field__label" htmlFor="subName">Subcategory Name *</label>
            <input
              id="subName"
              type="text"
              required
              className="field__control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="subDesc">Description</label>
            <textarea
              id="subDesc"
              rows={3}
              className="field__control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {editingSub && (
            <div className="field">
              <label className="field__label" htmlFor="subStatus">Status</label>
              <select
                id="subStatus"
                className="field__control"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
            <Button type="button" variant="secondary" size="md" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? 'Saving…' : editingSub ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deletingSub !== null}
        title="Delete Subcategory"
        message={`Are you sure you want to delete subcategory "${deletingSub?.name}"?`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingSub(null)}
      />
    </div>
  );
}

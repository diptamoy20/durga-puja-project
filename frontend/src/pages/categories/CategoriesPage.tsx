import { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { categoryService } from '@/services/contentService';
import { useToast } from '@/hooks/useToast';
import type { Category } from '@/types/content';

export function CategoriesPage() {
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.list({ search: search || undefined });
      setCategories(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setStatus('ACTIVE');
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description ?? '');
    setStatus(cat.status as 'ACTIVE' | 'INACTIVE');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, { name, description, status });
        toast.success('Category updated successfully.');
      } else {
        await categoryService.create({ name, description });
        toast.success('Category created successfully.');
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      await categoryService.remove(deletingCategory.id);
      toast.success('Category deleted successfully.');
      setDeletingCategory(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page__title">Categories</h1>
          <p className="page__subtitle">Manage content and media categories.</p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateModal}>
          + Add Category
        </Button>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="filter-bar">
          <div className="filter-bar__search">
            <input
              type="search"
              className="field__control"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Subcategories</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    Loading categories…
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td><strong>{cat.name}</strong></td>
                    <td><code>{cat.slug}</code></td>
                    <td>{cat.description ?? '—'}</td>
                    <td>{cat._count?.subcategories ?? cat.subcategories?.length ?? 0}</td>
                    <td>
                      <StatusBadge tone={cat.status === 'ACTIVE' ? 'success' : 'muted'}>
                        {cat.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-150)' }}>
                        <Button variant="secondary" size="sm" onClick={() => openEditModal(cat)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeletingCategory(cat)}>
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
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave}>
          <div className="field">
            <label className="field__label" htmlFor="catName">Category Name *</label>
            <input
              id="catName"
              type="text"
              required
              className="field__control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="catDesc">Description</label>
            <textarea
              id="catDesc"
              rows={3}
              className="field__control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {editingCategory && (
            <div className="field">
              <label className="field__label" htmlFor="catStatus">Status</label>
              <select
                id="catStatus"
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
              {saving ? 'Saving…' : editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deletingCategory !== null}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"?`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}

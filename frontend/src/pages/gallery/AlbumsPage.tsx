import { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { albumService } from '@/services/galleryService';
import { categoryService, subcategoryService } from '@/services/contentService';
import { committeeService } from '@/services/registrationService';
import { useToast } from '@/hooks/useToast';
import type { Album } from '@/types/gallery';
import type { Category, Subcategory } from '@/types/content';
import type { PujaCommittee } from '@/types/registration';

export function AlbumsPage() {
  const toast = useToast();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [committees, setCommittees] = useState<PujaCommittee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create album modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('');
  const [committeeId, setCommitteeId] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.items)).catch(() => {});
    committeeService.list({ perPage: 100 }).then((r) => setCommittees(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (categoryId) {
      subcategoryService.list(Number(categoryId)).then(setSubcategories).catch(() => {});
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await albumService.list();
      setAlbums(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load albums.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId || !committeeId) {
      toast.warning('Please select title, category, and committee.');
      return;
    }
    setSaving(true);
    try {
      await albumService.create({
        title,
        description: description || undefined,
        categoryId: Number(categoryId),
        subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
        pujaCommitteeId: Number(committeeId),
        isPublic,
      });
      toast.success('Album created successfully.');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create album.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page__title">Photo Albums</h1>
          <p className="page__subtitle">Curate and group festival media into public or private thematic albums.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          + Create Album
        </Button>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Album Title</th>
                <th>Committee</th>
                <th>Category</th>
                <th>Media Items</th>
                <th>Visibility</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    Loading albums…
                  </td>
                </tr>
              ) : albums.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-600)' }}>
                    No albums created yet. Click "+ Create Album" to get started.
                  </td>
                </tr>
              ) : (
                albums.map((album) => (
                  <tr key={album.id}>
                    <td>
                      <strong>{album.title}</strong>
                      {album.description && (
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                          {album.description}
                        </div>
                      )}
                    </td>
                    <td>{album.committee?.committeeName ?? `#${album.pujaCommitteeId}`}</td>
                    <td>{album.category?.name ?? '—'}</td>
                    <td>{album._count?.media ?? album.media?.length ?? 0} photos/videos</td>
                    <td>
                      {album.isPublic ? (
                        <span className="badge badge--success">Public</span>
                      ) : (
                        <span className="badge badge--muted">Private</span>
                      )}
                    </td>
                    <td>{new Date(album.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} title="Create New Album" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleCreate}>
          <div className="field">
            <label className="field__label" htmlFor="albTitle">Album Title *</label>
            <input
              id="albTitle"
              type="text"
              required
              className="field__control"
              placeholder="e.g. Durga Puja 2026 - Idol Sculpting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="albCommittee">Puja Committee *</label>
            <select
              id="albCommittee"
              required
              className="field__control"
              value={committeeId}
              onChange={(e) => setCommitteeId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Select Committee</option>
              {committees.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.committeeName}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="albCat">Category *</label>
            <select
              id="albCat"
              required
              className="field__control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {subcategories.length > 0 && (
            <div className="field">
              <label className="field__label" htmlFor="albSubCat">Subcategory</label>
              <select
                id="albSubCat"
                className="field__control"
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label className="field__label" htmlFor="albDesc">Description</label>
            <textarea
              id="albDesc"
              rows={2}
              className="field__control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span>Make Album Publicly Visible</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
            <Button type="button" variant="secondary" size="md" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? 'Creating…' : 'Create Album'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

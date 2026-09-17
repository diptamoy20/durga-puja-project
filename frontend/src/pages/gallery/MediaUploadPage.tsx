import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import { categoryService, subcategoryService } from '@/services/contentService';
import { committeeMediaService } from '@/services/galleryService';
import { useToast } from '@/hooks/useToast';
import type { Category, Subcategory } from '@/types/content';

export function MediaUploadPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venueName, setVenueName] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (categoryId) {
      subcategoryService
        .list({ categoryId: Number(categoryId), perPage: 100, sortDir: 'asc' })
        .then((res) => setSubcategories(res.items))
        .catch(() => {});
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selected));
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    const data = new FormData();
    data.append('file', file);
    if (title) data.append('title', title);
    if (description) data.append('description', description);
    if (venueName) data.append('venueName', venueName);
    if (categoryId) data.append('categoryId', String(categoryId));
    if (subcategoryId) data.append('subcategoryId', String(subcategoryId));

    try {
      await committeeMediaService.create(data);
      toast.success('Media uploaded successfully! It is pending moderation.');
      navigate(ROUTES.GALLERY_MEDIA);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div style={{ marginBottom: 'var(--space-100)' }}>
          <Link to={ROUTES.GALLERY_MEDIA} className="btn btn--secondary btn--sm">
            ← Back to Gallery
          </Link>
        </div>
        <h1 className="page__title">Upload Media</h1>
        <p className="page__subtitle">Upload photos and video clips for festival showcases and pandal highlights.</p>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-400)' }}>
          <Card title="File Selection">
            <div className="field">
              <label className="field__label" htmlFor="mediaFile">
                Select Photo or Video *
              </label>
              <input
                id="mediaFile"
                type="file"
                accept="image/*,video/*"
                required
                className="field__control"
                onChange={handleFileChange}
              />
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-100)' }}>
                Supported formats: JPG, PNG, WEBP, MP4, MOV (max 50MB)
              </p>
            </div>

            {preview && (
              <div style={{ marginTop: 'var(--space-300)' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
              </div>
            )}
          </Card>

          <Card title="Details & Metadata">
            <div className="field">
              <label className="field__label" htmlFor="mediaTitle">
                Title / Caption
              </label>
              <input
                id="mediaTitle"
                type="text"
                className="field__control"
                placeholder="e.g. Evening Aarti at Salt Lake FD Block"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="mediaVenue">
                Venue Name
              </label>
              <input
                id="mediaVenue"
                type="text"
                className="field__control"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="mediaCat">
                Category
              </label>
              <select
                id="mediaCat"
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
                <label className="field__label" htmlFor="mediaSubCat">
                  Subcategory
                </label>
                <select
                  id="mediaSubCat"
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
              <label className="field__label" htmlFor="mediaDesc">
                Description
              </label>
              <textarea
                id="mediaDesc"
                rows={3}
                className="field__control"
                placeholder="Additional notes or context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
          <Link to={ROUTES.GALLERY_MEDIA} className="btn btn--secondary btn--md">
            Cancel
          </Link>
          <Button type="submit" variant="primary" size="md" disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload File'}
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';
import { categoryService, subcategoryService } from '@/services/contentService';
import { committeeMediaService } from '@/services/galleryService';
import { useToast } from '@/hooks/useToast';
import type { Category, Subcategory } from '@/types/content';

export function MyCommitteeMediaUploadPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Please select a media file.');
      return;
    }
    if (!categoryId) {
      toast.warning('Category is required.');
      return;
    }

    setUploading(true);
    setError(null);
    const data = new FormData();
    data.append('file', file);
    data.append('categoryId', String(categoryId));
    if (subcategoryId) data.append('subcategoryId', String(subcategoryId));
    if (title.trim()) data.append('title', title.trim());
    if (description.trim()) data.append('description', description.trim());

    try {
      await committeeMediaService.create(data);
      toast.success('Media uploaded and queued for processing.');
      navigate(ROUTES.MY_COMMITTEE_MEDIA);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Upload Photo or Video"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'My Media', to: ROUTES.MY_COMMITTEE_MEDIA },
          { label: 'Upload' },
        ]}
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label" htmlFor="categoryId">Category <span className="field__required">*</span></label>
              <select id="categoryId" required className="field__control" value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="subcategoryId">Subcategory</label>
              <select id="subcategoryId" className="field__control" value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Select subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label" htmlFor="mediaFile">Media file <span className="field__required">*</span></label>
              <input
                id="mediaFile"
                type="file"
                required
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                className="field__control"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="field__hint">Photos up to 10 MB (jpg, png, webp). Videos up to 50 MB (mp4, webm, mov).</p>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="title">Title</label>
              <input id="title" className="field__control" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label" htmlFor="description">Description</label>
              <textarea id="description" rows={4} className="field__control" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <Link to={ROUTES.MY_COMMITTEE_MEDIA} className="btn btn--secondary btn--md">Cancel</Link>
            <Button type="submit" variant="primary" size="md" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload and queue processing'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default MyCommitteeMediaUploadPage;

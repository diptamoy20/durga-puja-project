import { useEffect, useMemo, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { categoryService, subcategoryService } from '@/services/contentService';
import { adminMediaService, committeeMediaService } from '@/services/galleryService';
import { adminAtlasService } from '@/services/atlasService';
import { useToast } from '@/hooks/useToast';
import type { AtlasFormCommitteeOption } from '@/types/atlas';
import type { Category, Subcategory } from '@/types/content';

interface MediaUploadFormProps {
  mode: 'admin' | 'committee';
  onSuccess: () => void;
  onCancel: () => void;
}

interface FilePreview {
  file: File;
  previewUrl: string | null;
}

export function MediaUploadForm({ mode, onSuccess, onCancel }: MediaUploadFormProps) {
  const toast = useToast();
  const isAdmin = mode === 'admin';

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [committees, setCommittees] = useState<AtlasFormCommitteeOption[]>([]);

  const [files, setFiles] = useState<FilePreview[]>([]);
  const [pujaCommitteeId, setPujaCommitteeId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.items)).catch(() => {});
    if (isAdmin) {
      adminAtlasService.formOptions().then((opts) => setCommittees(opts.committees)).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    if (categoryId) {
      subcategoryService
        .list({ categoryId: Number(categoryId), perPage: 100, sortDir: 'asc' })
        .then((res) => setSubcategories(res.items))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
      setSubcategoryId('');
    }
  }, [categoryId]);

  useEffect(() => () => {
    files.forEach((entry) => {
      if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
    });
  }, [files]);

  const photoCount = useMemo(
    () => files.filter((entry) => entry.file.type.startsWith('image/')).length,
    [files],
  );
  const videoCount = useMemo(
    () => files.filter((entry) => entry.file.type.startsWith('video/')).length,
    [files],
  );

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) return;

    setFiles((prev) => {
      prev.forEach((entry) => {
        if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      });
      return selected.map((file) => ({
        file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      }));
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!files.length) {
      toast.warning('Please select at least one photo or video.');
      return;
    }
    if (!categoryId) {
      toast.warning('Category is required.');
      return;
    }
    if (isAdmin && !pujaCommitteeId) {
      toast.warning('Please select a puja committee.');
      return;
    }

    setUploading(true);
    setError(null);

    const data = new FormData();
    files.forEach((entry) => data.append('files', entry.file));
    data.append('categoryId', String(categoryId));
    if (subcategoryId) data.append('subcategoryId', String(subcategoryId));
    if (title.trim()) data.append('title', title.trim());
    if (description.trim()) data.append('description', description.trim());
    if (isAdmin && pujaCommitteeId) data.append('pujaCommitteeId', String(pujaCommitteeId));

    try {
      if (isAdmin) {
        await adminMediaService.upload(data);
      } else {
        await committeeMediaService.upload(data);
      }
      toast.success(
        files.length === 1
          ? 'Media uploaded and queued for processing.'
          : `${files.length} files uploaded and queued for processing.`,
      );
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="gallery-upload-form">
      {error && <Alert tone="danger">{error}</Alert>}

      <div className="gallery-upload-form__grid">
        <Card title="Upload Files" className="widget-card">
          {isAdmin && (
            <div className="field">
              <label className="field__label" htmlFor="mediaCommittee">
                Committee <span className="field__required">*</span>
              </label>
              <select
                id="mediaCommittee"
                className="field__control"
                required
                value={pujaCommitteeId}
                onChange={(e) => setPujaCommitteeId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select committee</option>
                {committees.map((committee) => (
                  <option key={committee.id} value={committee.id}>
                    {committee.committeeName}
                    {committee.registrationNo ? ` — ${committee.registrationNo}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label className="field__label" htmlFor="mediaFiles">
              Media files <span className="field__required">*</span>
            </label>
            <input
              id="mediaFiles"
              type="file"
              multiple
              required={files.length === 0}
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              className="field__control"
              onChange={handleFilesChange}
            />
            <p className="field__hint">
              Select one or more files. Photos up to 10 MB (jpg, png, webp). Videos up to 50 MB (mp4, webm, mov).
            </p>
          </div>

          {files.length > 0 && (
            <div className="gallery-upload-form__summary">
              Selected: <strong>{photoCount}</strong> image{photoCount === 1 ? '' : 's'},{' '}
              <strong>{videoCount}</strong> video{videoCount === 1 ? '' : 's'}
            </div>
          )}

          {files.length > 0 && (
            <div className="gallery-upload-form__previews">
              {files.map((entry, index) => (
                <div key={`${entry.file.name}-${index}`} className="gallery-upload-form__preview-card">
                  <div className="gallery-upload-form__preview-media">
                    {entry.previewUrl ? (
                      <img src={entry.previewUrl} alt="" className="gallery-upload-form__preview-image" />
                    ) : (
                      <div className="gallery-upload-form__preview-video">
                        <span>Video</span>
                        <small>{entry.file.name}</small>
                      </div>
                    )}
                  </div>
                  <div className="gallery-upload-form__preview-meta">
                    <div className="gallery-upload-form__preview-name">{entry.file.name}</div>
                    <Button type="button" variant="danger" size="sm" onClick={() => removeFile(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Details & Metadata" className="widget-card">
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label" htmlFor="mediaCategory">
                Category <span className="field__required">*</span>
              </label>
              <select
                id="mediaCategory"
                className="field__control"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="mediaSubcategory">Subcategory</label>
              <select
                id="mediaSubcategory"
                className="field__control"
                value={subcategoryId}
                disabled={!subcategories.length}
                onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select subcategory</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="mediaTitle">Title</label>
              <input
                id="mediaTitle"
                type="text"
                className="field__control"
                maxLength={180}
                placeholder="Optional caption applied to all selected files"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label" htmlFor="mediaDescription">Description</label>
              <textarea
                id="mediaDescription"
                rows={4}
                className="field__control"
                maxLength={1000}
                placeholder="Optional notes applied to all selected files"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn--secondary btn--md" onClick={onCancel}>
          Cancel
        </button>
        <Button type="submit" variant="primary" size="md" disabled={uploading}>
          {uploading ? 'Uploading…' : files.length > 1 ? `Upload ${files.length} files` : 'Upload and queue processing'}
        </Button>
      </div>
    </form>
  );
}

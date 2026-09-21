import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { categoryService, subcategoryService } from '@/services/contentService';
import { adminMediaService, committeeMediaService } from '@/services/galleryService';
import { adminAtlasService } from '@/services/atlasService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { mediaStreamUrl } from '@/utils/galleryHelpers';
import type { AtlasFormCommitteeOption } from '@/types/atlas';
import type { Category, Subcategory } from '@/types/content';
import type { CommitteeMedia } from '@/types/gallery';

import '@/styles/gallery-admin.css';

interface MediaEditPageProps {
  mode?: 'admin' | 'committee';
}

export function MediaEditPage({ mode }: MediaEditPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { can } = useAuth();
  const isAdmin = mode === 'admin' || can(PERMISSIONS.MODERATE_MEDIA);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<CommitteeMedia | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [committees, setCommittees] = useState<AtlasFormCommitteeOption[]>([]);

  const [pujaCommitteeId, setPujaCommitteeId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('');
  const [replaceFile, setReplaceFile] = useState<File | null>(null);

  const listRoute = isAdmin ? ROUTES.GALLERY_MEDIA : ROUTES.MY_COMMITTEE_MEDIA;
  const detailRoute = isAdmin ? ROUTES.GALLERY_DETAIL : ROUTES.MY_COMMITTEE_MEDIA_DETAIL;
  const listLabel = isAdmin ? 'All Media' : 'My Media';

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.items)).catch(() => {});
    if (isAdmin) {
      adminAtlasService.formOptions().then((opts) => setCommittees(opts.committees)).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetcher = isAdmin ? adminMediaService.get : committeeMediaService.get;
    fetcher(Number(id))
      .then((item) => {
        setMedia(item);
        setTitle(item.title ?? '');
        setDescription(item.description ?? '');
        setCategoryId(item.categoryId ?? '');
        setSubcategoryId(item.subcategoryId ?? '');
        setPujaCommitteeId(item.pujaCommitteeId ?? '');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load media.'))
      .finally(() => setLoading(false));
  }, [id, isAdmin]);

  useEffect(() => {
    if (categoryId) {
      subcategoryService
        .list({ categoryId: Number(categoryId), perPage: 100, sortDir: 'asc' })
        .then((res) => setSubcategories(res.items))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !categoryId) {
      toast.warning('Category is required.');
      return;
    }
    if (isAdmin && !pujaCommitteeId) {
      toast.warning('Please select a committee.');
      return;
    }

    setSaving(true);
    setError(null);

    const data = new FormData();
    data.append('categoryId', String(categoryId));
    if (subcategoryId) data.append('subcategoryId', String(subcategoryId));
    data.append('title', title.trim());
    data.append('description', description.trim());
    if (isAdmin && pujaCommitteeId) data.append('pujaCommitteeId', String(pujaCommitteeId));
    if (replaceFile) data.append('file', replaceFile);

    try {
      if (isAdmin) {
        await adminMediaService.update(Number(id), data);
      } else {
        await committeeMediaService.update(Number(id), data);
      }
      toast.success('Media updated successfully.');
      navigate(detailRoute(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page">
      <GalleryModuleHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: listLabel, to: listRoute },
          { label: 'Edit Media' },
        ]}
        title="Edit Media"
        subtitle={media?.title || media?.originalFilename || 'Update media details or replace the file.'}
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="widget-card">
        {media && (
          <div style={{ marginBottom: 'var(--space-400)' }}>
            {media.mediaType === 'PHOTO' ? (
              <img
                src={mediaStreamUrl(media)}
                alt=""
                style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
              />
            ) : (
              <video
                controls
                src={mediaStreamUrl(media)}
                style={{ width: '100%', maxHeight: '280px', borderRadius: 'var(--radius-md)' }}
              />
            )}
          </div>
        )}

        <form onSubmit={save}>
          <div className="form-grid form-grid--2">
            {isAdmin && (
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="editCommittee">Committee</label>
                <select
                  id="editCommittee"
                  className="field__control"
                  required
                  value={pujaCommitteeId}
                  onChange={(e) => setPujaCommitteeId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Select committee</option>
                  {committees.map((committee) => (
                    <option key={committee.id} value={committee.id}>{committee.committeeName}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="field">
              <label className="field__label" htmlFor="editCategory">Category <span className="field__required">*</span></label>
              <select
                id="editCategory"
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
              <label className="field__label" htmlFor="editSubcategory">Subcategory</label>
              <select
                id="editSubcategory"
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
              <label className="field__label" htmlFor="editTitle">Title</label>
              <input id="editTitle" className="field__control" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label" htmlFor="editDescription">Description</label>
              <textarea id="editDescription" rows={4} className="field__control" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label" htmlFor="editFile">Replace media file</label>
              <input
                id="editFile"
                type="file"
                className="field__control"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={(e) => setReplaceFile(e.target.files?.[0] ?? null)}
              />
              <p className="field__hint">
                Optional. Current file: <strong>{media?.originalFilename}</strong>.
                Replacing the file will reset moderation and remove it from the public gallery until approved again.
              </p>
            </div>
          </div>

          <div className="form-actions">
            <Link to={id ? detailRoute(id) : listRoute} className="btn btn--secondary btn--md">Cancel</Link>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default MediaEditPage;

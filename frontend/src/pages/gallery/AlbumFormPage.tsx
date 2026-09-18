import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { AlbumMediaPicker } from '@/components/gallery/AlbumMediaPicker';
import { MediaPreviewModal } from '@/components/gallery/MediaPreviewModal';
import { MediaPreviewThumb } from '@/components/gallery/MediaPreviewThumb';
import { ROUTES } from '@/constants/routes';
import { albumService, committeeAlbumService } from '@/services/galleryService';
import { categoryService, subcategoryService } from '@/services/contentService';
import { adminAtlasService } from '@/services/atlasService';
import { useToast } from '@/hooks/useToast';
import { formatMediaType } from '@/utils/galleryHelpers';
import type { CommitteeMedia } from '@/types/gallery';
import type { Category, Subcategory } from '@/types/content';
import type { AtlasFormCommitteeOption } from '@/types/atlas';

import '@/styles/gallery-admin.css';

interface AlbumFormPageProps {
  mode: 'admin' | 'committee';
}

export function AlbumFormPage({ mode }: AlbumFormPageProps) {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const isAdmin = mode === 'admin';
  const navigate = useNavigate();
  const toast = useToast();
  const service = isAdmin ? albumService : committeeAlbumService;
  const listRoute = isAdmin ? ROUTES.GALLERY_ALBUMS : ROUTES.MY_COMMITTEE_ALBUMS;
  const detailRoute = isAdmin ? ROUTES.GALLERY_ALBUM_DETAIL : ROUTES.MY_COMMITTEE_ALBUM_DETAIL;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [committees, setCommittees] = useState<AtlasFormCommitteeOption[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('');
  const [pujaCommitteeId, setPujaCommitteeId] = useState<number | ''>('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<CommitteeMedia[]>([]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<CommitteeMedia | null>(null);

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
        .catch(() => {});
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    service
      .get(Number(id))
      .then((album) => {
        setTitle(album.title);
        setDescription(album.description ?? '');
        setCategoryId(album.categoryId);
        setSubcategoryId(album.subcategoryId ?? '');
        setPujaCommitteeId(album.pujaCommitteeId);
        setStatus(album.status);
        setIsPublic(album.isPublic);
        setSelectedMedia(album.media ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load album.'))
      .finally(() => setLoading(false));
  }, [id, service]);

  const loadPickerPage = useCallback(
    async (query: { page: number; perPage: number; mediaType?: CommitteeMedia['mediaType']; search?: string }) => {
      const committeeId = isAdmin ? Number(pujaCommitteeId) : undefined;
      return service.mediaPicker({
        ...query,
        pujaCommitteeId: committeeId,
      });
    },
    [isAdmin, pujaCommitteeId, service],
  );

  const openPicker = () => {
    if (isAdmin && !pujaCommitteeId) {
      toast.warning('Select a committee before choosing media.');
      return;
    }
    setPickerOpen(true);
  };

  const removeMedia = (mediaId: number) => {
    setSelectedMedia((prev) => prev.filter((item) => item.id !== mediaId));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) {
      toast.warning('Title and category are required.');
      return;
    }
    if (isAdmin && !pujaCommitteeId) {
      toast.warning('Select a puja committee.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: Number(categoryId),
        subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
        isPublic,
        status,
        ...(isAdmin ? { pujaCommitteeId: Number(pujaCommitteeId) } : {}),
        mediaIds: selectedMedia.map((item) => item.id),
      };

      if (isEdit && id) {
        await service.update(Number(id), payload);
        toast.success('Album updated.');
        navigate(detailRoute(id));
      } else if (isAdmin) {
        const created = await albumService.create({
          title: payload.title,
          description: payload.description,
          categoryId: payload.categoryId,
          subcategoryId: payload.subcategoryId,
          pujaCommitteeId: Number(pujaCommitteeId),
          isPublic: payload.isPublic,
          status: payload.status,
          mediaIds: selectedMedia.map((item) => item.id),
        });
        toast.success('Album created.');
        navigate(detailRoute(created.id));
      } else {
        const created = await committeeAlbumService.create({
          title: payload.title,
          description: payload.description,
          categoryId: payload.categoryId,
          subcategoryId: payload.subcategoryId,
          isPublic: payload.isPublic,
          status: payload.status,
          mediaIds: selectedMedia.map((item) => item.id),
        });
        toast.success('Album created.');
        navigate(detailRoute(created.id));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save album.');
    } finally {
      setSaving(false);
    }
  };

  const photoCount = selectedMedia.filter((item) => item.mediaType === 'PHOTO').length;
  const videoCount = selectedMedia.filter((item) => item.mediaType === 'VIDEO').length;

  if (loading) return <PageLoader />;

  return (
    <div className="page">
      <header className="page__header">
        <Link to={listRoute} className="btn btn--secondary btn--sm" style={{ marginBottom: 'var(--space-200)' }}>
          ← Back to albums
        </Link>
        <h1 className="page__title">{isEdit ? 'Edit Album' : 'Create Album'}</h1>
        <p className="page__subtitle">Organize approved committee media into albums.</p>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={save}>
        <div className="album-form__grid">
          <Card title="Album Information" className="widget-card">
            {isAdmin && (
              <div className="field">
                <label className="field__label" htmlFor="albumCommittee">Puja Committee *</label>
                <select
                  id="albumCommittee"
                  className="field__control"
                  required
                  value={pujaCommitteeId}
                  onChange={(e) => {
                    setPujaCommitteeId(e.target.value ? Number(e.target.value) : '');
                    setSelectedMedia([]);
                  }}
                >
                  <option value="">Select committee</option>
                  {committees.map((c) => (
                    <option key={c.id} value={c.id}>{c.committeeName}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="field">
              <label className="field__label" htmlFor="albumTitle">Title *</label>
              <input id="albumTitle" className="field__control" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="albumCategory">Category *</label>
              <select id="albumCategory" className="field__control" required value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            {subcategories.length > 0 && (
              <div className="field">
                <label className="field__label" htmlFor="albumSubcategory">Subcategory</label>
                <select id="albumSubcategory" className="field__control" value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Select subcategory</option>
                  {subcategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
              </div>
            )}

            <div className="field">
              <label className="field__label" htmlFor="albumDescription">Description</label>
              <textarea id="albumDescription" className="field__control" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="albumStatus">Status *</label>
              <select id="albumStatus" className="field__control" value={status} onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <fieldset className="field">
              <legend className="field__label">Visibility</legend>
              <label className="album-form__radio">
                <input type="radio" name="visibility" checked={!isPublic} onChange={() => setIsPublic(false)} />
                Private
              </label>
              <label className="album-form__radio">
                <input type="radio" name="visibility" checked={isPublic} onChange={() => setIsPublic(true)} />
                Public
              </label>
            </fieldset>
          </Card>

          <Card title="Album Media" className="widget-card">
            <div className="album-form__media-toolbar">
              <div className="album-form__media-counts">
                Selected: <strong>{photoCount}</strong> image{photoCount === 1 ? '' : 's'},{' '}
                <strong>{videoCount}</strong> video{videoCount === 1 ? '' : 's'}
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={openPicker}>
                Select Images & Videos
              </Button>
            </div>

            {selectedMedia.length === 0 ? (
              <p className="album-form__empty">No media selected yet. Choose approved committee photos and videos.</p>
            ) : (
              <div className="album-form__selected-grid">
                {selectedMedia.map((item) => (
                  <div key={item.id} className="album-form__selected-card">
                    <MediaPreviewThumb item={item} size="md" onClick={() => setPreviewItem(item)} />
                    <div className="album-form__selected-body">
                      <div className="album-form__selected-title">{item.title || item.originalFilename}</div>
                      <div className="album-form__selected-type">{formatMediaType(item.mediaType)}</div>
                      <div className="album-form__selected-actions">
                        <Button type="button" variant="secondary" size="sm" onClick={() => setPreviewItem(item)}>
                          Preview
                        </Button>
                        <Button type="button" variant="danger" size="sm" onClick={() => removeMedia(item.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="album-form__footer">
          <Link to={listRoute} className="btn btn--secondary btn--md">Cancel</Link>
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Album' : 'Create Album'}
          </Button>
        </div>
      </form>

      <AlbumMediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onApply={setSelectedMedia}
        selectedIds={selectedMedia.map((item) => item.id)}
        initialSelected={selectedMedia}
        loadPage={loadPickerPage}
        committeeRequired={isAdmin}
        committeeSelected={Boolean(pujaCommitteeId)}
      />

      <MediaPreviewModal
        item={previewItem}
        open={previewItem !== null}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
}

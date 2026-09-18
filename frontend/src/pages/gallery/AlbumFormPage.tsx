import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { albumService, committeeAlbumService } from '@/services/galleryService';
import { categoryService, subcategoryService } from '@/services/contentService';
import { adminAtlasService } from '@/services/atlasService';
import { useToast } from '@/hooks/useToast';
import { mediaThumbnailUrl } from '@/utils/galleryHelpers';
import type { CommitteeMedia, MediaType } from '@/types/gallery';
import type { Category, Subcategory } from '@/types/content';
import type { AtlasFormCommitteeOption } from '@/types/atlas';
import type { PaginationMeta } from '@/types';

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
  const [pickerType, setPickerType] = useState<MediaType>('PHOTO');
  const [pickerItems, setPickerItems] = useState<CommitteeMedia[]>([]);
  const [pickerPagination, setPickerPagination] = useState<PaginationMeta | undefined>();
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerSelection, setPickerSelection] = useState<number[]>([]);

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

  const loadPicker = useCallback(async () => {
    const committeeId = isAdmin ? Number(pujaCommitteeId) : undefined;
    if (isAdmin && !committeeId) {
      setPickerItems([]);
      return;
    }
    const res = await service.mediaPicker({
      page: pickerPage,
      perPage: 12,
      mediaType: pickerType,
      search: pickerSearch || undefined,
      pujaCommitteeId: committeeId,
    });
    setPickerItems(res.items);
    setPickerPagination(res.pagination);
  }, [isAdmin, pickerPage, pickerSearch, pickerType, pujaCommitteeId, service]);

  useEffect(() => {
    if (pickerOpen) void loadPicker().catch(() => {});
  }, [pickerOpen, loadPicker]);

  const openPicker = (type: MediaType) => {
    if (isAdmin && !pujaCommitteeId) {
      toast.warning('Select a committee before choosing media.');
      return;
    }
    setPickerType(type);
    setPickerSelection(selectedMedia.filter((m) => m.mediaType === type).map((m) => m.id));
    setPickerPage(1);
    setPickerOpen(true);
  };

  const applyPickerSelection = () => {
    const pickedFromPage = pickerItems.filter((item) => pickerSelection.includes(item.id));
    const keptExisting = selectedMedia.filter(
      (item) =>
        item.mediaType === pickerType
        && pickerSelection.includes(item.id)
        && !pickedFromPage.some((picked) => picked.id === item.id),
    );
    const mergedType = [...keptExisting, ...pickedFromPage];
    const otherType = selectedMedia.filter((item) => item.mediaType !== pickerType);
    const unique = Array.from(new Map([...otherType, ...mergedType].map((item) => [item.id, item])).values());
    setSelectedMedia(unique);
    setPickerOpen(false);
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
              <label style={{ display: 'flex', gap: 'var(--space-150)', marginBottom: 'var(--space-100)' }}>
                <input type="radio" name="visibility" checked={!isPublic} onChange={() => setIsPublic(false)} />
                Private
              </label>
              <label style={{ display: 'flex', gap: 'var(--space-150)' }}>
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
              <div style={{ display: 'flex', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
                <Button type="button" variant="secondary" size="sm" onClick={() => openPicker('PHOTO')}>
                  Select Images
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => openPicker('VIDEO')}>
                  Select Videos
                </Button>
              </div>
            </div>

            {selectedMedia.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No media selected yet. Choose approved committee media below.</p>
            ) : (
              <div className="album-form__selected-grid">
                {selectedMedia.map((item) => (
                  <div key={item.id} className="album-form__selected-card">
                    <div className="album-form__selected-media">
                      {item.mediaType === 'PHOTO' ? (
                        <img src={mediaThumbnailUrl(item)} alt="" className="album-form__selected-image" />
                      ) : item.thumbnailUrl ? (
                        <img src={mediaThumbnailUrl(item)} alt="" className="album-form__selected-image" />
                      ) : (
                        <div className="album-form__selected-video">▶</div>
                      )}
                    </div>
                    <div className="album-form__selected-body">
                      <div className="album-form__selected-title">{item.title || item.originalFilename}</div>
                      <Button type="button" variant="danger" size="sm" onClick={() => removeMedia(item.id)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
          <Link to={listRoute} className="btn btn--secondary btn--md">Cancel</Link>
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Album' : 'Create Album'}
          </Button>
        </div>
      </form>

      <Modal
        open={pickerOpen}
        title={`Select ${pickerType === 'PHOTO' ? 'Images' : 'Videos'}`}
        onClose={() => setPickerOpen(false)}
      >
        <div style={{ display: 'flex', gap: 'var(--space-200)', marginBottom: 'var(--space-300)' }}>
          <input
            className="field__control"
            placeholder="Search media"
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => { setPickerPage(1); void loadPicker(); }}>
            Search
          </Button>
        </div>

        <div className="public-gallery__grid">
          {pickerItems.map((item) => (
            <label key={item.id} className="public-gallery-card" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={pickerSelection.includes(item.id)}
                onChange={(e) => {
                  setPickerSelection((prev) =>
                    e.target.checked ? [...prev, item.id] : prev.filter((value) => value !== item.id),
                  );
                }}
                style={{ position: 'absolute', margin: 'var(--space-150)' }}
              />
              <div className="public-gallery-card__media">
                <img src={mediaThumbnailUrl(item)} alt="" className="public-gallery-card__thumb" />
              </div>
              <div className="public-gallery-card__body">
                <h2 className="public-gallery-card__title">{item.title || item.originalFilename}</h2>
              </div>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-300)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-150)' }}>
            <Button type="button" variant="secondary" size="sm" disabled={pickerPage <= 1} onClick={() => setPickerPage((p) => p - 1)}>
              Previous
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled={!pickerPagination?.hasNextPage} onClick={() => setPickerPage((p) => p + 1)}>
              Next
            </Button>
          </div>
          <Button type="button" variant="primary" size="md" onClick={applyPickerSelection}>
            Apply Selection
          </Button>
        </div>
      </Modal>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';

import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { contentMediaService } from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { ContentMedia, ContentMediaListQuery, ContentMediaType } from '@/types/content';
import type { PaginationMeta } from '@/types';
import { articleFileUrl } from '@/utils/articleHelpers';

import '@/styles/articles-admin.css';

const TYPE_OPTIONS: Array<{ value: ContentMediaType | ''; label: string }> = [
  { value: '', label: 'All types' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
];

function mediaUrl(item: ContentMedia): string {
  return item.url ?? articleFileUrl(item.filePath);
}

export function MediaLibraryPage() {
  const toast = useToast();
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_MEDIA);

  const [items, setItems] = useState<ContentMedia[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [query, setQuery] = useState<ContentMediaListQuery>({ page: 1, perPage: 20 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploading, setUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ContentMedia | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contentMediaService.list(query);
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load media library.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((q) => ({ ...q, search: search.trim() || undefined, page: 1 }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.warning('Please choose a file to upload.');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', uploadFile);
      if (uploadTitle.trim()) form.append('title', uploadTitle.trim());
      if (uploadAlt.trim()) form.append('altText', uploadAlt.trim());
      await contentMediaService.upload(form);
      toast.success('Media uploaded successfully.');
      setUploadFile(null);
      setUploadTitle('');
      setUploadAlt('');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = async (item: ContentMedia) => {
    const url = mediaUrl(item);
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard.');
    } catch {
      toast.error('Could not copy URL.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await contentMediaService.remove(deleteTarget.id);
      toast.success('Media deleted.');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <GalleryModuleHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Media Library' },
        ]}
        title="Media Library"
        subtitle="Upload and manage images, videos, and documents for article content."
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {canManage && (
        <div className="content-media-upload-card">
          <div className="content-media-upload-card__body">
            <form className="content-media-upload-form" onSubmit={handleUpload}>
              <div className="field">
                <label className="field__label" htmlFor="mediaFile">File</label>
                <input
                  id="mediaFile"
                  type="file"
                  className="field__control"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="mediaTitle">Title</label>
                <input
                  id="mediaTitle"
                  type="text"
                  className="field__control"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="mediaAlt">Alt text</label>
                <input
                  id="mediaAlt"
                  type="text"
                  className="field__control"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn--primary btn--md" disabled={uploading}>
                <i className="fas fa-upload" aria-hidden="true" /> {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="content-media-grid-card">
        <div className="content-media-grid-card__filters">
          <form
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-2)', alignItems: 'end' }}
            onSubmit={handleSearch}
          >
            <div className="field">
              <input
                type="search"
                className="field__control"
                placeholder="Search media"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="field">
              <select
                className="field__control"
                value={query.type ?? ''}
                onChange={(e) =>
                  setQuery((q) => ({
                    ...q,
                    type: (e.target.value as ContentMediaType) || undefined,
                    page: 1,
                  }))
                }
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn--outline-primary btn--md">Search</button>
          </form>
        </div>

        {loading ? (
          <p style={{ padding: 'var(--space-4)', color: 'var(--colour-ink-soft)' }}>Loading media…</p>
        ) : items.length === 0 ? (
          <p style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--colour-ink-soft)' }}>
            No media found.
          </p>
        ) : (
          <div className="content-media-grid">
            {items.map((item) => {
              const url = mediaUrl(item);
              return (
                <div key={item.id} className="content-media-card">
                  <div className="content-media-card__preview">
                    {item.fileType === 'image' ? (
                      <img src={url} alt={item.altText ?? item.title ?? item.originalName} />
                    ) : (
                      <i
                        className={`fas fa-${item.fileType === 'video' ? 'circle-play' : 'file-pdf'} fa-2x`}
                        aria-hidden="true"
                        style={{ color: 'var(--colour-ink-faint)' }}
                      />
                    )}
                  </div>
                  <div className="content-media-card__title" title={item.title ?? item.originalName}>
                    {item.title || item.originalName}
                  </div>
                  <div className="content-media-card__actions">
                    <button
                      type="button"
                      className="articles-action-btn"
                      title="Copy URL"
                      onClick={() => void handleCopyUrl(item)}
                    >
                      <i className="fas fa-clipboard" aria-hidden="true" />
                    </button>
                    {canManage && (
                      <button
                        type="button"
                        className="articles-action-btn"
                        title="Delete"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <i className="fas fa-trash" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.lastPage > 1 && (
          <div className="articles-list-card__pagination">
            <Pagination meta={pagination} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Media"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.title ?? deleteTarget.originalName}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

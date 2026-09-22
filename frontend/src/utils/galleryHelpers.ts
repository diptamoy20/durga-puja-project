import type { CommitteeMedia, MediaModerationStatus, MediaType } from '@/types/gallery';

export function galleryFileUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');
  const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:5050/api/v1').replace(/\/$/, '');
  return `${base}/gallery/files/${normalized}`;
}

export function mediaStreamUrl(item: {
  streamUrl?: string | null;
  storedPath?: string | null;
  mimeType?: string | null;
}): string {
  if (item.streamUrl) return item.streamUrl;
  return galleryFileUrl(item.storedPath);
}

/** Image-safe thumbnail URL — never returns a video file URL for use in `<img>`. */
export function mediaThumbnailUrl(item: {
  mediaType?: MediaType | string;
  thumbnailUrl?: string | null;
  thumbnailPath?: string | null;
  storedPath?: string | null;
}): string {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  if (item.thumbnailPath) return galleryFileUrl(item.thumbnailPath);
  if (item.mediaType === 'PHOTO' || item.mediaType === 'photo') {
    return galleryFileUrl(item.storedPath);
  }
  return '';
}

export function formatMediaStatus(status: MediaModerationStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatMediaType(type: MediaType): string {
  return type === 'PHOTO' ? 'Photo' : 'Video';
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mediaStatusTone(status: MediaModerationStatus): 'default' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    default:
      return 'warning';
  }
}

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

export function formatMediaDate(value?: string | null): string {
  if (!value) return '—';
  return dateTimeFormat.format(new Date(value));
}

export function mediaDetailRows(item: CommitteeMedia) {
  return [
    { label: 'Title', value: item.title || '—' },
    { label: 'Description', value: item.description || '—' },
    { label: 'Media type', value: formatMediaType(item.mediaType) },
    { label: 'Status', value: formatMediaStatus(item.status) },
    { label: 'Committee', value: item.committee?.committeeName ?? '—' },
    { label: 'Category', value: item.category?.name ?? '—' },
    { label: 'Subcategory', value: item.subcategory?.name ?? '—' },
    { label: 'Venue', value: item.venueName || item.committee?.venueName || '—' },
    { label: 'Original file', value: item.originalFilename },
    { label: 'File size', value: formatFileSize(item.fileSize) },
    { label: 'MIME type', value: item.mimeType || '—' },
    { label: 'Uploaded by', value: item.uploadedBy?.name ?? '—' },
    { label: 'Uploaded at', value: formatMediaDate(item.createdAt) },
    { label: 'Moderated by', value: item.moderatedBy?.name ?? '—' },
    { label: 'Moderated at', value: formatMediaDate(item.moderatedAt) },
    ...(item.rejectionReason
      ? [{ label: 'Rejection reason', value: item.rejectionReason }]
      : []),
  ];
}

import type { MediaModerationStatus, MediaType } from '@/types/gallery';

export function galleryFileUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
  const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:5050/api/v1').replace(/\/$/, '');
  return `${base}/gallery/files/${path.replace(/\\/g, '/')}`;
}

export function mediaStreamUrl(item: { streamUrl?: string | null; storedPath?: string | null }): string {
  return item.streamUrl ?? galleryFileUrl(item.storedPath);
}

export function mediaThumbnailUrl(item: {
  thumbnailUrl?: string | null;
  thumbnailPath?: string | null;
  storedPath?: string | null;
}): string {
  return item.thumbnailUrl ?? galleryFileUrl(item.thumbnailPath ?? item.storedPath);
}

export function formatMediaStatus(status: MediaModerationStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatMediaType(type: MediaType): string {
  return type === 'PHOTO' ? 'Photo' : 'Video';
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

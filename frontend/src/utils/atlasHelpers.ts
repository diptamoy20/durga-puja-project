import type { AtlasStatus } from '@/types/atlas';

const STATUS_LABELS: Record<AtlasStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted for Moderation',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function formatAtlasStatus(status: AtlasStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function atlasStatusTone(status: AtlasStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'UNDER_REVIEW':
      return 'warning';
    case 'SUBMITTED':
      return 'info';
    case 'REJECTED':
      return 'danger';
    case 'DRAFT':
    default:
      return 'default';
  }
}

export function atlasFileUrl(path?: string | null): string {
  if (!path) return '/assets/pandal-placeholder.svg';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
  const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:5050/api/v1').replace(/\/$/, '');
  return `${base}/atlas/files/${path.replace(/\\/g, '/')}`;
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));
}

import type { ArticleStatus } from '@/types/content';
import { ROUTES } from '@/constants/routes';

const STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending Review',
  IN_REVIEW: 'In Review',
  APPROVED: 'Pending Approval',
  REJECTED: 'Rejected',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export function formatArticleStatus(status: ArticleStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function articleStatusTone(
  status: ArticleStatus,
): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted' {
  switch (status) {
    case 'PUBLISHED':
      return 'success';
    case 'APPROVED':
      return 'info';
    case 'SCHEDULED':
      return 'info';
    case 'PENDING_REVIEW':
    case 'IN_REVIEW':
      return 'warning';
    case 'REJECTED':
      return 'danger';
    case 'ARCHIVED':
    case 'DRAFT':
    default:
      return 'muted';
  }
}

const FALLBACK_ARTICLE_IMAGE =
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80';

export function articleFileUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
  const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:5050/api/v1').replace(/\/$/, '');
  return `${base}/content/files/${path.replace(/\\/g, '/')}`;
}

export function articleFeaturedImageUrl(path?: string | null): string {
  return articleFileUrl(path) || FALLBACK_ARTICLE_IMAGE;
}

export function formatArticleDate(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function articleCategoryName(article: {
  subcategory?: { name?: string; category?: { name?: string } | null } | null;
}): string {
  return article.subcategory?.category?.name ?? article.subcategory?.name ?? 'News';
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

export const ARTICLE_LIST_LABEL = 'Articles';

export const ARTICLE_STATUS_NAV_LABELS: Record<ArticleStatus, string> = {
  DRAFT: 'Drafts',
  PENDING_REVIEW: 'Pending Review',
  IN_REVIEW: 'Pending Review',
  APPROVED: 'Pending Approval',
  REJECTED: 'Rejected',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export function articleListTitle(status?: ArticleStatus): string {
  if (!status) return ARTICLE_LIST_LABEL;
  return ARTICLE_STATUS_NAV_LABELS[status];
}

export function articleListRoute(status?: ArticleStatus): string {
  if (!status) return ROUTES.ARTICLES;
  return `${ROUTES.ARTICLES}?status=${status}`;
}

export function articleListSubtitle(status?: ArticleStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft articles not yet submitted for editorial review.';
    case 'PENDING_REVIEW':
    case 'IN_REVIEW':
      return 'Articles awaiting review or currently being reviewed by editors.';
    case 'APPROVED':
      return 'Approved articles ready to publish or schedule.';
    case 'REJECTED':
      return 'Rejected articles that need revision before resubmission.';
    case 'SCHEDULED':
      return 'Articles scheduled for future publication.';
    case 'PUBLISHED':
      return 'Published articles visible on the public news feed.';
    case 'ARCHIVED':
      return 'Archived articles no longer shown publicly.';
    default:
      return 'Manage and publish editorial articles and festival content.';
  }
}

export interface ArticleStats {
  total: number;
  draft: number;
  in_review: number;
  approved: number;
  rejected: number;
  scheduled: number;
  published: number;
  archived: number;
}

export const ARTICLE_STAT_CARDS: Array<{
  key: keyof ArticleStats;
  label: string;
  status?: ArticleStatus;
  tone?: string;
  icon: string;
}> = [
  { key: 'total', label: 'Total Articles', icon: 'fa-newspaper' },
  { key: 'draft', label: 'Drafts', status: 'DRAFT', tone: 'default', icon: 'fa-file' },
  { key: 'in_review', label: 'In Review', status: 'IN_REVIEW', tone: 'warning', icon: 'fa-hourglass-half' },
  { key: 'approved', label: 'Pending Approval', status: 'APPROVED', tone: 'info', icon: 'fa-check-circle' },
  { key: 'scheduled', label: 'Scheduled', status: 'SCHEDULED', tone: 'info', icon: 'fa-calendar' },
  { key: 'published', label: 'Published', status: 'PUBLISHED', tone: 'success', icon: 'fa-broadcast-tower' },
  { key: 'rejected', label: 'Rejected', status: 'REJECTED', tone: 'danger', icon: 'fa-circle-xmark' },
];

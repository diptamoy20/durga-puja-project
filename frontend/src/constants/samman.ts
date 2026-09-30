import type { NominationStatus } from '@/types/samman';

export const NOMINATION_STATUS_LABELS: Record<NominationStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SHORTLISTED: 'Shortlisted',
};

export function formatNominationStatus(status?: NominationStatus | null): string {
  if (!status) return 'Unknown';
  return NOMINATION_STATUS_LABELS[status] ?? status;
}

export function nominationStatusTone(
  status?: NominationStatus | null,
): 'default' | 'info' | 'warning' | 'success' | 'danger' {
  switch (status) {
    case 'SHORTLISTED':
      return 'info';
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

export const ALLOWED_NOMINATION_TRANSITIONS: Record<NominationStatus, NominationStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['SHORTLISTED'],
  REJECTED: ['UNDER_REVIEW', 'APPROVED'],
  SHORTLISTED: [],
};

export function canTransitionNomination(
  current: NominationStatus,
  target: NominationStatus,
): boolean {
  if (current === target) return false;
  const allowed = ALLOWED_NOMINATION_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

export const SUGGESTED_CATEGORIES = [
  'Best Traditional Pandal',
  'Best Contemporary Pandal',
  'Best Idol Artistry',
  'Best Illumination & Lighting',
  'Eco-Friendly / Green Puja',
  'Social Impact & Inclusion',
  'Best Crowd Management',
  'Heritage & Culture Preservation',
];

export function formatContestDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(d);
  } catch {
    return null;
  }
}



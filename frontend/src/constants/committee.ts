import type { CommitteeStatus } from '@/types/registration';

export const COMMITTEE_ALLOWED_TRANSITIONS: Record<CommitteeStatus, CommitteeStatus[]> = {
  PENDING: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'INACTIVE'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'INACTIVE'],
  APPROVED: ['INACTIVE'],
  REJECTED: ['UNDER_REVIEW'],
  INACTIVE: [],
};

export function canTransitionCommittee(from: CommitteeStatus, to: CommitteeStatus): boolean {
  return COMMITTEE_ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function formatCommitteeStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPujaValue(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

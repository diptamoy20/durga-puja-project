import type { ReactNode } from 'react';
import type { UserStatus } from '@/types';

const STATUS_VARIANTS: Record<string, string> = {
  ACTIVE: 'success',
  APPROVED: 'success',
  VERIFIED: 'success',
  PUBLISHED: 'success',

  PENDING: 'warning',
  PENDING_REVIEW: 'warning',
  IN_REVIEW: 'warning',
  UNDER_REVIEW: 'warning',
  SUBMITTED: 'warning',
  SCHEDULED: 'warning',

  INACTIVE: 'neutral',
  DRAFT: 'neutral',
  ARCHIVED: 'neutral',

  SUSPENDED: 'danger',
  REJECTED: 'danger',
  CANCELLED: 'danger',
};

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

interface StatusBadgeProps {
  status?: UserStatus | string;
  /** Overrides the wording without changing the colour. */
  label?: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'default' | 'muted';
  children?: ReactNode;
}

/** Maps a domain status onto a colour, so statuses read the same everywhere. */
export function StatusBadge({ status, label, tone, children }: StatusBadgeProps) {
  const effectiveStatus = (children?.toString() ?? status ?? '') as string;
  const variant = (
    tone && tone !== 'default'
      ? tone === 'muted'
        ? 'neutral'
        : tone
      : STATUS_VARIANTS[effectiveStatus] ?? 'neutral'
  ) as BadgeProps['variant'];

  const text = children ?? label ?? effectiveStatus.replace(/_/g, ' ').toLowerCase();

  return (
    <span className={`badge badge--${variant}`} style={{ textTransform: 'capitalize' }}>
      {text}
    </span>
  );
}

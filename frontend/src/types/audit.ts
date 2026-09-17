import type { ListQuery } from './api';

export interface AuditLog {
  id: number;
  action: string;
  module: string;
  description: string | null;
  auditableType: string | null;
  auditableId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  /** Null when the acting account has since been deleted. */
  user: { id: number; name: string | null; email: string } | null;
}

export interface AuditLogQuery extends ListQuery {
  module?: string;
  action?: string;
  userId?: number;
}

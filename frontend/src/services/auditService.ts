import api, { unwrapList } from './api';
import type { AuditLog, AuditLogQuery, PaginatedData } from '@/types';

/** Drops empty values so they are not sent as `?module=`. */
function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== '' && value !== null,
    ),
  ) as Record<string, string | number>;
}

export const auditService = {
  list: async (query: AuditLogQuery = {}): Promise<PaginatedData<AuditLog>> => {
    const { items, pagination } = await unwrapList<AuditLog>(
      api.get('/audit-logs', { params: toParams(query) }),
    );

    return {
      items,
      pagination: pagination ?? {
        page: 1,
        perPage: items.length,
        total: items.length,
        lastPage: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  },
};

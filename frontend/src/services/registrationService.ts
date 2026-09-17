import api, { unwrap, unwrapList } from './api';
import type {
  CommitteeListQuery,
  CommitteeStats,
  CommitteeStatus,
  CommitteeUpdatePayload,
  DiasporaListQuery,
  DiasporaRegistration,
  DiasporaStats,
  PujaCommittee,
} from '@/types/registration';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
}

// ---------------------------------------------------------------------------
// Diaspora
// ---------------------------------------------------------------------------

export const diasporaService = {
  list: async (query: DiasporaListQuery = {}): Promise<PaginatedData<DiasporaRegistration>> => {
    const { items, pagination } = await unwrapList<DiasporaRegistration>(
      api.get('/diaspora-verifications', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  get: (id: number): Promise<DiasporaRegistration> =>
    unwrap(api.get(`/diaspora-verifications/${id}`)),

  stats: (): Promise<DiasporaStats> =>
    unwrap(api.get('/diaspora-verifications/stats')),

  verify: (id: number, reason?: string): Promise<DiasporaRegistration> =>
    unwrap(api.post(`/diaspora-verifications/${id}/verify`, { reason })),

  reject: (id: number, reason: string): Promise<DiasporaRegistration> =>
    unwrap(api.post(`/diaspora-verifications/${id}/reject`, { reason })),
};

// ---------------------------------------------------------------------------
// Committees
// ---------------------------------------------------------------------------

export const committeeService = {
  list: async (query: CommitteeListQuery = {}): Promise<PaginatedData<PujaCommittee>> => {
    const { items, pagination } = await unwrapList<PujaCommittee>(
      api.get('/puja-committees', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  get: (id: number): Promise<PujaCommittee> =>
    unwrap(api.get(`/puja-committees/${id}`)),

  stats: (): Promise<CommitteeStats> =>
    unwrap(api.get('/puja-committees/stats')),

  update: (id: number, data: CommitteeUpdatePayload): Promise<PujaCommittee> =>
    unwrap(api.put(`/puja-committees/${id}`, data)),

  changeStatus: (id: number, status: CommitteeStatus, reason?: string): Promise<PujaCommittee> =>
    unwrap(api.post(`/puja-committees/${id}/status`, { status, reason })),

  createPortalAccount: (id: number): Promise<{ userId: number; email: string; generatedPassword?: string }> =>
    unwrap(api.post(`/puja-committees/${id}/create-portal-account`)),

  bulkAction: (ids: number[], action: CommitteeStatus, reason?: string): Promise<{ succeeded: number; failed: number }> =>
    unwrap(api.post('/puja-committees/bulk-action', { ids, action, reason })),
};

// ---------------------------------------------------------------------------
// Public Registration
// ---------------------------------------------------------------------------

export const publicRegistrationService = {
  submitDiaspora: (data: Record<string, unknown>): Promise<{ id: number; registrationNo: string }> =>
    unwrap(api.post('/registrations/diaspora', data)),

  submitCommittee: (data: FormData | Record<string, unknown>): Promise<{ id: number; registrationNo: string }> =>
    unwrap(
      api.post('/registrations/committee', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      }),
    ),

  getThankYou: (type: 'diaspora' | 'committee', id: number): Promise<{ id: number; registrationNo: string; type: string; details?: Record<string, unknown> }> =>
    unwrap(api.get(`/registrations/thank-you/${type}/${id}`)),
};


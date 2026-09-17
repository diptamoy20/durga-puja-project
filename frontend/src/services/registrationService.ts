import api, { unwrap, unwrapList } from './api';
import type {
  CommitteeBulkAction,
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

  update: (id: number, data: CommitteeUpdatePayload | FormData): Promise<PujaCommittee> =>
    unwrap(
      api.put(`/puja-committees/${id}`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      }),
    ),

  changeStatus: (id: number, status: CommitteeStatus, reason?: string): Promise<PujaCommittee> =>
    unwrap(api.post(`/puja-committees/${id}/status`, { status, reason })),

  createPortalAccount: (id: number): Promise<{ userId: number; email: string; generatedPassword?: string }> =>
    unwrap(api.post(`/puja-committees/${id}/create-portal-account`)),

  generateLocalPassword: (id: number): Promise<{ generatedPassword: string }> =>
    unwrap(api.post(`/puja-committees/${id}/generate-local-password`)),

  bulkAction: (
    ids: number[],
    action: CommitteeBulkAction,
    options?: { status?: CommitteeStatus; reason?: string },
  ): Promise<{ succeeded: number; failed: number }> =>
    unwrap(api.post('/puja-committees/bulk-action', { ids, action, ...options })),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/puja-committees/${id}`)),

  exportCsv: async (query: CommitteeListQuery = {}): Promise<void> => {
    const result = await unwrap<{ filename: string; content: string }>(
      api.get('/puja-committees/export/csv', { params: toParams(query) }),
    );
    const blob = new Blob([result.content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename || 'puja-committee-applications.csv';
    link.click();
    URL.revokeObjectURL(url);
  },

  fetchDocument: async (
    id: number,
    document: 'registration_certificate' | 'address_proof' | 'pandal_image',
    download = false,
  ): Promise<Blob> => {
    const response = await api.get(`/puja-committees/${id}/documents/${document}`, {
      params: download ? { download: '1' } : undefined,
      responseType: 'blob',
    });
    return response.data;
  },

  openDocument: async (
    committeeId: number,
    doc: 'registration_certificate' | 'address_proof' | 'pandal_image',
    download = false,
  ): Promise<void> => {
    const blob = await committeeService.fetchDocument(committeeId, doc, download);
    const url = URL.createObjectURL(blob);
    if (download) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc}.file`;
      link.click();
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },

  documentUrl: (id: number, document: 'registration_certificate' | 'address_proof' | 'pandal_image', download = false): string => {
    const base = api.defaults.baseURL ?? '';
    return `${base}/puja-committees/${id}/documents/${document}${download ? '?download=1' : ''}`;
  },
};

// ---------------------------------------------------------------------------
// Public Registration
// ---------------------------------------------------------------------------

export const publicRegistrationService = {
  getCaptcha: (): Promise<{ question: string; captchaToken: string }> =>
    unwrap(api.get('/registrations/captcha')),

  submitDiaspora: (data: Record<string, unknown>): Promise<{ id: number; registrationNo: string }> =>
    unwrap(api.post('/registrations/diaspora', data)),

  submitCommittee: (data: FormData | Record<string, unknown>): Promise<{ id: number; registrationNo: string }> =>
    unwrap(
      api.post('/registrations/committee', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      }),
    ),
};


import api, { unwrap, unwrapList } from './api';
import type {
  PublicAssociation,
  AssociationListQuery,
  AssociationFilterOptions,
  CreateAssociationDto,
  AssociationDetail,
  AssociationStats,
  AssociationStatus,
  AssociationStatusHistory,
} from '@/types/registration';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
}

function normalizeCreatePayload(data: CreateAssociationDto): CreateAssociationDto {
  const out = { ...data };
  for (const key of ['website', 'logoImage', 'coverImage'] as const) {
    if (typeof out[key] === 'string' && out[key].trim() === '') {
      delete out[key];
    }
  }
  return out;
}

export const associationService = {
  list: async (query: AssociationListQuery = {}): Promise<PaginatedData<PublicAssociation>> => {
    const { items, pagination } = await unwrapList<PublicAssociation>(
      api.get('/associations', { params: toParams(query) }),
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

  filterOptions: (): Promise<AssociationFilterOptions> =>
    unwrap(api.get('/associations/filter-options')),

  get: (id: number): Promise<PublicAssociation> =>
    unwrap(api.get(`/associations/${id}`)),

  subscribe: (id: number, data: { email: string; name?: string }): Promise<{ success: boolean; email: string }> =>
    unwrap(api.post(`/associations/${id}/subscribe`, data)),

  unsubscribe: (id: number, email: string): Promise<{ success: boolean; email: string }> =>
    unwrap(api.delete(`/associations/${id}/subscribe`, { data: { email } })),

  // Admin
  adminList: async (query: AssociationListQuery = {}): Promise<PaginatedData<AssociationDetail>> => {
    const { items, pagination } = await unwrapList<AssociationDetail>(
      api.get('/admin/associations', { params: toParams(query) }),
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

  adminGet: (id: number): Promise<AssociationDetail> =>
    unwrap(api.get(`/admin/associations/${id}`)),

  create: (data: CreateAssociationDto): Promise<{ id: number; registrationNo: string; status: string }> =>
    unwrap(api.post('/admin/associations', normalizeCreatePayload(data))),

  import: (items: CreateAssociationDto[]): Promise<{
    total: number;
    succeeded: number;
    failed: number;
    failures: Array<{ name: string; email: string; message: string }>;
  }> => unwrap(api.post('/admin/associations/import', { items: items.map(normalizeCreatePayload) })),

  importExcel: (file: File): Promise<{
    total: number;
    succeeded: number;
    failed: number;
    failures: Array<{ name: string; email: string; message: string }>;
  }> => {
    const data = new FormData();
    data.append('file', file);
    return unwrap(
      api.post('/admin/associations/import/excel', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },

  uploadImage: (file: File): Promise<{ storedPath: string }> => {
    const data = new FormData();
    data.append('file', file);
    return unwrap(
      api.post('/admin/associations/files', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },

  update: (id: number, data: Partial<CreateAssociationDto>): Promise<AssociationDetail> =>
    unwrap(api.put(`/admin/associations/${id}`, data)),

  changeStatus: (id: number, status: string, reason?: string): Promise<{ id: number; status: string }> =>
    unwrap(api.post(`/admin/associations/${id}/status`, { status, reason })),

  /** Build the public file URL for a stored path (e.g., logo, cover image). */
  fileUrl: (relativePath: string): string => {
    const base = api.defaults.baseURL ?? '';
    return `${base}/associations/files/${encodeURIComponent(relativePath)}`;
  },
};

export type {
  PublicAssociation,
  AssociationListQuery,
  AssociationFilterOptions,
  CreateAssociationDto,
  AssociationDetail,
  AssociationStats,
  AssociationStatus,
  AssociationStatusHistory,
};
import api, { unwrap, unwrapList } from './api';
import type { PandalAtlas, PandalFormValues, PandalListQuery } from '@/types/atlas';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
}

// Public atlas
export const publicAtlasService = {
  list: (query: { north?: number; south?: number; east?: number; west?: number; search?: string; limit?: number } = {}) =>
    unwrap<PandalAtlas[]>(api.get('/atlas', { params: toParams(query) })),

  mapData: (query: { north?: number; south?: number; east?: number; west?: number; limit?: number } = {}) =>
    unwrap<PandalAtlas[]>(api.get('/atlas/map-data', { params: toParams(query) })),

  get: (id: number): Promise<PandalAtlas> => unwrap(api.get(`/atlas/${id}`)),
};

// Admin atlas
export const adminAtlasService = {
  list: async (query: PandalListQuery = {}): Promise<PaginatedData<PandalAtlas>> => {
    const { items, pagination } = await unwrapList<PandalAtlas>(
      api.get('/admin/pandal-atlas', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  stats: () => unwrap<Record<string, number>>(api.get('/admin/pandal-atlas/stats')),

  get: (id: number): Promise<PandalAtlas> => unwrap(api.get(`/admin/pandal-atlas/${id}`)),

  create: (data: PandalFormValues): Promise<PandalAtlas> =>
    unwrap(api.post('/admin/pandal-atlas', data)),

  update: (id: number, data: Partial<PandalFormValues>): Promise<PandalAtlas> =>
    unwrap(api.put(`/admin/pandal-atlas/${id}`, data)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/admin/pandal-atlas/${id}`)),

  submit: (id: number): Promise<PandalAtlas> =>
    unwrap(api.post(`/admin/pandal-atlas/${id}/submit`)),

  moderate: (id: number, decision: 'start_review' | 'approve' | 'reject', remarks?: string): Promise<PandalAtlas> =>
    unwrap(api.post(`/admin/pandal-atlas/${id}/moderate`, { decision, remarks })),
};

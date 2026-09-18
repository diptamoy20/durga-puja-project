import api, { unwrap, unwrapList } from './api';
import type {
  AtlasMapDataResponse,
  AtlasFormOptions,
  AtlasStats,
  PandalAtlas,
  PandalFormValues,
  PandalListQuery,
} from '@/types/atlas';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
}

function buildFormData(
  data: Partial<PandalFormValues> & { removePhotos?: string[] },
  photos?: File[],
  virtualTourFile?: File | null,
): FormData {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key === 'removePhotos' && Array.isArray(value)) {
      value.forEach((path) => form.append('removePhotos[]', path));
      return;
    }
    form.append(key, String(value));
  });
  photos?.forEach((file) => form.append('photos', file));
  if (virtualTourFile) form.append('virtual_tour_file', virtualTourFile);
  return form;
}

export const publicAtlasService = {
  list: (query: { north?: number; south?: number; east?: number; west?: number; search?: string; limit?: number } = {}) =>
    unwrap<PandalAtlas[]>(api.get('/atlas', { params: toParams(query) })),

  mapData: (query: { north?: number; south?: number; east?: number; west?: number; limit?: number } = {}) =>
    unwrap<AtlasMapDataResponse>(api.get('/atlas/map-data', { params: toParams(query) })),

  get: (id: number): Promise<PandalAtlas> => unwrap(api.get(`/atlas/${id}`)),
};

export const adminAtlasService = {
  list: async (query: PandalListQuery = {}): Promise<PaginatedData<PandalAtlas>> => {
    const { items, pagination } = await unwrapList<PandalAtlas>(
      api.get('/admin/pandal-atlas', { params: toParams(query) }),
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

  stats: () => unwrap<AtlasStats>(api.get('/admin/pandal-atlas/stats')),

  formOptions: () => unwrap<AtlasFormOptions>(api.get('/admin/pandal-atlas/form-options')),

  get: (id: number): Promise<PandalAtlas> => unwrap(api.get(`/admin/pandal-atlas/${id}`)),

  create: (
    data: PandalFormValues,
    photos?: File[],
    virtualTourFile?: File | null,
  ): Promise<PandalAtlas> =>
    unwrap(
      api.post('/admin/pandal-atlas', buildFormData(data, photos, virtualTourFile), {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),

  update: (
    id: number,
    data: Partial<PandalFormValues> & { removePhotos?: string[] },
    photos?: File[],
    virtualTourFile?: File | null,
  ): Promise<PandalAtlas> =>
    unwrap(
      api.put(`/admin/pandal-atlas/${id}`, buildFormData(data, photos, virtualTourFile), {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/admin/pandal-atlas/${id}`)),

  submit: (id: number): Promise<PandalAtlas> =>
    unwrap(api.post(`/admin/pandal-atlas/${id}/submit`)),

  moderate: (
    id: number,
    decision: 'start_review' | 'approve' | 'reject',
    remarks?: string,
  ): Promise<PandalAtlas> =>
    unwrap(api.post(`/admin/pandal-atlas/${id}/moderate`, { decision, remarks })),
};

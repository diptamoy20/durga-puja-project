import api, { unwrap, unwrapList } from './api';
import type { Album, CommitteeMedia, MediaListQuery, MediaModerationStatus, PublicGalleryFilterOptions } from '@/types/gallery';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
}

// Public gallery
export const publicGalleryService = {
  list: async (query: MediaListQuery = {}): Promise<PaginatedData<CommitteeMedia>> => {
    const { items, pagination } = await unwrapList<CommitteeMedia>(
      api.get('/gallery', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  filterOptions: () => unwrap<PublicGalleryFilterOptions>(api.get('/gallery/filter-options')),

  get: (id: number): Promise<CommitteeMedia> => unwrap(api.get(`/gallery/${id}`)),
};

// Committee member media
export const committeeMediaService = {
  list: async (query: MediaListQuery = {}): Promise<PaginatedData<CommitteeMedia>> => {
    const { items, pagination } = await unwrapList<CommitteeMedia>(
      api.get('/committee/media', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  get: (id: number): Promise<CommitteeMedia> => unwrap(api.get(`/committee/media/${id}`)),

  create: (data: FormData): Promise<CommitteeMedia | { items: CommitteeMedia[]; count: number }> =>
    unwrap(api.post('/committee/media', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })),

  upload: (data: FormData): Promise<CommitteeMedia | { items: CommitteeMedia[]; count: number }> =>
    unwrap(api.post('/committee/media', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })),

  update: (id: number, data: FormData): Promise<CommitteeMedia> =>
    unwrap(api.put(`/committee/media/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/committee/media/${id}`)),
};

// Admin media management
export const adminMediaService = {
  list: async (query: MediaListQuery = {}): Promise<PaginatedData<CommitteeMedia>> => {
    const { items, pagination } = await unwrapList<CommitteeMedia>(
      api.get('/admin/media', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  moderationQueue: async (query: MediaListQuery = {}): Promise<PaginatedData<CommitteeMedia>> => {
    const { items, pagination } = await unwrapList<CommitteeMedia>(
      api.get('/admin/media/moderation-queue', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  get: (id: number): Promise<CommitteeMedia> => unwrap(api.get(`/admin/media/${id}`)),

  upload: (data: FormData): Promise<CommitteeMedia | { items: CommitteeMedia[]; count: number }> =>
    unwrap(api.post('/admin/media', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })),

  update: (id: number, data: FormData): Promise<CommitteeMedia> =>
    unwrap(api.put(`/admin/media/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })),

  moderate: (id: number, decision: MediaModerationStatus, rejectionReason?: string): Promise<CommitteeMedia> =>
    unwrap(api.post(`/admin/media/${id}/moderate`, {
      decision: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      rejectionReason,
    })),
};

// Albums
export const albumService = {
  list: async (query: MediaListQuery = {}): Promise<PaginatedData<Album>> => {
    const { items, pagination } = await unwrapList<Album>(
      api.get('/albums', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  get: (id: number): Promise<Album> => unwrap(api.get(`/albums/${id}`)),

  create: (data: {
    categoryId: number; subcategoryId?: number; pujaCommitteeId: number;
    title: string; description?: string; isPublic?: boolean; status?: 'ACTIVE' | 'INACTIVE';
    mediaIds?: number[];
  }): Promise<Album> => unwrap(api.post('/albums', data)),

  update: (id: number, data: Record<string, unknown>): Promise<Album> =>
    unwrap(api.put(`/albums/${id}`, data)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/albums/${id}`)),

  syncMedia: (id: number, mediaIds: number[]): Promise<Album> =>
    unwrap(api.put(`/albums/${id}/media`, { mediaIds })),

  mediaPicker: async (query: MediaListQuery & { mediaType?: string } = {}) => {
    const { items, pagination } = await unwrapList<CommitteeMedia>(
      api.get('/albums/media-picker', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },
};

export const committeeAlbumService = {
  list: async (query: MediaListQuery = {}): Promise<PaginatedData<Album>> => {
    const params = toParams({
      ...query,
      status: query.albumStatus,
      albumStatus: undefined,
    });
    const { items, pagination } = await unwrapList<Album>(
      api.get('/committee/albums', { params }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  get: (id: number): Promise<Album> => unwrap(api.get(`/committee/albums/${id}`)),

  create: (data: {
    categoryId: number; subcategoryId?: number;
    title: string; description?: string; isPublic?: boolean; status?: 'ACTIVE' | 'INACTIVE';
    mediaIds?: number[];
  }): Promise<Album> => unwrap(api.post('/committee/albums', data)),

  update: (id: number, data: Record<string, unknown>): Promise<Album> =>
    unwrap(api.put(`/committee/albums/${id}`, data)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/committee/albums/${id}`)),

  syncMedia: (id: number, mediaIds: number[]): Promise<{ id: number; mediaCount: number }> =>
    unwrap(api.put(`/committee/albums/${id}/media`, { mediaIds })),

  mediaPicker: async (query: MediaListQuery & { mediaType?: string } = {}) => {
    const { items, pagination } = await unwrapList<CommitteeMedia>(
      api.get('/committee/albums/media-picker', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },
};

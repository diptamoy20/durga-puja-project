import api, { unwrap, unwrapList } from './api';
import type {
  ReplayFormValues,
  RsvpFormValues,
  RsvpStatus,
  RsvpSuccessPayload,
  Webinar,
  WebinarFormValues,
  WebinarListQuery,
  WebinarListStats,
  WebinarRegistration,
  WebinarStatus,
} from '@/types/events';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
}

// Public
export const publicWebinarService = {
  list: (): Promise<Webinar[]> => unwrap(api.get('/webinars')),
  replays: (): Promise<Webinar[]> => unwrap(api.get('/webinars/replays')),
  get: (slug: string): Promise<Webinar> => unwrap(api.get(`/webinars/${slug}`)),
  rsvp: (slug: string, data: RsvpFormValues): Promise<RsvpSuccessPayload> =>
    unwrap(api.post(`/webinars/${slug}/rsvp`, data)),
  subscribePush: (data: {
    endpoint: string;
    publicKey?: string;
    authToken?: string;
    contentEncoding?: string;
  }) => unwrap(api.post('/webinars/push/subscribe', data)),
};

// Admin
export const adminWebinarService = {
  list: async (query: WebinarListQuery = {}): Promise<PaginatedData<Webinar> & { stats?: WebinarListStats }> => {
    const response = await api.get('/admin/webinars', { params: toParams(query) });
    const body = response.data;
    if (!body.success) {
      throw { message: body.message, code: body.error?.code ?? 'REQUEST_FAILED', status: response.status };
    }
    const items = (body.data ?? []) as Webinar[];
    const pagination = body.meta?.pagination ?? {
      page: 1,
      perPage: items.length,
      total: items.length,
      lastPage: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
    const stats = (body.meta as { stats?: WebinarListStats } | undefined)?.stats;
    return { items, pagination, stats };
  },

  get: (id: number): Promise<Webinar> => unwrap(api.get(`/admin/webinars/${id}`)),

  create: (data: WebinarFormValues): Promise<Webinar> =>
    unwrap(api.post('/admin/webinars', data)),

  update: (id: number, data: Partial<WebinarFormValues>): Promise<Webinar> =>
    unwrap(api.put(`/admin/webinars/${id}`, data)),

  updateReplay: (id: number, data: ReplayFormValues): Promise<Webinar> =>
    unwrap(api.post(`/admin/webinars/${id}/update-replay`, data)),

  uploadBanner: async (file: File): Promise<{ bannerImage: string; url: string }> => {
    const formData = new FormData();
    formData.append('banner_image', file);
    return unwrap(
      api.post('/admin/webinars/upload-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/admin/webinars/${id}`)),

  toggleStatus: (id: number, status: WebinarStatus): Promise<Webinar> =>
    unwrap(api.post(`/admin/webinars/${id}/toggle-status`, { status })),

  exportRsvps: async (webinarId: number): Promise<void> => {
    const payload = await unwrap<{ filename: string; content: string }>(
      api.get(`/admin/webinars/${webinarId}/export-rsvps`),
    );
    const blob = new Blob([payload.content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = payload.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  },

  rsvps: async (
    webinarId: number,
    query: { page?: number; perPage?: number; status?: RsvpStatus; search?: string } = {},
  ): Promise<PaginatedData<WebinarRegistration>> => {
    const { items, pagination } = await unwrapList<WebinarRegistration>(
      api.get(`/admin/webinars/${webinarId}/rsvps`, { params: toParams(query) }),
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

  updateRsvpStatus: (webinarId: number, rsvpId: number, status: RsvpStatus, notes?: string) =>
    unwrap(api.post(`/admin/webinars/${webinarId}/rsvps/${rsvpId}/status`, { status, notes })),
};

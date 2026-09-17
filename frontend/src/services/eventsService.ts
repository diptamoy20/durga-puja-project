import api, { unwrap, unwrapList } from './api';
import type {
  RsvpStatus,
  Webinar,
  WebinarFormValues,
  WebinarListQuery,
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
  rsvp: (slug: string, data: { name: string; email: string; phone?: string }) =>
    unwrap(api.post(`/webinars/${slug}/rsvp`, data)),
};

// Admin
export const adminWebinarService = {
  list: async (query: WebinarListQuery = {}): Promise<PaginatedData<Webinar>> => {
    const { items, pagination } = await unwrapList<Webinar>(
      api.get('/admin/webinars', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  get: (id: number): Promise<Webinar> => unwrap(api.get(`/admin/webinars/${id}`)),

  create: (data: WebinarFormValues): Promise<Webinar> =>
    unwrap(api.post('/admin/webinars', data)),

  update: (id: number, data: Partial<WebinarFormValues>): Promise<Webinar> =>
    unwrap(api.put(`/admin/webinars/${id}`, data)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/admin/webinars/${id}`)),

  toggleStatus: (id: number, status: WebinarStatus): Promise<Webinar> =>
    unwrap(api.post(`/admin/webinars/${id}/toggle-status`, { status })),

  // RSVPs
  rsvps: async (webinarId: number, query: { page?: number; perPage?: number; status?: RsvpStatus } = {}): Promise<PaginatedData<WebinarRegistration>> => {
    const { items, pagination } = await unwrapList<WebinarRegistration>(
      api.get(`/admin/webinars/${webinarId}/rsvps`, { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  updateRsvpStatus: (webinarId: number, rsvpId: number, status: RsvpStatus, notes?: string) =>
    unwrap(api.post(`/admin/webinars/${webinarId}/rsvps/${rsvpId}/status`, { status, notes })),
};

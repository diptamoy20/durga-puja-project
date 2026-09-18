import api, { unwrap, unwrapList } from './api';
import type {
  PodcastEpisode,
  PodcastFilterQuery,
  PodcastFormValues,
  PodcastReactionType,
  PodcastStats,
  PodcastSubscribeInput,
} from '@/types/podcast';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== '' && value !== null,
    ),
  ) as Record<string, string | number | boolean>;
}

// ---------------------------------------------------------------------------
// Public Podcast Service
// ---------------------------------------------------------------------------
export const publicPodcastService = {
  list: async (query: PodcastFilterQuery = {}): Promise<PaginatedData<PodcastEpisode>> => {
    const { items, pagination } = await unwrapList<PodcastEpisode>(
      api.get('/podcasts', { params: toParams(query) }),
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

  getFeatured: (): Promise<PodcastEpisode | null> =>
    unwrap(api.get('/podcasts/featured')),

  getBySlug: (slug: string): Promise<PodcastEpisode> =>
    unwrap(api.get(`/podcasts/${slug}`)),

  recordPlay: (id: number): Promise<{ playCount: number }> =>
    unwrap(api.post(`/podcasts/${id}/play`)),

  react: (
    id: number,
    reactionType: PodcastReactionType,
  ): Promise<{ likesCount: number; reactions: Record<string, number> }> =>
    unwrap(api.post(`/podcasts/${id}/react`, { reactionType })),

  subscribe: (input: PodcastSubscribeInput): Promise<{ success: boolean; message: string }> =>
    unwrap(api.post('/podcasts/subscribe', input)),

  getRssUrl: (): string => {
    const baseURL = (api.defaults.baseURL || '/api/v1').replace(/\/$/, '');
    return `${baseURL}/podcasts/rss`;
  },
};

// ---------------------------------------------------------------------------
// Admin Podcast Service
// ---------------------------------------------------------------------------
export const adminPodcastService = {
  list: async (query: PodcastFilterQuery = {}): Promise<PaginatedData<PodcastEpisode>> => {
    const { items, pagination } = await unwrapList<PodcastEpisode>(
      api.get('/admin/podcasts', { params: toParams(query) }),
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

  get: (id: number): Promise<PodcastEpisode> =>
    unwrap(api.get(`/admin/podcasts/${id}`)),

  stats: (): Promise<PodcastStats> =>
    unwrap(api.get('/admin/podcasts/stats')),

  create: (values: PodcastFormValues): Promise<PodcastEpisode> =>
    unwrap(api.post('/admin/podcasts', values)),

  update: (id: number, values: Partial<PodcastFormValues>): Promise<PodcastEpisode> =>
    unwrap(api.put(`/admin/podcasts/${id}`, values)),

  toggleStatus: (id: number, isPublished: boolean): Promise<PodcastEpisode> =>
    unwrap(api.patch(`/admin/podcasts/${id}/status`, { isPublished })),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/admin/podcasts/${id}`)),
};

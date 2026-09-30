import api, { unwrap, unwrapList } from './api';
import type {
  TourismCircuit,
  TourismStay,
  TourismTransport,
  TourismFestivalDay,
  TourismItinerary,
  TourismKnowledge,
  TourismOperator,
  TourismEnquiry,
  TourismEnquiryFormValues,
  TourismEnquiryStatus,
  TourismRecommendationRequest,
  TourismRecommendationResponse,
  ChatbotRequest,
  ChatbotResponse,
  CaptchaData,
  TourismListQuery,
  TourismAdminStats,
} from '@/types/tourism';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
}

// Public
export const publicTourismService = {
  circuits: {
    list: (): Promise<TourismCircuit[]> => unwrap(api.get('/tourism/circuits')),
    get: (slug: string): Promise<TourismCircuit> => unwrap(api.get(`/tourism/circuits/${slug}`)),
    featured: (): Promise<TourismCircuit[]> => unwrap(api.get('/tourism/circuits/featured')),
  },

  stays: {
    list: (): Promise<TourismStay[]> => unwrap(api.get('/tourism/stays')),
    get: (slug: string): Promise<TourismStay> => unwrap(api.get(`/tourism/stays/${slug}`)),
    featured: (): Promise<TourismStay[]> => unwrap(api.get('/tourism/stays/featured')),
  },

  transports: {
    list: (): Promise<TourismTransport[]> => unwrap(api.get('/tourism/transports')),
    get: (id: number): Promise<TourismTransport> => unwrap(api.get(`/tourism/transports/${id}`)),
  },

  festivalDays: {
    list: (): Promise<TourismFestivalDay[]> => unwrap(api.get('/tourism/festival-days')),
  },

  itineraries: {
    list: (): Promise<TourismItinerary[]> => unwrap(api.get('/tourism/itineraries')),
    get: (slug: string): Promise<TourismItinerary> => unwrap(api.get(`/tourism/itineraries/${slug}`)),
    curated: (): Promise<TourismItinerary[]> => unwrap(api.get('/tourism/itineraries/curated')),
  },

  knowledge: {
    list: (): Promise<TourismKnowledge[]> => unwrap(api.get('/tourism/knowledge')),
    get: (id: number): Promise<TourismKnowledge> => unwrap(api.get(`/tourism/knowledge/${id}`)),
  },

  operators: {
    list: (): Promise<TourismOperator[]> => unwrap(api.get('/tourism/operators')),
    get: (id: number): Promise<TourismOperator> => unwrap(api.get(`/tourism/operators/${id}`)),
    verified: (): Promise<TourismOperator[]> => unwrap(api.get('/tourism/operators/verified')),
  },

  recommendations: {
    get: (data: TourismRecommendationRequest): Promise<TourismRecommendationResponse> =>
      unwrap(api.post('/tourism/recommendations', data)),
  },

  chatbot: {
    ask: (data: ChatbotRequest): Promise<ChatbotResponse> =>
      unwrap(api.post('/tourism/chatbot', data)),
  },

  captcha: {
    get: (): Promise<CaptchaData> => unwrap(api.get('/tourism/captcha')),
  },

  enquiries: {
    create: (data: TourismEnquiryFormValues): Promise<TourismEnquiry> =>
      unwrap(api.post('/tourism/enquiries', data)),
  },
};

// Admin
export const adminTourismService = {
  circuits: {
    list: async (query: TourismListQuery = {}): Promise<PaginatedData<TourismCircuit>> => {
      const { items, pagination } = await unwrapList<TourismCircuit>(
        api.get('/admin/tourism/circuits', { params: toParams(query) }),
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
    get: (id: number): Promise<TourismCircuit> => unwrap(api.get(`/admin/tourism/circuits/${id}`)),
    create: (data: Partial<TourismCircuit>): Promise<TourismCircuit> =>
      unwrap(api.post('/admin/tourism/circuits', data)),
    update: (id: number, data: Partial<TourismCircuit>): Promise<TourismCircuit> =>
      unwrap(api.put(`/admin/tourism/circuits/${id}`, data)),
    remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
      unwrap(api.delete(`/admin/tourism/circuits/${id}`)),
    toggleStatus: (id: number, isActive: boolean): Promise<TourismCircuit> =>
      unwrap(api.post(`/admin/tourism/circuits/${id}/toggle-status`, { isActive })),
    toggleFeatured: (id: number, isFeatured: boolean): Promise<TourismCircuit> =>
      unwrap(api.post(`/admin/tourism/circuits/${id}/toggle-featured`, { isFeatured })),
  },

  stays: {
    list: async (query: TourismListQuery = {}): Promise<PaginatedData<TourismStay>> => {
      const { items, pagination } = await unwrapList<TourismStay>(
        api.get('/admin/tourism/stays', { params: toParams(query) }),
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
    get: (id: number): Promise<TourismStay> => unwrap(api.get(`/admin/tourism/stays/${id}`)),
    create: (data: Partial<TourismStay>): Promise<TourismStay> =>
      unwrap(api.post('/admin/tourism/stays', data)),
    update: (id: number, data: Partial<TourismStay>): Promise<TourismStay> =>
      unwrap(api.put(`/admin/tourism/stays/${id}`, data)),
    remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
      unwrap(api.delete(`/admin/tourism/stays/${id}`)),
    toggleStatus: (id: number, isActive: boolean): Promise<TourismStay> =>
      unwrap(api.post(`/admin/tourism/stays/${id}/toggle-status`, { isActive })),
    toggleFeatured: (id: number, isFeatured: boolean): Promise<TourismStay> =>
      unwrap(api.post(`/admin/tourism/stays/${id}/toggle-featured`, { isFeatured })),
    toggleWbtdc: (id: number, isWbtdc: boolean): Promise<TourismStay> =>
      unwrap(api.post(`/admin/tourism/stays/${id}/toggle-wbtdc`, { isWbtdc })),
  },

  transports: {
    list: async (query: TourismListQuery = {}): Promise<PaginatedData<TourismTransport>> => {
      const { items, pagination } = await unwrapList<TourismTransport>(
        api.get('/admin/tourism/transports', { params: toParams(query) }),
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
    get: (id: number): Promise<TourismTransport> => unwrap(api.get(`/admin/tourism/transports/${id}`)),
    create: (data: Partial<TourismTransport>): Promise<TourismTransport> =>
      unwrap(api.post('/admin/tourism/transports', data)),
    update: (id: number, data: Partial<TourismTransport>): Promise<TourismTransport> =>
      unwrap(api.put(`/admin/tourism/transports/${id}`, data)),
    remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
      unwrap(api.delete(`/admin/tourism/transports/${id}`)),
    toggleStatus: (id: number, isActive: boolean): Promise<TourismTransport> =>
      unwrap(api.post(`/admin/tourism/transports/${id}/toggle-status`, { isActive })),
  },

  festivalDays: {
    list: async (query: TourismListQuery = {}): Promise<PaginatedData<TourismFestivalDay>> => {
      const { items, pagination } = await unwrapList<TourismFestivalDay>(
        api.get('/admin/tourism/festival-days', { params: toParams(query) }),
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
    get: (id: number): Promise<TourismFestivalDay> => unwrap(api.get(`/admin/tourism/festival-days/${id}`)),
    create: (data: Partial<TourismFestivalDay>): Promise<TourismFestivalDay> =>
      unwrap(api.post('/admin/tourism/festival-days', data)),
    update: (id: number, data: Partial<TourismFestivalDay>): Promise<TourismFestivalDay> =>
      unwrap(api.put(`/admin/tourism/festival-days/${id}`, data)),
    remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
      unwrap(api.delete(`/admin/tourism/festival-days/${id}`)),
  },

  itineraries: {
    list: async (query: TourismListQuery = {}): Promise<PaginatedData<TourismItinerary>> => {
      const { items, pagination } = await unwrapList<TourismItinerary>(
        api.get('/admin/tourism/itineraries', { params: toParams(query) }),
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
    get: (id: number): Promise<TourismItinerary> => unwrap(api.get(`/admin/tourism/itineraries/${id}`)),
    create: (data: Partial<TourismItinerary>): Promise<TourismItinerary> =>
      unwrap(api.post('/admin/tourism/itineraries', data)),
    update: (id: number, data: Partial<TourismItinerary>): Promise<TourismItinerary> =>
      unwrap(api.put(`/admin/tourism/itineraries/${id}`, data)),
    remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
      unwrap(api.delete(`/admin/tourism/itineraries/${id}`)),
    toggleStatus: (id: number, isActive: boolean): Promise<TourismItinerary> =>
      unwrap(api.post(`/admin/tourism/itineraries/${id}/toggle-status`, { isActive })),
    toggleCurated: (id: number, isCurated: boolean): Promise<TourismItinerary> =>
      unwrap(api.post(`/admin/tourism/itineraries/${id}/toggle-curated`, { isCurated })),
  },

  knowledge: {
    list: async (query: TourismListQuery = {}): Promise<PaginatedData<TourismKnowledge>> => {
      const { items, pagination } = await unwrapList<TourismKnowledge>(
        api.get('/admin/tourism/knowledge', { params: toParams(query) }),
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
    get: (id: number): Promise<TourismKnowledge> => unwrap(api.get(`/admin/tourism/knowledge/${id}`)),
    create: (data: Partial<TourismKnowledge>): Promise<TourismKnowledge> =>
      unwrap(api.post('/admin/tourism/knowledge', data)),
    update: (id: number, data: Partial<TourismKnowledge>): Promise<TourismKnowledge> =>
      unwrap(api.put(`/admin/tourism/knowledge/${id}`, data)),
    remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
      unwrap(api.delete(`/admin/tourism/knowledge/${id}`)),
    toggleStatus: (id: number, isActive: boolean): Promise<TourismKnowledge> =>
      unwrap(api.post(`/admin/tourism/knowledge/${id}/toggle-status`, { isActive })),
  },

  operators: {
    list: async (query: TourismListQuery = {}): Promise<PaginatedData<TourismOperator>> => {
      const { items, pagination } = await unwrapList<TourismOperator>(
        api.get('/admin/tourism/operators', { params: toParams(query) }),
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
    get: (id: number): Promise<TourismOperator> => unwrap(api.get(`/admin/tourism/operators/${id}`)),
    create: (data: Partial<TourismOperator>): Promise<TourismOperator> =>
      unwrap(api.post('/admin/tourism/operators', data)),
    update: (id: number, data: Partial<TourismOperator>): Promise<TourismOperator> =>
      unwrap(api.put(`/admin/tourism/operators/${id}`, data)),
    remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
      unwrap(api.delete(`/admin/tourism/operators/${id}`)),
    toggleStatus: (id: number, isActive: boolean): Promise<TourismOperator> =>
      unwrap(api.post(`/admin/tourism/operators/${id}/toggle-status`, { isActive })),
    toggleVerified: (id: number, isVerified: boolean): Promise<TourismOperator> =>
      unwrap(api.post(`/admin/tourism/operators/${id}/toggle-verified`, { isVerified })),
  },

  enquiries: {
    list: async (query: TourismListQuery = {}): Promise<PaginatedData<TourismEnquiry>> => {
      const { items, pagination } = await unwrapList<TourismEnquiry>(
        api.get('/admin/tourism/enquiries', { params: toParams(query) }),
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
    get: (id: number): Promise<TourismEnquiry> => unwrap(api.get(`/admin/tourism/enquiries/${id}`)),
    updateStatus: (id: number, status: TourismEnquiryStatus, notes?: string) =>
      unwrap(api.post(`/admin/tourism/enquiries/${id}/status`, { status, notes })),
    assign: (id: number, assignedToId: number) =>
      unwrap(api.post(`/admin/tourism/enquiries/${id}/assign`, { assignedToId })),
    addNote: (id: number, comment: string) =>
      unwrap(api.post(`/admin/tourism/enquiries/${id}/notes`, { comment })),
  },

  stats: {
    get: (): Promise<TourismAdminStats> => unwrap(api.get('/admin/tourism/stats')),
  },
};
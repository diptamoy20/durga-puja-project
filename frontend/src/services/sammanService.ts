import api, { unwrap, unwrapList } from './api';
import type {
  CommitteeOption,
  Contest,
  CreateNominationPayload,
  NominationListQuery,
  SharadSammanDashboardData,
  SharadSammanNomination,
  TransitionStatusPayload,
  UpdateNominationPayload,
} from '@/types/samman';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== '' && value !== null,
    ),
  ) as Record<string, string | number>;
}

export const sammanService = {
  /**
   * Dashboard stats and active contest
   */
  getDashboard: (): Promise<SharadSammanDashboardData> =>
    unwrap(api.get('/sharad-samman/dashboard')),

  /**
   * List available contests
   */
  getContests: (): Promise<Contest[]> =>
    unwrap(api.get('/sharad-samman/contests')),

  /**
   * Search approved committees for nomination creation
   */
  searchCommittees: (search?: string): Promise<CommitteeOption[]> =>
    unwrap(api.get('/sharad-samman/committees', { params: search ? { search } : undefined })),

  /**
   * Paginated nominations list with filters
   */
  list: async (query: NominationListQuery = {}): Promise<PaginatedData<SharadSammanNomination>> => {
    const { items, pagination } = await unwrapList<SharadSammanNomination>(
      api.get('/sharad-samman/nominations', { params: toParams(query) }),
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

  /**
   * Single nomination details
   */
  get: (id: number): Promise<SharadSammanNomination> =>
    unwrap(api.get(`/sharad-samman/nominations/${id}`)),

  /**
   * Create nomination on behalf of a committee
   */
  create: (payload: CreateNominationPayload): Promise<SharadSammanNomination> =>
    unwrap(api.post('/sharad-samman/nominations', payload)),

  /**
   * Update nomination details
   */
  update: (id: number, payload: UpdateNominationPayload): Promise<SharadSammanNomination> =>
    unwrap(api.put(`/sharad-samman/nominations/${id}`, payload)),

  /**
   * Status change: Review, Approve, Reject, Shortlist
   */
  changeStatus: (id: number, payload: TransitionStatusPayload): Promise<SharadSammanNomination> =>
    unwrap(api.post(`/sharad-samman/nominations/${id}/status`, payload)),
};

export interface CommitteeCreateNominationPayload {
  category: string;
  title?: string;
  description?: string;
  contestId?: number;
  submitNow?: boolean;
}

export interface CommitteeUpdateNominationPayload {
  category?: string;
  title?: string;
  description?: string;
  submitNow?: boolean;
}

export interface CommitteeNominationListResponse {
  items: SharadSammanNomination[];
  activeContest?: Contest | null;
  pagination: PaginatedData<SharadSammanNomination>['pagination'];
}

export const committeeSammanService = {
  /**
   * List nominations belonging to the current committee
   */
  list: async (
    query: NominationListQuery = {},
  ): Promise<CommitteeNominationListResponse> => {
    return unwrap(api.get('/committee/nominations', { params: toParams(query) }));
  },

  /**
   * Get current active contest
   */
  getActiveContest: (): Promise<Contest> =>
    unwrap(api.get('/committee/nominations/active-contest')),

  /**
   * Get single nomination by ID (committee-scoped)
   */
  get: (id: number): Promise<SharadSammanNomination> =>
    unwrap(api.get(`/committee/nominations/${id}`)),

  /**
   * Create nomination for current committee
   */
  create: (payload: CommitteeCreateNominationPayload): Promise<SharadSammanNomination> =>
    unwrap(api.post('/committee/nominations', payload)),

  /**
   * Edit draft nomination
   */
  update: (
    id: number,
    payload: CommitteeUpdateNominationPayload,
  ): Promise<SharadSammanNomination> =>
    unwrap(api.put(`/committee/nominations/${id}`, payload)),

  /**
   * Submit draft nomination for administrative review
   */
  submit: (id: number): Promise<SharadSammanNomination> =>
    unwrap(api.post(`/committee/nominations/${id}/submit`)),

  /**
   * Delete draft nomination
   */
  deleteDraft: (id: number): Promise<{ success: boolean; message: string }> =>
    unwrap(api.delete(`/committee/nominations/${id}`)),
};


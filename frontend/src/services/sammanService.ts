import api, { unwrap, unwrapList } from './api';
import type {
  CommitteeOption,
  ConfigureVotingPayload,
  Contest,
  CreateContestPayload,
  CreateNominationPayload,
  ExtendVotingPayload,
  NominationListQuery,
  SharadSammanDashboardData,
  SharadSammanNomination,
  TransitionStatusPayload,
  UpdateContestPayload,
  UpdateNominationPayload,
  VotingContestDetail,
  VotingContestItem,
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
   * Dashboard stats and active/selected contest
   */
  getDashboard: (contestId?: number): Promise<SharadSammanDashboardData> =>
    unwrap(api.get('/sharad-samman/dashboard', { params: contestId ? { contestId } : undefined })),

  /**
   * List available contests
   */
  getContests: (): Promise<Contest[]> =>
    unwrap(api.get('/sharad-samman/contests')),

  /**
   * Get single contest details
   */
  getContest: (id: number): Promise<Contest> =>
    unwrap(api.get(`/sharad-samman/contests/${id}`)),

  /**
   * Create a new contest
   */
  createContest: (payload: CreateContestPayload): Promise<Contest> =>
    unwrap(api.post('/sharad-samman/contests', payload)),

  /**
   * Update an existing contest in-place
   */
  updateContest: (id: number, payload: UpdateContestPayload): Promise<Contest> =>
    unwrap(api.put(`/sharad-samman/contests/${id}`, payload)),

  /**
   * List voting contests sessions
   */
  listVotingContests: (): Promise<VotingContestItem[]> =>
    unwrap(api.get('/sharad-samman/voting/contests')),

  /**
   * Get voting contest detail
   */
  getVotingContest: (contestId: number): Promise<VotingContestDetail> =>
    unwrap(api.get(`/sharad-samman/voting/${contestId}`)),

  /**
   * Configure or start voting for contest
   */
  configureVoting: (contestId: number, payload: ConfigureVotingPayload): Promise<VotingContestDetail> =>
    unwrap(api.post(`/sharad-samman/voting/${contestId}/configure`, payload)),

  /**
   * Extend voting for contest
   */
  extendVoting: (contestId: number, payload: ExtendVotingPayload): Promise<VotingContestDetail> =>
    unwrap(api.post(`/sharad-samman/voting/${contestId}/extend`, payload)),

  /**
   * Close voting for contest
   */
  closeVoting: (contestId: number): Promise<VotingContestDetail> =>
    unwrap(api.post(`/sharad-samman/voting/${contestId}/close`)),

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
  photos?: string[];
  pandalImage?: string;
  contestId?: number;
  submitNow?: boolean;
}

export interface CommitteeUpdateNominationPayload {
  category?: string;
  title?: string;
  description?: string;
  photos?: string[];
  pandalImage?: string;
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
    const [listResult, activeContest] = await Promise.all([
      unwrapList<SharadSammanNomination>(
        api.get('/committee/nominations', { params: toParams(query) }),
      ),
      unwrap<Contest>(api.get('/committee/nominations/active-contest')).catch(() => null),
    ]);

    return {
      items: listResult.items,
      activeContest: activeContest ?? null,
      pagination: listResult.pagination ?? {
        page: 1,
        perPage: listResult.items.length,
        total: listResult.items.length,
        lastPage: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  },

  /**
   * Get current active contest
   */
  getActiveContest: (): Promise<Contest> =>
    unwrap(api.get('/committee/nominations/active-contest')),

  /**
   * Get available contests for committee dropdown
   */
  getContests: (): Promise<Contest[]> =>
    unwrap(api.get('/committee/nominations/contests')),

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


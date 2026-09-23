import api, { unwrap } from './api';
import type {
  PublicVotingResponse,
  CaptchaResponse,
  RequestOtpPayload,
  RequestOtpResponse,
  CastVotePayload,
  CastVoteResponse,
  LeaderboardResponse,
  ContestResultsResponse,
  FlaggedVotesResponse,
} from '@/types/voting';

export const votingService = {
  // Public Endpoints
  public: {
    getContest: (): Promise<PublicVotingResponse> =>
      unwrap(api.get('/sharad-samman/voting/contest')),

    getCaptcha: (): Promise<CaptchaResponse> =>
      unwrap(api.get('/sharad-samman/voting/captcha')),

    requestOtp: (payload: RequestOtpPayload): Promise<RequestOtpResponse> =>
      unwrap(api.post('/sharad-samman/voting/request-otp', payload)),

    castVote: (payload: CastVotePayload): Promise<CastVoteResponse> =>
      unwrap(api.post('/sharad-samman/voting/cast-vote', payload)),

    getLeaderboard: (): Promise<LeaderboardResponse> =>
      unwrap(api.get('/sharad-samman/voting/leaderboard')),

    getResults: (): Promise<ContestResultsResponse> =>
      unwrap(api.get('/sharad-samman/voting/results')),
  },

  // Admin Endpoints
  admin: {
    getFlaggedVotes: (params?: { page?: number; limit?: number; status?: string }): Promise<FlaggedVotesResponse> =>
      unwrap(api.get('/sharad-samman/admin/voting/flagged', { params })),

    reviewFlaggedVote: (voteId: number, payload: { action: 'APPROVE' | 'REJECT'; reviewNotes?: string }) =>
      unwrap(api.patch(`/sharad-samman/admin/voting/${voteId}/review`, payload)),

    toggleVotingWindow: (payload: { contestId: number; isVotingOpen: boolean; votingStartDate?: string; votingEndDate?: string }) =>
      unwrap(api.post('/sharad-samman/admin/voting/toggle-window', payload)),

    publishResults: (payload: { contestId: number; publish: boolean }) =>
      unwrap(api.post('/sharad-samman/admin/voting/publish-results', payload)),
  },
};

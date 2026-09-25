export type VoteStatus = 'VALID' | 'FLAGGED' | 'REJECTED';

export interface CommitteeSnapshot {
  id: number;
  committeeName: string;
  registrationNo: string;
  committeeId?: string;
  city: string;
  state: string;
  country?: string;
  venueName?: string;
  venueAddress?: string;
  landmark?: string;
  address?: string;
  establishedYear?: number;
  pujaType?: string;
  pujaCategory?: string;
  committeeDescription?: string;
  pandalImage?: string;
  committeeMedia?: Array<{
    id: number;
    title?: string;
    description?: string;
    storedPath: string;
    thumbnailPath?: string;
  }>;
}

export interface VotingNomination {
  id: number;
  contestId: number;
  category: string;
  title: string;
  description?: string;
  status: string;
  committee: CommitteeSnapshot;
  snapshotData?: Record<string, any>;
  photos?: string[];
}

export interface AvailableContestSummary {
  id: number;
  name: string;
  year: number;
  status: string;
  votingStatus?: string;
  isVotingOpen: boolean;
}

export interface PublicVotingContest {
  id: number;
  name: string;
  year: number;
  description?: string;
  isVotingOpen: boolean;
  votingStatus?: string;
  startDate?: string;
  endDate?: string;
  votingStartDate?: string;
  votingEndDate?: string;
  votingExtendedUntil?: string;
  resultsPublished: boolean;
}

export interface PublicVotingResponse {
  hasActiveContest: boolean;
  contest: PublicVotingContest | null;
  isVotingOpen: boolean;
  availableContests?: AvailableContestSummary[];
  nominations: VotingNomination[];
}

export interface CaptchaResponse {
  question: string;
  token: string;
}

export interface RequestOtpPayload {
  contestId: number;
  email: string;
  phone?: string;
  captchaToken: string;
  captchaAnswer: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  email: string;
  devOtp?: string;
  expiresInSeconds: number;
}

export interface CastVotePayload {
  contestId: number;
  nominationId: number;
  voterEmail: string;
  voterName?: string;
  voterPhone?: string;
  voterAddress?: string;
  voterCity?: string;
  voterCountry?: string;
  otpCode: string;
  deviceFingerprint?: string;
}

export interface CastVoteResponse {
  success: boolean;
  message: string;
  voteId: number;
  status: VoteStatus;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  nominationId: number;
  category: string;
  title: string;
  committeeName: string;
  city: string;
  state: string;
  pandalImage?: string;
  validVotes: number;
}

export interface LeaderboardResponse {
  contestId: number;
  contestName: string;
  contestYear: number;
  isVotingOpen: boolean;
  resultsPublished: boolean;
  totalValidVotes: number;
  availableContests?: AvailableContestSummary[];
  leaderboard: LeaderboardEntry[];
}

export interface ContestResultsResponse {
  contestId: number;
  contestName: string;
  contestYear: number;
  resultsPublished: boolean;
  publishedAt?: string;
  totalVotesCounted: number;
  resultsByCategory: Record<string, LeaderboardEntry[]>;
}

export interface FlaggedVoteItem {
  id: number;
  contestId: number;
  nominationId: number;
  voterEmail: string;
  voterName?: string;
  voterCity?: string;
  voterCountry?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  riskScore: number;
  flagReason?: string;
  status: VoteStatus;
  reviewedBy?: number;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  nomination: {
    id: number;
    category: string;
    title: string;
    committee: {
      id: number;
      committeeName: string;
      city: string;
    };
  };
}

export interface FlaggedVotesResponse {
  total: number;
  page: number;
  limit: number;
  stats: {
    totalVotes: number;
    validVotes: number;
    flaggedVotes: number;
    rejectedVotes: number;
  };
  votes: FlaggedVoteItem[];
}

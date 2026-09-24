export type ContestStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export type VotingStatus = 'NOT_CONFIGURED' | 'SCHEDULED' | 'ACTIVE' | 'EXTENDED' | 'CLOSED';

export type NominationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SHORTLISTED';

export interface Contest {
  id: number;
  name: string;
  year: number;
  description?: string | null;
  status: ContestStatus;
  startDate?: string | null;
  endDate?: string | null;
  votingStatus?: VotingStatus;
  votingStartDate?: string | null;
  votingEndDate?: string | null;
  votingExtendedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    nominations: number;
  };
}

export interface CreateContestPayload {
  name: string;
  year: number;
  description?: string;
  startDate: string;
  endDate: string;
  status?: ContestStatus;
}

export interface UpdateContestPayload {
  name?: string;
  year?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ContestStatus;
}

export interface CandidateSnapshot {
  committeeId: number;
  committeeName: string;
  registrationNo: string;
  establishedYear?: number;
  pujaType?: string;
  pujaCategory?: string;
  city: string;
  state: string;
  country: string;
  venueName: string;
  venueAddress: string;
  pandalImage?: string;
  category?: string;
  title?: string;
  description?: string;
  shortlistedAt?: string;
  shortlistedBy?: { id: number; name: string; email: string } | null;
}

export interface NominationActor {
  id: number;
  name: string;
  email: string;
}

export interface NominationCommitteeSummary {
  id: number;
  committeeName: string;
  registrationNo: string;
  city: string;
  state: string;
  venueName?: string;
  venueAddress?: string;
  status?: string;
  pandalImage?: string;
  establishedYear?: number;
  pujaType?: string;
  pujaCategory?: string;
  committeeDescription?: string;
  contactPersonName?: string;
  email?: string;
  mobile?: string;
}

export interface SharadSammanNomination {
  id: number;
  contestId: number;
  pujaCommitteeId: number;
  category: string;
  title?: string | null;
  description?: string | null;
  status: NominationStatus;
  rejectionReason?: string | null;
  reviewNotes?: string | null;
  snapshotData?: CandidateSnapshot | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedById?: number | null;
  approvedAt?: string | null;
  approvedById?: number | null;
  rejectedAt?: string | null;
  rejectedById?: number | null;
  shortlistedAt?: string | null;
  shortlistedById?: number | null;
  createdById?: number | null;
  createdAt: string;
  updatedAt: string;
  committee?: NominationCommitteeSummary;
  contest?: Contest;
  reviewedBy?: NominationActor | null;
  approvedBy?: NominationActor | null;
  shortlistedBy?: NominationActor | null;
  rejectedBy?: NominationActor | null;
  createdBy?: NominationActor | null;
}

export interface NominationStats {
  total: number;
  draft: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  shortlisted: number;
}

export interface SharadSammanDashboardData {
  stats: NominationStats;
  activeContest?: Contest | null;
}

export interface NominationListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  status?: NominationStatus | '';
  contestId?: number;
  pujaCommitteeId?: number;
  sortDir?: 'asc' | 'desc';
}

export interface CreateNominationPayload {
  contestId: number;
  pujaCommitteeId: number;
  category: string;
  title?: string;
  description?: string;
}

export interface UpdateNominationPayload {
  category?: string;
  title?: string;
  description?: string;
}

export interface TransitionStatusPayload {
  status: NominationStatus;
  reason?: string;
  reviewNotes?: string;
}

export interface CommitteeOption {
  id: number;
  committeeName: string;
  registrationNo: string;
  city: string;
  state: string;
  pujaCategory?: string;
}

export interface VotingContestItem {
  id: number;
  name: string;
  year: number;
  description?: string | null;
  contestStatus: ContestStatus;
  votingStatus: VotingStatus;
  storedVotingStatus: VotingStatus;
  votingStartDate?: string | null;
  votingEndDate?: string | null;
  votingExtendedUntil?: string | null;
  effectiveClosingDate?: string | null;
  shortlistedCount: number;
}

export interface ShortlistedCandidatePreview {
  id: number;
  category: string;
  title?: string | null;
  committee: {
    id: number;
    committeeName: string;
    city: string;
    state: string;
    venueName?: string | null;
    pandalImage?: string | null;
  };
  shortlistedAt?: string | null;
}

export interface VotingContestDetail extends VotingContestItem {
  categoryStats: {
    category: string;
    count: number;
  }[];
  shortlistedNominations: ShortlistedCandidatePreview[];
  votingStatistics: {
    totalVotes: number;
    uniqueVoters: number;
  };
}

export interface ConfigureVotingPayload {
  votingStartDate: string;
  votingEndDate: string;
}

export interface ExtendVotingPayload {
  votingExtendedUntil: string;
}

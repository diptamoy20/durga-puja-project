export interface ArticleCounts {
  total: number;
  draft: number;
  /** Pending review and in review combined. */
  inReview: number;
  approved: number;
  rejected: number;
  scheduled: number;
  published: number;
  /** The state the previous portal called "unpublished". */
  archived: number;
}

export interface DashboardSummary {
  diasporaMembers: number;
  pujaCommittees: number;
  pandals: number;
  /** Committees sitting in pending or under review. */
  pendingApprovals: number;
  articles: ArticleCounts;
  /** Sections whose service could not be reached; their counts read zero. */
  unavailable: string[];
}

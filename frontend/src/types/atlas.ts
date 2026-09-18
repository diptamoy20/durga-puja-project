export type AtlasStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface PandalCommitteeRef {
  id: number;
  committeeName: string;
  committeeId?: string | null;
  city?: string | null;
}

export interface PandalUserRef {
  id: number;
  name: string;
  email?: string | null;
}

export interface PandalAtlas {
  id: number;
  pujaCommitteeId: number;
  userId: number | null;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  photos: string[] | null;
  photoUrls?: string[];
  primaryPhotoUrl?: string;
  timing: string;
  ritualSchedule: string | null;
  livestreamUrl: string | null;
  virtualTourUrl: string | null;
  livestreamEmbedUrl?: string | null;
  virtualTourEmbedUrl?: string | null;
  fullVirtualTourUrl?: string | null;
  hasLivestream?: boolean;
  hasVirtualTour?: boolean;
  is360Image?: boolean;
  detailsUrl?: string;
  status: AtlasStatus;
  rejectionRemarks: string | null;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  committee?: PandalCommitteeRef;
  user?: PandalUserRef | null;
  reviewedBy?: PandalUserRef | null;
  approvedBy?: PandalUserRef | null;
}

export interface PandalListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'status';
  sortDir?: 'asc' | 'desc';
  status?: AtlasStatus;
  pujaCommitteeId?: number;
}

export interface PandalFormValues {
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  pujaCommitteeId: number;
  timing: string;
  ritualSchedule?: string;
  livestreamUrl?: string;
  virtualTourUrl?: string;
  action?: 'draft' | 'submit' | 'save';
}

export interface AtlasStats {
  total: number;
  DRAFT: number;
  SUBMITTED: number;
  UNDER_REVIEW: number;
  APPROVED: number;
  REJECTED: number;
}

export interface AtlasMapDataResponse {
  count: number;
  data: PandalAtlas[];
}

export interface AtlasFormCommitteeOption {
  id: number;
  committeeName: string;
  registrationNo: string;
  committeeId: string | null;
}

export interface AtlasFormOptions {
  isModerator: boolean;
  defaultCommitteeId: number | null;
  committees: AtlasFormCommitteeOption[];
}

export type AtlasFilterChip = 'all' | 'live' | 'tour';

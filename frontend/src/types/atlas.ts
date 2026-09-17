export type AtlasStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface PandalAtlas {
  id: number;
  pujaCommitteeId: number;
  userId: number | null;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  photos: unknown;
  timing: string;
  specialFeatures: string;
  history: string | null;
  artisan: string | null;
  theme: string | null;
  pujaType: string | null;
  footfall: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  website: string | null;
  status: AtlasStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  committee?: { id: number; committeeName: string };
  reviewedBy?: { id: number; name: string } | null;
  approvedBy?: { id: number; name: string } | null;
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
  specialFeatures: string;
  history?: string;
  artisan?: string;
  theme?: string;
  pujaType?: string;
  footfall?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
}

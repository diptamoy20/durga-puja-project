// ---------------------------------------------------------------------------
// Committee Media
// ---------------------------------------------------------------------------

export type MediaType = 'PHOTO' | 'VIDEO';
export type MediaModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CommitteeMedia {
  id: number;
  pujaCommitteeId: number;
  categoryId: number | null;
  subcategoryId: number | null;
  uploadedById: number;
  mediaType: MediaType;
  title: string | null;
  description: string | null;
  venueName: string | null;
  originalFilename: string;
  storedPath: string;
  thumbnailPath: string | null;
  mimeType: string;
  fileSize: number;
  status: MediaModerationStatus;
  rejectionReason: string | null;
  moderatedById: number | null;
  moderatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  committee?: { id: number; committeeName: string };
  category?: { id: number; name: string } | null;
  subcategory?: { id: number; name: string } | null;
  uploadedBy?: { id: number; name: string };
  moderatedBy?: { id: number; name: string } | null;
}

export interface MediaListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'mediaType' | 'status';
  sortDir?: 'asc' | 'desc';
  status?: MediaModerationStatus;
  mediaType?: MediaType;
  pujaCommitteeId?: number;
  categoryId?: number;
  subcategoryId?: number;
}

// ---------------------------------------------------------------------------
// Albums
// ---------------------------------------------------------------------------

export interface Album {
  id: number;
  categoryId: number;
  subcategoryId: number | null;
  pujaCommitteeId: number;
  title: string;
  description: string | null;
  isPublic: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string };
  subcategory?: { id: number; name: string } | null;
  committee?: { id: number; committeeName: string };
  media?: CommitteeMedia[];
  _count?: { media: number };
}

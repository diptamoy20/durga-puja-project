// ---------------------------------------------------------------------------
// Diaspora Registration
// ---------------------------------------------------------------------------

export interface DiasporaRegistration {
  id: number;
  userId: number | null;
  registrationNo: string;
  fullName: string;
  dob: string;
  gender: string;
  email: string;
  mobile: string;
  country: string;
  city: string;
  passportNo: string | null;
  nationality: string;
  address1: string;
  address2: string | null;
  state: string | null;
  postalCode: string | null;
  districtOrigin: string;
  village: string | null;
  relationshipWithBengal: string;
  languages: string | null;
  interests: string[] | null;
  volunteer: boolean;
  receiveUpdates: boolean;
  termsAccepted: boolean;
  status: DiasporaStatus;
  verifiedById: number | null;
  verifiedAt: string | null;
  rejectedById: number | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  verifiedBy?: { id: number; name: string } | null;
  rejectedBy?: { id: number; name: string } | null;
  user?: { id: number; email: string; status: string } | null;
  histories?: DiasporaVerificationHistory[];
}

export type DiasporaStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface DiasporaVerificationHistory {
  id: number;
  diasporaRegistrationId: number;
  previousStatus: string | null;
  newStatus: string;
  action: string;
  reason: string | null;
  changedById: number | null;
  createdAt: string;
  changedBy?: { id: number; name: string } | null;
}

export interface DiasporaListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  sortDir?: 'asc' | 'desc';
  status?: DiasporaStatus;
  country?: string;
}

export interface DiasporaStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

// ---------------------------------------------------------------------------
// Puja Committee
// ---------------------------------------------------------------------------

export interface PujaCommittee {
  id: number;
  userId: number | null;
  registrationNo: string;
  committeeId: string | null;
  committeeName: string;
  establishedYear: number;
  pujaType: string;
  pujaCategory: string;
  committeeDescription: string;
  contactPersonName: string;
  designation: string;
  email: string;
  mobile: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  venueName: string;
  venueAddress: string;
  landmark: string | null;
  address: string;
  registrationCertificate: string;
  addressProof: string;
  pandalImage: string;
  declaration: boolean;
  status: CommitteeStatus;
  approvedById: number | null;
  approvedAt: string | null;
  rejectedById: number | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  reviewedById: number | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  approvedBy?: { id: number; name: string } | null;
  rejectedBy?: { id: number; name: string } | null;
  reviewedBy?: { id: number; name: string } | null;
  user?: { id: number; email: string; status: string } | null;
  histories?: CommitteeStatusHistory[];
}

export type CommitteeStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface CommitteeStatusHistory {
  id: number;
  pujaCommitteeId: number;
  previousStatus: string | null;
  newStatus: string;
  reason: string | null;
  changedById: number | null;
  createdAt: string;
  changedBy?: { id: number; name: string } | null;
}

export interface CommitteeListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: 'createdAt' | 'committeeName' | 'status';
  sortDir?: 'asc' | 'desc';
  status?: CommitteeStatus;
  city?: string;
}

export interface CommitteeStats {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
}

export interface CommitteeUpdatePayload {
  committeeName?: string;
  establishedYear?: number;
  pujaType?: string;
  pujaCategory?: string;
  committeeDescription?: string;
  contactPersonName?: string;
  designation?: string;
  email?: string;
  mobile?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  venueName?: string;
  venueAddress?: string;
  landmark?: string;
  address?: string;
}

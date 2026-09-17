import { CommitteeStatus } from '@dpgc/database';

/** Wire contracts for the committee TCP patterns (validated at the gateway). */

export interface ListCommitteesPayload {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: 'createdAt' | 'committeeName' | 'status';
  sortDir: 'asc' | 'desc';
  status?: CommitteeStatus;
  city?: string;
}

export interface SubmitCommitteePayload {
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
  landmark?: string;
  address: string;
  registrationCertificate: string;
  addressProof: string;
  pandalImage: string;
  declaration: boolean;
}

export interface ChangeCommitteeStatusPayload {
  id: number;
  status: CommitteeStatus;
  reason?: string;
  actorId: number;
}

export interface CreatePortalAccountPayload {
  id: number;
  actorId: number;
}

export type InvestmentOpportunityStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type InvestmentWorkflowAction =
  | 'submit_for_approval'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'return_to_draft'
  | 'archive';

export type InvestmentEnquiryStatus =
  | 'NEW'
  | 'IN_REVIEW'
  | 'FORWARDED_TO_CHAMBER'
  | 'CONTACTED'
  | 'CLOSED'
  | string;

export interface IndustryAssociation {
  id: number | string;
  name: string;
  code: string;
  category?: string;
  description?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  logoUrl?: string | null;
  sectorsCovered?: string[] | null;
  isActive: boolean;
  sortOrder?: number;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    opportunities?: number;
    enquiries?: number;
  };
}

export type CreateIndustryAssociationDto = Partial<IndustryAssociation>;
export type UpdateIndustryAssociationDto = Partial<IndustryAssociation>;

export interface InvestmentDocument {
  title: string;
  url: string;
  fileType?: string;
  fileSize?: string;
}

export interface InvestmentOpportunityHistory {
  id: number | string;
  opportunityId: number | string;
  userId?: number | string | null;
  action: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  comment?: string | null;
  createdAt: string;
  user?: {
    id: number | string;
    name: string;
    email?: string;
  } | null;
  actor?: {
    id: number | string;
    name: string;
    email?: string;
  } | null;
}

export interface InvestmentOpportunity {
  id: number | string;
  title: string;
  slug: string;
  sector: string;
  category?: string | null;
  location: string;
  district?: string | null;
  scaleOrRange?: string | null;
  summary?: string | null;
  description: string;
  investmentRange?: string;
  investmentMin?: number | string | null;
  investmentMax?: number | string | null;
  projectType?: string | null;
  expectedRoi?: string | null;
  highlights?: string[] | null;
  incentives?: string | null;
  coverImageUrl?: string | null;
  galleryImages?: string[] | null;
  documents?: InvestmentDocument[] | null;
  associationId?: number | string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: InvestmentOpportunityStatus;
  isFeatured?: boolean;
  sortOrder?: number;
  submittedAt?: string | null;
  submittedById?: number | string | null;
  approvedAt?: string | null;
  approvedById?: number | string | null;
  rejectedAt?: string | null;
  rejectedById?: number | string | null;
  rejectionReason?: string | null;
  publishedAt?: string | null;
  publishedById?: number | string | null;
  createdById?: number | string | null;
  updatedById?: number | string | null;
  createdAt: string;
  updatedAt: string;
  association?: IndustryAssociation | null;
  assignedAssociation?: IndustryAssociation | null;
  createdBy?: { id: number | string; name: string; email?: string } | null;
  updatedBy?: { id: number | string; name: string } | null;
  submittedBy?: { id: number | string; name: string } | null;
  approvedBy?: { id: number | string; name: string } | null;
  rejectedBy?: { id: number | string; name: string } | null;
  publishedBy?: { id: number | string; name: string } | null;
  histories?: InvestmentOpportunityHistory[];
  history?: InvestmentOpportunityHistory[];
  _count?: {
    enquiries?: number;
  };
}

export interface InvestmentOpportunityFormValues {
  title: string;
  slug?: string;
  sector: string;
  category?: string;
  location: string;
  district?: string;
  summary?: string;
  description: string;
  investmentRange: string;
  investmentMin?: number | string;
  investmentMax?: number | string;
  projectType?: string;
  expectedRoi?: string;
  highlights?: string[];
  incentives?: string;
  coverImageUrl?: string;
  galleryImages?: string[];
  documents?: InvestmentDocument[];
  associationId?: number | string;
  contactEmail?: string;
  contactPhone?: string;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface IndustryAssociationFormValues {
  name: string;
  code: string;
  category?: string;
  description?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  logoUrl?: string;
  sectorsCovered?: string[];
  isActive?: boolean;
  sortOrder?: number;
  displayOrder?: number;
}

export interface InvestmentEnquiryHistory {
  id: number | string;
  enquiryId: number | string;
  changedById?: number | string | null;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  comment?: string | null;
  createdAt: string;
  changedBy?: { id: number | string; name: string } | null;
  actor?: { id: number | string; name: string; email?: string } | null;
}

export interface InvestmentEnquiry {
  id: number | string;
  enquiryCode: string;
  opportunityId?: number | string | null;
  associationId?: number | string | null;
  assignedAssociationId?: number | string | null;
  fullName?: string;
  investorName?: string;
  organization?: string | null;
  organizationName?: string | null;
  designation?: string | null;
  investorType?: string | null;
  email: string;
  phone?: string;
  country?: string;
  city?: string | null;
  investmentBudget?: string | null;
  indicativeBudget?: string | null;
  targetSector?: string | null;
  proposedTimeline?: string | null;
  message?: string;
  status: InvestmentEnquiryStatus;
  assignedToId?: number | string | null;
  adminRemarks?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity?: {
    id: number | string;
    title: string;
    slug: string;
    sector?: string;
    scaleOrRange?: string;
  } | null;
  association?: IndustryAssociation | null;
  assignedAssociation?: IndustryAssociation | null;
  assignedTo?: {
    id: number | string;
    name: string;
    email?: string;
  } | null;
  histories?: InvestmentEnquiryHistory[];
  history?: InvestmentEnquiryHistory[];
}

export interface InvestmentEnquiryFormValues {
  opportunityId?: number;
  associationId?: number;
  fullName: string;
  organization?: string;
  designation?: string;
  investorType?: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  investmentBudget?: string;
  proposedTimeline?: string;
  message: string;
}

export interface InvestmentListQuery {
  page?: number;
  perPage?: number;
  status?: InvestmentOpportunityStatus | string;
  sector?: string;
  category?: string;
  location?: string;
  district?: string;
  associationId?: number | string;
  isFeatured?: boolean | string;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface InvestmentAdminStats {
  DRAFT: number;
  PENDING_APPROVAL: number;
  APPROVED: number;
  REJECTED: number;
  PUBLISHED: number;
  ARCHIVED: number;
  TOTAL: number;
  ENQUIRIES: number;
}

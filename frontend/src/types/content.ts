// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export type ArticleStatus =
  | 'DRAFT' | 'PENDING_REVIEW' | 'IN_REVIEW' | 'APPROVED'
  | 'REJECTED' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export interface Article {
  id: number;
  subcategoryId: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  authorId: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  status: ArticleStatus;
  isFeatured: boolean;
  allowComments: boolean;
  scheduledAt: string | null;
  publishedAt: string | null;
  rejectionReason: string | null;
  reviewComment: string | null;
  createdAt: string;
  updatedAt: string;
  subcategory?: { id: number; name: string; category?: { id: number; name: string } };
  author?: { id: number; name: string } | null;
  histories?: ArticleHistory[];
}

export interface ArticleHistory {
  id: number;
  articleId: number;
  userId: number | null;
  action: string;
  previousStatus: string | null;
  newStatus: string | null;
  comment: string | null;
  createdAt: string;
  user?: { id: number; name: string } | null;
}

export interface ArticleFormValues {
  title: string;
  slug?: string;
  subcategoryId: number;
  authorId?: number;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  featuredImageFile?: File;
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  isFeatured?: boolean;
  allowComments?: boolean;
}

export type ArticleWorkflowAction =
  | 'submit_for_review' | 'start_review' | 'approve'
  | 'reject' | 'schedule' | 'publish' | 'archive' | 'return_to_draft';

export interface ArticleListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'status' | 'publishedAt';
  sortDir?: 'asc' | 'desc';
  status?: ArticleStatus;
  subcategoryId?: number;
  categoryId?: number;
  authorId?: number;
  createdDate?: string;
  publishedDate?: string;
}

export type ContentMediaType = 'image' | 'video' | 'document';

export interface ContentMedia {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileType: ContentMediaType;
  mimeType: string;
  fileSize: number;
  title: string | null;
  altText: string | null;
  url?: string;
  createdAt: string;
  uploadedBy?: { id: number; name: string } | null;
}

export interface ContentMediaListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  type?: ContentMediaType | '';
}

// ---------------------------------------------------------------------------
// Categories / Subcategories
// ---------------------------------------------------------------------------

export type RecordStatusType = 'ACTIVE' | 'INACTIVE';

export interface CategoryListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  sortDir?: 'asc' | 'desc';
  status?: RecordStatusType;
}

export interface SubcategoryListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  sortDir?: 'asc' | 'desc';
  status?: RecordStatusType;
  categoryId?: number;
}

export interface CategoryFormValues {
  name: string;
  slug?: string;
  description?: string;
  status: RecordStatusType;
}

export interface SubcategoryFormValues {
  categoryId: number;
  name: string;
  slug?: string;
  description?: string;
  status: RecordStatusType;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: RecordStatusType;
  createdAt: string;
  updatedAt: string;
  _count?: { subcategories: number; committeeMedia: number; albums: number };
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  status: RecordStatusType;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

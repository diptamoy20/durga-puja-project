/**
 * One response envelope for the whole platform, so the React layer can handle
 * every endpoint identically.
 *
 * Success: { success: true,  message, data }
 * Failure: { success: false, message, data: null, error? }
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  /** Machine-readable code and validation details, present only on failures. */
  error?: ApiErrorDetail;
  /** Pagination and other envelope extras, present only on list endpoints. */
  meta?: Record<string, unknown>;
  timestamp: string;
  path?: string;
}

export interface ApiErrorDetail {
  code: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** What a service returns from a list pattern before the gateway wraps it. */
export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

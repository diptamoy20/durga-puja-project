/**
 * The response envelope every gateway endpoint returns. Mirrors
 * `backend/shared/src/interfaces/api-response.interface.ts`.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error?: ApiErrorDetail;
  meta?: { pagination?: PaginationMeta } & Record<string, unknown>;
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

/** A list response after the axios layer has unwrapped the envelope. */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * A failed request, normalised by the axios error interceptor.
 *
 * Every rejection from the service layer is one of these, so callers never
 * have to inspect raw AxiosError shapes.
 */
export interface ApiError {
  /** Safe to display: the gateway never puts internals in `message`. */
  message: string;
  /** Machine-readable, e.g. VALIDATION_FAILED, TOKEN_EXPIRED, FORBIDDEN. */
  code: string;
  status: number;
  /** Field-level messages when `code` is VALIDATION_FAILED. */
  details?: unknown;
}

export interface ListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/** Tracks an async operation's lifecycle for loading and error states. */
export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

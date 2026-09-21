import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { STORAGE_KEYS } from '@/constants/routes';
import type { ApiError, ApiResponse, AuthTokens } from '@/types';
import { tokenStorage } from '@/utils/tokenStorage';

/**
 * The single axios instance for the app.
 *
 * `VITE_API_URL` points at the API Gateway and is the only backend address the
 * browser knows; individual microservice ports are never exposed here.
 */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5050/api/v1',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

/** Requests that must not carry (or trigger a refresh of) an access token. */
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];

const isPublicPath = (url?: string): boolean =>
  Boolean(url && PUBLIC_PATHS.some((path) => url.startsWith(path)));

// ---------------------------------------------------------------------------
// Request: attach the bearer token
// ---------------------------------------------------------------------------

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();

  if (token && !isPublicPath(config.url)) {
    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

// ---------------------------------------------------------------------------
// Response: unwrap the envelope, refresh on 401
// ---------------------------------------------------------------------------

/**
 * While a refresh is in flight, concurrent 401s wait on this promise instead
 * of each firing their own refresh. Without it, a dashboard that loads several
 * widgets at once would trigger a burst of refreshes, and token rotation would
 * invalidate all but the first.
 */
let refreshInFlight: Promise<string> | null = null;

/** Called when refreshing fails, so the app can clear state and redirect. */
type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler = () => {};

export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler;
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) throw new Error('No refresh token available.');

  // A bare axios call, so this request skips the interceptors below and
  // cannot recurse if the refresh itself returns 401.
  const response = await axios.post<ApiResponse<AuthTokens>>(
    `${api.defaults.baseURL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' }, timeout: 15_000 },
  );

  const tokens = response.data.data;

  if (!tokens?.accessToken) throw new Error('The refresh response contained no token.');

  tokenStorage.setTokens(tokens);

  return tokens.accessToken;
}

function normaliseError(error: AxiosError<ApiResponse<null>>): ApiError {
  // The server replied, so use its envelope: `message` is always safe to show.
  if (error.response) {
    const body = error.response.data;

    return {
      message: body?.message ?? 'The request could not be completed.',
      code: body?.error?.code ?? 'REQUEST_FAILED',
      status: error.response.status,
      details: body?.error?.details,
    };
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return { message: 'The request timed out. Please try again.', code: 'TIMEOUT', status: 0 };
  }

  return {
    message: 'Cannot reach the server. Check your connection and that the API Gateway is running.',
    code: 'NETWORK_ERROR',
    status: 0,
  };
}

api.interceptors.response.use(
  // Unwrap the envelope so callers receive the payload, not the wrapper.
  (response: AxiosResponse<ApiResponse<unknown>>) => response,

  async (error: AxiosError<ApiResponse<null>>) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;

    const canRefresh =
      status === 401 &&
      config !== undefined &&
      !config._retried &&
      !isPublicPath(config.url) &&
      // Only an expired token is worth retrying. A missing or malformed token,
      // or wrong credentials, will fail again identically.
      (code === 'TOKEN_EXPIRED' || code === 'TOKEN_INVALID') &&
      Boolean(tokenStorage.getRefreshToken());

    if (canRefresh) {
      config._retried = true;

      try {
        refreshInFlight ??= refreshAccessToken().finally(() => {
          refreshInFlight = null;
        });

        const accessToken = await refreshInFlight;

        const headers =
          config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
        headers.set('Authorization', `Bearer ${accessToken}`);
        config.headers = headers;

        return api.request(config);
      } catch {
        tokenStorage.clear();
        onSessionExpired();

        return Promise.reject({
          message: 'Your session has expired. Please sign in again.',
          code: 'SESSION_EXPIRED',
          status: 401,
        } satisfies ApiError);
      }
    }

    if (status === 401 && !isPublicPath(config?.url)) {
      tokenStorage.clear();
      onSessionExpired();
    }

    return Promise.reject(normaliseError(error));
  },
);

/**
 * Unwraps `ApiResponse<T>` into `T`.
 *
 * Every service method goes through this, so no component ever touches the
 * envelope. A success envelope with a null `data` is a server contract
 * violation and throws rather than silently yielding null.
 */
export async function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const response = await request;
  const body = response.data;

  if (!body.success) {
    throw {
      message: body.message,
      code: body.error?.code ?? 'REQUEST_FAILED',
      status: response.status,
      details: body.error?.details,
    } satisfies ApiError;
  }

  return body.data as T;
}

/**
 * Like `unwrap`, but also returns the pagination metadata that the gateway
 * puts in `meta` rather than in `data`.
 */
export async function unwrapList<T>(
  request: Promise<AxiosResponse<ApiResponse<T[]>>>,
): Promise<{ items: T[]; pagination: NonNullable<ApiResponse<T[]>['meta']>['pagination'] }> {
  const response = await request;
  const body = response.data;

  if (!body.success) {
    throw {
      message: body.message,
      code: body.error?.code ?? 'REQUEST_FAILED',
      status: response.status,
      details: body.error?.details,
    } satisfies ApiError;
  }

  return { items: body.data ?? [], pagination: body.meta?.pagination };
}

/** Type guard so `catch` blocks can narrow safely. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiError).message === 'string' &&
    typeof (value as ApiError).code === 'string'
  );
}

export function errorMessage(value: unknown, fallback = 'Something went wrong.'): string {
  if (isApiError(value)) {
    if (Array.isArray(value.details) && value.details.length > 0) {
      return value.details.map(String).join(' ');
    }
    return value.message;
  }
  if (value instanceof Error) return value.message;
  return fallback;
}

export { STORAGE_KEYS };
export default api;

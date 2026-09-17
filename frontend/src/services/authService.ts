import api, { unwrap } from './api';
import type {
  AuthTokens,
  AuthUser,
  ChangePasswordPayload,
  LoginCredentials,
  LoginResult,
  RegisterPayload,
} from '@/types';

/**
 * Authentication endpoints on the API Gateway. Components and thunks call
 * these rather than axios directly, so URLs live in exactly one place.
 */
export const authService = {
  login: (credentials: LoginCredentials): Promise<LoginResult> =>
    unwrap(api.post('/auth/login', credentials)),

  register: (payload: RegisterPayload): Promise<AuthUser> =>
    unwrap(api.post('/auth/register', payload)),

  refresh: (refreshToken: string): Promise<AuthTokens> =>
    unwrap(api.post('/auth/refresh', { refreshToken })),

  logout: (refreshToken: string): Promise<{ revoked: boolean }> =>
    unwrap(api.post('/auth/logout', { refreshToken })),

  /** Fresh roles and permissions from the database, not the token claims. */
  me: (): Promise<AuthUser> => unwrap(api.get('/auth/me')),

  changePassword: (payload: ChangePasswordPayload): Promise<{ changed: boolean }> =>
    unwrap(api.post('/auth/change-password', payload)),

  forgotPassword: (email: string): Promise<{ sent: boolean }> =>
    unwrap(api.post('/auth/forgot-password', { email })),

  resetPassword: (payload: {
    token: string;
    email: string;
    password: string;
  }): Promise<{ reset: boolean }> => unwrap(api.post('/auth/reset-password', payload)),
};

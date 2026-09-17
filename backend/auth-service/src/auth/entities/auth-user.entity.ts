import { AuthTokens } from '@dpgc/shared';

/**
 * The user shape returned across the TCP boundary.
 *
 * Deliberately excludes `password`, `initialPassword` and the lockout counters
 * so a credential hash can never leak through the gateway into an API
 * response. Anything the client may see is listed here explicitly.
 */
export interface AuthUserEntity {
  id: number;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  status: string;
  profileImage: string | null;
  emailVerified: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  departmentId: number | null;
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
  committeeId: number | null;
}

export interface AuthResultEntity {
  user: AuthUserEntity;
  tokens: AuthTokens;
}

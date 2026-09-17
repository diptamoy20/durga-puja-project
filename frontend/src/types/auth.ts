export interface AuthUser {
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
  lastLoginAt: string | null;
  departmentId: number | null;
  roles: string[];
  /** Permission keys; the UI gates on these rather than on role names. */
  permissions: string[];
  isSuperAdmin: boolean;
  committeeId: number | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface LoginResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

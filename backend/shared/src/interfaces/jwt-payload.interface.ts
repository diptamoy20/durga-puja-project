/**
 * Access token claims.
 *
 * Roles and permission keys are embedded so the gateway can authorise locally
 * without a round trip to the auth service on every request. The trade-off is
 * that a permission change only takes effect once the token is refreshed
 * (<= JWT_EXPIRES_IN).
 */
export interface JwtPayload {
  /** User id, as a string per the JWT `sub` convention. */
  sub: string;
  email: string;
  name: string | null;
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
  /** Set for Committee Member accounts; scopes them to their own records. */
  committeeId: number | null;
  type: 'access';
  iat?: number;
  exp?: number;
  iss?: string;
}

export interface RefreshTokenPayload {
  sub: string;
  /** Refresh token id, matched against the hashed row in `refresh_tokens`. */
  jti: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

/** The request-scoped principal attached by JwtAuthGuard. */
export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string | null;
  roles: string[];
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

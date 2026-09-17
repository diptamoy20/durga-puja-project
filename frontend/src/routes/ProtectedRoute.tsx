import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import type { PermissionKey } from '@/constants/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Caller must hold ANY of these permissions. Omit for any signed-in user. */
  permissions?: PermissionKey[];
}

/**
 * Gates a route on an authenticated session and, optionally, permissions.
 *
 * This is a usability guard, not a security boundary: the gateway enforces the
 * same rules server-side, so a user who bypasses the client still gets a 403.
 */
export function ProtectedRoute({ children, permissions }: ProtectedRouteProps) {
  const { isAuthenticated, initialising, can } = useAuth();
  const location = useLocation();

  // Waiting on `loadSession`. Redirecting now would bounce a signed-in user to
  // the login page on every refresh.
  if (initialising) return <PageLoader label="Restoring your session" />;

  if (!isAuthenticated) {
    // `state.from` lets the login page return the user where they were headed.
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (permissions && permissions.length > 0 && !can(...permissions)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <>{children}</>;
}

/** Keeps a signed-in user away from the login and register pages. */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, initialising } = useAuth();

  if (initialising) return <PageLoader label="Restoring your session" />;
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <>{children}</>;
}

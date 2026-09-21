import { useCallback } from 'react';

import { refreshSession } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { PermissionKey } from '@/constants/permissions';

/**
 * Read-only view of the session, plus permission helpers.
 *
 * Authorisation is always decided from permission keys, never from role names,
 * so the server can reorganise roles without a frontend change. Super Admin
 * short-circuits every check, mirroring the backend guards.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, initialising, status, error } = useAppSelector(
    (state) => state.auth,
  );

  const can = useCallback(
    (...permissions: PermissionKey[]): boolean => {
      if (!user) return false;
      if (user.isSuperAdmin) return true;

      return permissions.some((permission) => user.permissions.includes(permission));
    },
    [user],
  );

  const canAll = useCallback(
    (...permissions: PermissionKey[]): boolean => {
      if (!user) return false;
      if (user.isSuperAdmin) return true;

      return permissions.every((permission) => user.permissions.includes(permission));
    },
    [user],
  );

  const hasRole = useCallback(
    (...roles: string[]): boolean => {
      if (!user) return false;
      if (user.isSuperAdmin) return true;

      return roles.some((role) => user.roles.includes(role));
    },
    [user],
  );

  const refreshPermissions = useCallback(async () => {
    await dispatch(refreshSession());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    initialising,
    status,
    error,
    can,
    canAll,
    hasRole,
    refreshPermissions,
    displayName: user?.name ?? user?.email ?? 'Signed in',
  };
}

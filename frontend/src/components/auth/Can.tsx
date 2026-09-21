import type { ReactNode } from 'react';

import type { PermissionKey } from '@/constants/permissions';
import { useAuth } from '@/hooks/useAuth';

interface CanProps {
  /** One permission or several; `can()` passes when the user holds any of them. */
  permission: PermissionKey | PermissionKey[];
  /** When true, every listed permission must be held (`canAll`). */
  all?: boolean;
  children: ReactNode;
}

/** Renders children only when the current user holds the required permission(s). */
export function Can({ permission, all = false, children }: CanProps) {
  const { can, canAll } = useAuth();
  const permissions = Array.isArray(permission) ? permission : [permission];
  const allowed = all ? canAll(...permissions) : can(...permissions);

  return allowed ? children : null;
}

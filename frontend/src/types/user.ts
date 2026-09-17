import type { ListQuery } from './api';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface RoleSummary {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
  username: string | null;
  employeeId: string | null;
  phone: string | null;
  status: UserStatus;
  profileImage: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  emailVerified: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  department: Department | null;
  roles: RoleSummary[];
}

export interface UserListQuery extends ListQuery {
  status?: UserStatus;
  roleId?: number;
  departmentId?: number;
  sortBy?: 'createdAt' | 'name' | 'email' | 'status' | 'lastLoginAt';
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  /** Blank means "generate one", which the API returns once on create. */
  password?: string;
  phone?: string;
  username?: string;
  employeeId?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  departmentId?: number;
  status?: UserStatus;
  roleIds?: number[];
}

/** The API returns the generated password once, on create or reset. */
export interface CreatedUser extends User {
  generatedPassword?: string;
}

export interface UserStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  suspended: number;
}

export type RecordStatus = 'ACTIVE' | 'INACTIVE';

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: RecordStatus;
  isSystem: boolean;
  permissionCount: number;
  userCount: number;
  createdAt: string;
  /** Set only on rows from the trash view. */
  deletedAt?: string | null;
}

export interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  /** Soft-deleted roles, which the trash view lists. */
  trashed: number;
}

export interface RoleListQuery extends ListQuery {
  status?: RecordStatus;
  trashed?: boolean;
  sortBy?: 'name' | 'slug' | 'status' | 'createdAt';
}

export interface Permission {
  id: number;
  module: string;
  permissionName: string;
  permissionKey: string;
  description: string | null;
  status: RecordStatus;
  /** How many roles hold it; present on list rows only. */
  roleCount?: number;
  /** Set only on rows from the trash view. */
  deletedAt?: string | null;
}

/** A single permission with the roles holding it. */
export interface PermissionDetail extends Permission {
  roles: Array<{ id: number; name: string; slug: string }>;
}

export interface PermissionStats {
  total: number;
  active: number;
  /** Distinct modules across the live permissions. */
  modules: number;
  trashed: number;
}

export interface PermissionListQuery extends ListQuery {
  module?: string;
  status?: RecordStatus;
  trashed?: boolean;
  sortBy?: 'module' | 'permissionName' | 'permissionKey' | 'status';
}

export interface PermissionFormValues {
  module: string;
  permissionName: string;
  /** Immutable after creation, so it is only sent on create. */
  permissionKey: string;
  description?: string;
}

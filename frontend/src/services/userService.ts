import api, { unwrap, unwrapList } from './api';
import type {
  CreatedUser,
  Department,
  PaginatedData,
  Permission,
  PermissionDetail,
  PermissionFormValues,
  PermissionListQuery,
  PermissionStats,
  RecordStatus,
  Role,
  RoleListQuery,
  RoleStats,
  User,
  UserFormValues,
  UserListQuery,
  UserStats,
} from '@/types';

/** Drops undefined and empty values so they are not sent as `?status=`. */
function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
}

export const userService = {
  list: async (query: UserListQuery = {}): Promise<PaginatedData<User>> => {
    const { items, pagination } = await unwrapList<User>(
      api.get('/users', { params: toParams(query) }),
    );

    return {
      items,
      pagination: pagination ?? {
        page: 1,
        perPage: items.length,
        total: items.length,
        lastPage: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  },

  get: (id: number): Promise<User> => unwrap(api.get(`/users/${id}`)),

  stats: (): Promise<UserStats> => unwrap(api.get('/users/stats')),

  create: (values: UserFormValues): Promise<CreatedUser> => unwrap(api.post('/users', values)),

  update: (id: number, values: Partial<UserFormValues>): Promise<User> =>
    unwrap(api.put(`/users/${id}`, values)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/users/${id}`)),

  bulkRemove: (ids: number[]): Promise<{ deleted: number; skipped: number[] }> =>
    unwrap(api.post('/users/bulk-delete', { ids })),

  bulkStatus: (ids: number[], status: string): Promise<{ updated: number }> =>
    unwrap(api.post('/users/bulk-status', { ids, status })),

  assignRoles: (id: number, roleIds: number[]): Promise<User> =>
    unwrap(api.patch(`/users/${id}/roles`, { roleIds })),

  resetPassword: (
    id: number,
    password?: string,
  ): Promise<{ id: number; generatedPassword?: string }> =>
    unwrap(api.post(`/users/${id}/reset-password`, password ? { password } : {})),
};

export const roleService = {
  list: async (query: RoleListQuery = {}) => {
    const { items, pagination } = await unwrapList<Role>(
      // `trashed` is deliberately not dropped when false: the flag carries
      // meaning either way, unlike an empty filter.
      api.get('/roles', {
        params: { ...toParams(query), ...(query.trashed ? { trashed: 1 } : {}) },
      }),
    );
    return { items, pagination };
  },

  stats: (): Promise<RoleStats> => unwrap(api.get('/roles/stats')),

  get: (id: number) => unwrap<Role & { permissions: Permission[] }>(api.get(`/roles/${id}`)),

  matrix: () =>
    unwrap<{
      roles: Array<{ id: number; name: string; slug: string; isSystem: boolean }>;
      modules: Array<{ module: string; permissions: Permission[] }>;
      /** "roleId:permissionId" pairs that are granted. */
      granted: string[];
    }>(api.get('/roles/matrix')),

  create: (values: { name: string; description?: string; permissionIds?: number[] }) =>
    unwrap<Role>(api.post('/roles', values)),

  update: (id: number, values: { name?: string; description?: string }) =>
    unwrap<Role>(api.put(`/roles/${id}`, values)),

  remove: (id: number) => unwrap<{ id: number; deleted: boolean }>(api.delete(`/roles/${id}`)),

  restore: (id: number) =>
    unwrap<{ id: number; name: string; status: RecordStatus }>(api.post(`/roles/${id}/restore`)),

  toggleStatus: (id: number) =>
    unwrap<{ id: number; name: string; status: RecordStatus }>(
      api.post(`/roles/${id}/toggle-status`),
    ),

  syncPermissions: (id: number, permissionIds: number[]) =>
    unwrap<Role>(api.put(`/roles/${id}/permissions`, { permissionIds })),
};

export const permissionService = {
  list: async (query: PermissionListQuery = {}) => {
    const { items, pagination } = await unwrapList<Permission>(
      // `trashed` is deliberately not dropped when false: the flag carries
      // meaning either way, unlike an empty filter.
      api.get('/permissions', {
        params: { ...toParams({ perPage: 100, ...query }), ...(query.trashed ? { trashed: 1 } : {}) },
      }),
    );
    return { items, pagination };
  },

  get: (id: number): Promise<PermissionDetail> => unwrap(api.get(`/permissions/${id}`)),

  stats: (): Promise<PermissionStats> => unwrap(api.get('/permissions/stats')),

  modules: (): Promise<string[]> => unwrap(api.get('/permissions/modules')),

  create: (values: PermissionFormValues): Promise<Permission> =>
    unwrap(api.post('/permissions', values)),

  update: (
    id: number,
    values: Omit<Partial<PermissionFormValues>, 'permissionKey'>,
  ): Promise<Permission> => unwrap(api.put(`/permissions/${id}`, values)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/permissions/${id}`)),

  restore: (id: number): Promise<{ id: number; permissionName: string; status: RecordStatus }> =>
    unwrap(api.post(`/permissions/${id}/restore`)),

  toggleStatus: (
    id: number,
  ): Promise<{ id: number; permissionName: string; status: RecordStatus }> =>
    unwrap(api.post(`/permissions/${id}/toggle-status`)),
};

export const departmentService = {
  list: (): Promise<Array<Department & { _count: { users: number } }>> =>
    unwrap(api.get('/departments')),
};

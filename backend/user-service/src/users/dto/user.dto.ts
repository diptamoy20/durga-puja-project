import { UserStatus } from '@dpgc/database';

/**
 * Payload shapes received over TCP from the gateway.
 *
 * The gateway has already validated the request with class-validator DTOs, so
 * these are interfaces describing the wire contract rather than a second
 * validation layer.
 */

export interface ListUsersPayload {
  page: number;
  perPage: number;
  search?: string;
  sortBy: 'createdAt' | 'name' | 'email' | 'status' | 'lastLoginAt';
  sortDir: 'asc' | 'desc';
  status?: UserStatus;
  roleId?: number;
  departmentId?: number;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
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

export type UpdateUserData = Partial<Omit<CreateUserData, 'password'>>;

export interface CreateUserPayload {
  data: CreateUserData;
  actorId: number;
}

export interface UpdateUserPayload {
  id: number;
  data: UpdateUserData;
  actorId: number;
}

export interface IdPayload {
  id: number;
  actorId: number;
}

export interface BulkIdsPayload {
  ids: number[];
  actorId: number;
}

export interface BulkStatusPayload extends BulkIdsPayload {
  status: UserStatus;
}

export interface AssignRolesPayload {
  id: number;
  roleIds: number[];
  actorId: number;
}

export interface ResetPasswordPayload {
  id: number;
  password?: string;
  actorId: number;
}

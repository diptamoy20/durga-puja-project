import { RecordStatus } from '@dpgc/database';
import { USER_PATTERNS } from '@dpgc/shared';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RbacService } from './rbac.service';

interface ListQuery {
  page: number;
  perPage: number;
  search?: string;
  sortDir: 'asc' | 'desc';
}

interface RoleListQuery extends ListQuery {
  status?: RecordStatus;
  trashed?: boolean;
  sortBy?: 'name' | 'slug' | 'status' | 'createdAt';
}

interface PermissionListQuery extends ListQuery {
  module?: string;
  status?: RecordStatus;
  trashed?: boolean;
  sortBy?: 'module' | 'permissionName' | 'permissionKey' | 'status';
}

@Controller()
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @MessagePattern(USER_PATTERNS.ROLE_FIND_ALL)
  findAllRoles(@Payload() query: RoleListQuery) {
    return this.rbacService.findAllRoles(query);
  }

  @MessagePattern(USER_PATTERNS.ROLE_STATS)
  roleStats() {
    return this.rbacService.roleStats();
  }

  @MessagePattern(USER_PATTERNS.ROLE_FIND_ONE)
  findOneRole(@Payload() payload: { id: number }) {
    return this.rbacService.findOneRole(payload.id);
  }

  @MessagePattern(USER_PATTERNS.ROLE_CREATE)
  createRole(
    @Payload()
    payload: {
      data: { name: string; description?: string; permissionIds?: number[] };
      actorId: number;
    },
  ) {
    return this.rbacService.createRole(payload);
  }

  @MessagePattern(USER_PATTERNS.ROLE_UPDATE)
  updateRole(
    @Payload() payload: { id: number; data: { name?: string; description?: string }; actorId: number },
  ) {
    return this.rbacService.updateRole(payload);
  }

  @MessagePattern(USER_PATTERNS.ROLE_REMOVE)
  removeRole(@Payload() payload: { id: number; actorId: number }) {
    return this.rbacService.removeRole(payload);
  }

  @MessagePattern(USER_PATTERNS.ROLE_RESTORE)
  restoreRole(@Payload() payload: { id: number; actorId: number }) {
    return this.rbacService.restoreRole(payload);
  }

  @MessagePattern(USER_PATTERNS.ROLE_TOGGLE_STATUS)
  toggleRoleStatus(@Payload() payload: { id: number; actorId: number }) {
    return this.rbacService.toggleRoleStatus(payload);
  }

  @MessagePattern(USER_PATTERNS.ROLE_SYNC_PERMISSIONS)
  syncPermissions(@Payload() payload: { id: number; permissionIds: number[]; actorId: number }) {
    return this.rbacService.syncPermissions(payload);
  }

  @MessagePattern(USER_PATTERNS.ROLE_MATRIX)
  matrix() {
    return this.rbacService.matrix();
  }

  @MessagePattern(USER_PATTERNS.PERMISSION_FIND_ALL)
  findAllPermissions(@Payload() query: PermissionListQuery) {
    return this.rbacService.findAllPermissions(query);
  }

  @MessagePattern(USER_PATTERNS.PERMISSION_FIND_ONE)
  findOnePermission(@Payload() payload: { id: number }) {
    return this.rbacService.findOnePermission(payload.id);
  }

  @MessagePattern(USER_PATTERNS.PERMISSION_STATS)
  permissionStats() {
    return this.rbacService.permissionStats();
  }

  @MessagePattern(USER_PATTERNS.PERMISSION_MODULES)
  permissionModules() {
    return this.rbacService.permissionModules();
  }

  @MessagePattern(USER_PATTERNS.PERMISSION_CREATE)
  createPermission(
    @Payload()
    payload: {
      data: { module: string; permissionName: string; permissionKey: string; description?: string };
      actorId: number;
    },
  ) {
    return this.rbacService.createPermission(payload);
  }

  @MessagePattern(USER_PATTERNS.PERMISSION_UPDATE)
  updatePermission(
    @Payload()
    payload: {
      id: number;
      data: { module?: string; permissionName?: string; description?: string };
      actorId: number;
    },
  ) {
    return this.rbacService.updatePermission(payload);
  }

  @MessagePattern(USER_PATTERNS.PERMISSION_REMOVE)
  removePermission(@Payload() payload: { id: number; actorId: number }) {
    return this.rbacService.removePermission(payload);
  }

  @MessagePattern(USER_PATTERNS.PERMISSION_RESTORE)
  restorePermission(@Payload() payload: { id: number; actorId: number }) {
    return this.rbacService.restorePermission(payload);
  }

  @MessagePattern(USER_PATTERNS.PERMISSION_TOGGLE_STATUS)
  togglePermissionStatus(@Payload() payload: { id: number; actorId: number }) {
    return this.rbacService.togglePermissionStatus(payload);
  }

  @MessagePattern(USER_PATTERNS.DEPARTMENT_FIND_ALL)
  findAllDepartments() {
    return this.rbacService.findAllDepartments();
  }

  @MessagePattern(USER_PATTERNS.DEPARTMENT_CREATE)
  createDepartment(
    @Payload() payload: { data: { name: string; code: string; description?: string }; actorId: number },
  ) {
    return this.rbacService.createDepartment(payload);
  }
}

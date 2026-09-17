import { USER_PATTERNS } from '@dpgc/shared';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuditService } from '../audit/audit.service';
import {
  AssignRolesPayload,
  BulkIdsPayload,
  BulkStatusPayload,
  CreateUserPayload,
  IdPayload,
  ListUsersPayload,
  ResetPasswordPayload,
  UpdateUserPayload,
} from './dto/user.dto';
import { UsersService } from './users.service';

/**
 * TCP handlers only — no HTTP surface, so this service is unreachable from the
 * browser. Handlers delegate straight to the service layer.
 */
@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @MessagePattern('health.ping')
  ping(): { service: string; status: string } {
    return { service: 'user-service', status: 'ok' };
  }

  @MessagePattern(USER_PATTERNS.FIND_ALL)
  findAll(@Payload() query: ListUsersPayload) {
    return this.usersService.findAll(query);
  }

  @MessagePattern(USER_PATTERNS.FIND_ONE)
  findOne(@Payload() payload: { id: number }) {
    return this.usersService.findOne(payload.id);
  }

  @MessagePattern(USER_PATTERNS.STATS)
  stats() {
    return this.usersService.stats();
  }

  @MessagePattern(USER_PATTERNS.CREATE)
  create(@Payload() payload: CreateUserPayload) {
    return this.usersService.create(payload);
  }

  @MessagePattern(USER_PATTERNS.UPDATE)
  update(@Payload() payload: UpdateUserPayload) {
    return this.usersService.update(payload);
  }

  @MessagePattern(USER_PATTERNS.REMOVE)
  remove(@Payload() payload: IdPayload) {
    return this.usersService.remove(payload);
  }

  @MessagePattern(USER_PATTERNS.BULK_REMOVE)
  bulkRemove(@Payload() payload: BulkIdsPayload) {
    return this.usersService.bulkRemove(payload);
  }

  @MessagePattern(USER_PATTERNS.BULK_STATUS)
  bulkStatus(@Payload() payload: BulkStatusPayload) {
    return this.usersService.bulkStatus(payload);
  }

  @MessagePattern(USER_PATTERNS.ASSIGN_ROLES)
  assignRoles(@Payload() payload: AssignRolesPayload) {
    return this.usersService.assignRoles(payload);
  }

  @MessagePattern(USER_PATTERNS.RESET_PASSWORD)
  resetPassword(@Payload() payload: ResetPasswordPayload) {
    return this.usersService.resetPassword(payload);
  }

  @MessagePattern(USER_PATTERNS.AUDIT_FIND_ALL)
  findAuditLogs(
    @Payload() query: { page: number; perPage: number; search?: string; sortDir: 'asc' | 'desc' },
  ) {
    return this.auditService.findAll(query);
  }
}

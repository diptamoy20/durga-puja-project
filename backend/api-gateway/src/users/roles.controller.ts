import {
  AuthenticatedUser,
  CurrentUser,
  PERMISSIONS,
  PaginationQueryDto,
  RequirePermissions,
  SERVICE_TOKENS,
  USER_PATTERNS,
} from '@dpgc/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { MicroserviceClient } from '../clients/microservice.client';
import { ResponseMessage } from '../interceptors/response.interceptor';

export enum RecordStatusDto {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

const ROLE_SORTABLE = ['name', 'slug', 'status', 'createdAt'] as const;

export class ListRolesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ROLE_SORTABLE, default: 'name' })
  @IsIn(ROLE_SORTABLE as unknown as string[])
  @IsOptional()
  sortBy: (typeof ROLE_SORTABLE)[number] = 'name';

  @ApiPropertyOptional({ enum: RecordStatusDto })
  @IsEnum(RecordStatusDto)
  @IsOptional()
  status?: RecordStatusDto;

  @ApiPropertyOptional({
    description: 'List soft-deleted roles instead of live ones.',
    default: false,
  })
  // Query strings carry "1"/"true", which would otherwise arrive as a truthy
  // string and make `trashed=0` mean the opposite of what it says.
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  @IsOptional()
  trashed?: boolean;
}

const PERMISSION_SORTABLE = ['module', 'permissionName', 'permissionKey', 'status'] as const;

export class ListPermissionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: PERMISSION_SORTABLE })
  @IsIn(PERMISSION_SORTABLE as unknown as string[])
  @IsOptional()
  sortBy?: (typeof PERMISSION_SORTABLE)[number];

  @ApiPropertyOptional({ example: 'User Management' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  module?: string;

  @ApiPropertyOptional({ enum: RecordStatusDto })
  @IsEnum(RecordStatusDto)
  @IsOptional()
  status?: RecordStatusDto;

  @ApiPropertyOptional({
    description: 'List soft-deleted permissions instead of live ones.',
    default: false,
  })
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  @IsOptional()
  trashed?: boolean;
}

export class CreatePermissionDto {
  @ApiProperty({ example: 'Pandal Atlas' })
  @IsString()
  @MinLength(2, { message: 'Module must be at least 2 characters.' })
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  module: string;

  @ApiProperty({ example: 'Publish Pandal' })
  @IsString()
  @MinLength(2, { message: 'Permission name must be at least 2 characters.' })
  @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  permissionName: string;

  @ApiProperty({
    example: 'publish_pandal',
    description: 'The key checked in code. Lower-cased and cannot be changed later.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Permission key may contain only lowercase letters, numbers and underscores.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  permissionKey: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  module?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  permissionName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'District Reviewer' })
  @IsString()
  @MinLength(2, { message: 'Role name must be at least 2 characters.' })
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ type: [Number], description: 'Permission ids to grant.' })
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @IsOptional()
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class SyncPermissionsDto {
  @ApiProperty({ type: [Number], description: 'The complete set of permission ids for this role.' })
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  permissionIds: number[];
}

/**
 * Roles and permissions administration, including the role x permission
 * matrix that the Blade UI exposed.
 */
@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller()
export class RolesController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get('roles')
  @RequirePermissions(PERMISSIONS.VIEW_ROLES)
  @ResponseMessage('Roles retrieved successfully')
  @ApiOperation({ summary: 'List roles with their permission counts' })
  findAllRoles(@Query() query: ListRolesQueryDto) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ROLE_FIND_ALL, query);
  }

  @Get('roles/stats')
  @RequirePermissions(PERMISSIONS.VIEW_ROLES)
  @ResponseMessage('Role statistics retrieved successfully')
  @ApiOperation({ summary: 'Role counts by status, plus how many are in the trash' })
  roleStats() {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ROLE_STATS, {});
  }

  @Get('roles/matrix')
  @RequirePermissions(PERMISSIONS.MANAGE_ROLE_PERMISSIONS)
  @ResponseMessage('Permission matrix retrieved successfully')
  @ApiOperation({
    summary: 'Role x permission matrix',
    description: 'Every role and permission plus which pairs are granted, for the matrix UI.',
  })
  matrix() {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ROLE_MATRIX, {});
  }

  @Get('roles/:id')
  @RequirePermissions(PERMISSIONS.VIEW_ROLES)
  @ResponseMessage('Role retrieved successfully')
  @ApiOperation({ summary: 'Get a role with its permissions' })
  @ApiResponse({ status: 404, description: 'No role with that id.' })
  findOneRole(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ROLE_FIND_ONE, { id });
  }

  @Post('roles')
  @RequirePermissions(PERMISSIONS.CREATE_ROLES)
  @ResponseMessage('Role created successfully')
  @ApiOperation({ summary: 'Create a role' })
  @ApiResponse({ status: 409, description: 'A role with that name already exists.' })
  createRole(@Body() dto: CreateRoleDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ROLE_CREATE, {
      data: dto,
      actorId: actor.id,
    });
  }

  @Put('roles/:id')
  @RequirePermissions(PERMISSIONS.EDIT_ROLES)
  @ResponseMessage('Role updated successfully')
  @ApiOperation({ summary: 'Update a role' })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ROLE_UPDATE, {
      id,
      data: dto,
      actorId: actor.id,
    });
  }

  @Delete('roles/:id')
  @RequirePermissions(PERMISSIONS.DELETE_ROLES)
  @ResponseMessage('Role deleted successfully')
  @ApiOperation({
    summary: 'Soft-delete a role',
    description: 'System roles and roles still assigned to users cannot be deleted.',
  })
  @ApiResponse({ status: 409, description: 'The role is a system role or still in use.' })
  removeRole(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ROLE_REMOVE, {
      id,
      actorId: actor.id,
    });
  }

  @Post('roles/:id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.DELETE_ROLES)
  @ResponseMessage('Role restored successfully')
  @ApiOperation({
    summary: 'Restore a soft-deleted role',
    description: 'The role comes back inactive, so its permissions are not granted again silently.',
  })
  @ApiResponse({ status: 409, description: 'The role is not in the trash.' })
  restoreRole(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ROLE_RESTORE, {
      id,
      actorId: actor.id,
    });
  }

  @Post('roles/:id/toggle-status')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.EDIT_ROLES)
  @ResponseMessage('Role status updated successfully')
  @ApiOperation({
    summary: 'Flip a role between active and inactive',
    description: 'System roles cannot be deactivated.',
  })
  @ApiResponse({ status: 403, description: 'The role is a system role.' })
  toggleRoleStatus(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ROLE_TOGGLE_STATUS, {
      id,
      actorId: actor.id,
    });
  }

  @Put('roles/:id/permissions')
  @RequirePermissions(PERMISSIONS.MANAGE_ROLE_PERMISSIONS)
  @ResponseMessage('Role permissions updated successfully')
  @ApiOperation({
    summary: 'Replace a role\'s permissions',
    description: 'The supplied list becomes the complete set of permissions for the role.',
  })
  syncPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SyncPermissionsDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ROLE_SYNC_PERMISSIONS, {
      id,
      permissionIds: dto.permissionIds,
      actorId: actor.id,
    });
  }

  @Get('permissions')
  @RequirePermissions(PERMISSIONS.VIEW_PERMISSIONS)
  @ResponseMessage('Permissions retrieved successfully')
  @ApiOperation({
    summary: 'List permissions with the number of roles holding each',
    description: 'Filterable by module and status, and can list the trash instead.',
  })
  findAllPermissions(@Query() query: ListPermissionsQueryDto) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.PERMISSION_FIND_ALL, query);
  }

  @Get('permissions/stats')
  @RequirePermissions(PERMISSIONS.VIEW_PERMISSIONS)
  @ResponseMessage('Permission statistics retrieved successfully')
  @ApiOperation({ summary: 'Permission counts, module count and trash size' })
  permissionStats() {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.PERMISSION_STATS, {});
  }

  @Get('permissions/modules')
  @RequirePermissions(PERMISSIONS.VIEW_PERMISSIONS)
  @ResponseMessage('Permission modules retrieved successfully')
  @ApiOperation({ summary: 'Distinct module names, for the list filter' })
  permissionModules() {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.PERMISSION_MODULES, {});
  }

  @Get('permissions/:id')
  @RequirePermissions(PERMISSIONS.VIEW_PERMISSIONS)
  @ResponseMessage('Permission retrieved successfully')
  @ApiOperation({ summary: 'Get a permission and the roles holding it' })
  @ApiResponse({ status: 404, description: 'No permission with that id.' })
  findOnePermission(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.PERMISSION_FIND_ONE, { id });
  }

  @Post('permissions')
  @RequirePermissions(PERMISSIONS.CREATE_PERMISSIONS)
  @ResponseMessage('Permission created successfully')
  @ApiOperation({ summary: 'Create a permission' })
  @ApiResponse({ status: 409, description: 'That permission key already exists.' })
  createPermission(@Body() dto: CreatePermissionDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.PERMISSION_CREATE, {
      data: dto,
      actorId: actor.id,
    });
  }

  @Put('permissions/:id')
  @RequirePermissions(PERMISSIONS.EDIT_PERMISSIONS)
  @ResponseMessage('Permission updated successfully')
  @ApiOperation({
    summary: 'Update a permission',
    description: 'The key itself is immutable, since the guards compare against it.',
  })
  updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.PERMISSION_UPDATE, {
      id,
      data: dto,
      actorId: actor.id,
    });
  }

  @Delete('permissions/:id')
  @RequirePermissions(PERMISSIONS.DELETE_PERMISSIONS)
  @ResponseMessage('Permission deleted successfully')
  @ApiOperation({
    summary: 'Soft-delete a permission',
    description: 'Permissions built into the portal cannot be deleted.',
  })
  @ApiResponse({ status: 403, description: 'The permission is built into the portal.' })
  removePermission(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.PERMISSION_REMOVE, {
      id,
      actorId: actor.id,
    });
  }

  @Post('permissions/:id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.DELETE_PERMISSIONS)
  @ResponseMessage('Permission restored successfully')
  @ApiOperation({
    summary: 'Restore a soft-deleted permission',
    description: 'It comes back inactive, so no role regains it until you activate it.',
  })
  @ApiResponse({ status: 409, description: 'The permission is not in the trash.' })
  restorePermission(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.PERMISSION_RESTORE, {
      id,
      actorId: actor.id,
    });
  }

  @Post('permissions/:id/toggle-status')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.EDIT_PERMISSIONS)
  @ResponseMessage('Permission status updated successfully')
  @ApiOperation({
    summary: 'Flip a permission between active and inactive',
    description:
      'An inactive permission stops being granted at the holder\'s next sign-in. Permissions ' +
      'built into the portal cannot be deactivated.',
  })
  @ApiResponse({ status: 403, description: 'The permission is built into the portal.' })
  togglePermissionStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.PERMISSION_TOGGLE_STATUS, {
      id,
      actorId: actor.id,
    });
  }

  @Get('departments')
  @RequirePermissions(PERMISSIONS.VIEW_DEPARTMENTS)
  @ResponseMessage('Departments retrieved successfully')
  @ApiOperation({ summary: 'List departments' })
  findAllDepartments() {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.DEPARTMENT_FIND_ALL, {});
  }

  @Get('audit-logs')
  @RequirePermissions(PERMISSIONS.VIEW_AUDIT_LOGS)
  @ResponseMessage('Audit logs retrieved successfully')
  @ApiOperation({ summary: 'List audit log entries' })
  findAuditLogs(@Query() query: PaginationQueryDto) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.AUDIT_FIND_ALL, query);
  }
}

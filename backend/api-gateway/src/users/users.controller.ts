import {
  AuthenticatedUser,
  CurrentUser,
  PERMISSIONS,
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
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { MicroserviceClient } from '../clients/microservice.client';
import { ResponseMessage } from '../interceptors/response.interceptor';
import {
  AssignRolesDto,
  BulkStatusDto,
  BulkUserIdsDto,
  CreateUserDto,
  ListUsersQueryDto,
  ResetUserPasswordDto,
  UpdateUserDto,
} from './dto/user.dto';

/**
 * Administrative user management. Every route is permission-gated; the
 * PermissionsGuard runs globally and reads the @RequirePermissions metadata.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_USERS)
  @ResponseMessage('Users retrieved successfully')
  @ApiOperation({
    summary: 'List users',
    description: 'Paginated, searchable and filterable by status, role and department.',
  })
  @ApiResponse({ status: 200, description: 'A page of users plus pagination metadata.' })
  @ApiResponse({ status: 403, description: 'Missing the view_users permission.' })
  findAll(@Query() query: ListUsersQueryDto) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.FIND_ALL, query);
  }

  @Get('stats')
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  @ResponseMessage('User statistics retrieved successfully')
  @ApiOperation({ summary: 'User counts by status, for the dashboard' })
  stats() {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.STATS, {});
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_USERS)
  @ResponseMessage('User retrieved successfully')
  @ApiOperation({ summary: 'Get a single user with their roles' })
  @ApiResponse({ status: 404, description: 'No user with that id.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.FIND_ONE, { id });
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CREATE_USERS)
  @ResponseMessage('User created successfully')
  @ApiOperation({
    summary: 'Create a user',
    description:
      'Omitting `password` generates a secure one and stores it encrypted so the administrator can pass it on.',
  })
  @ApiResponse({ status: 201, description: 'User created.' })
  @ApiResponse({ status: 409, description: 'The email, username or employee ID is taken.' })
  create(@Body() dto: CreateUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.CREATE, {
      data: dto,
      actorId: actor.id,
    });
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.EDIT_USERS)
  @ResponseMessage('User updated successfully')
  @ApiOperation({ summary: 'Update a user' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.UPDATE, {
      id,
      data: dto,
      actorId: actor.id,
    });
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.DELETE_USERS)
  @ResponseMessage('User deleted successfully')
  @ApiOperation({
    summary: 'Soft-delete a user',
    description: 'Sets `deletedAt`; the record is retained for audit purposes.',
  })
  @ApiResponse({ status: 400, description: 'You cannot delete your own account.' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.REMOVE, {
      id,
      actorId: actor.id,
    });
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.DELETE_USERS)
  @ResponseMessage('Selected users deleted successfully')
  @ApiOperation({ summary: 'Soft-delete several users at once' })
  bulkRemove(@Body() dto: BulkUserIdsDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.BULK_REMOVE, {
      ids: dto.ids,
      actorId: actor.id,
    });
  }

  @Post('bulk-status')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.EDIT_USERS)
  @ResponseMessage('Selected users updated successfully')
  @ApiOperation({ summary: 'Change the status of several users at once' })
  bulkStatus(@Body() dto: BulkStatusDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.BULK_STATUS, {
      ids: dto.ids,
      status: dto.status,
      actorId: actor.id,
    });
  }

  @Patch(':id/roles')
  @RequirePermissions(PERMISSIONS.ASSIGN_USER_ROLES)
  @ResponseMessage('Roles assigned successfully')
  @ApiOperation({
    summary: 'Replace a user\'s roles',
    description: 'The supplied list becomes the complete set of roles for the user.',
  })
  assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolesDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.ASSIGN_ROLES, {
      id,
      roleIds: dto.roleIds,
      actorId: actor.id,
    });
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.RESET_USER_PASSWORD)
  @ResponseMessage('Password reset successfully')
  @ApiOperation({
    summary: 'Reset a user\'s password as an administrator',
    description:
      'Returns the generated password when none was supplied. Revokes all of that user\'s sessions.',
  })
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetUserPasswordDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.USER, USER_PATTERNS.RESET_PASSWORD, {
      id,
      password: dto.password,
      actorId: actor.id,
    });
  }
}

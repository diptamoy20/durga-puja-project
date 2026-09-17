import {
  AuthenticatedUser,
  CurrentUser,
  PERMISSIONS,
  Public,
  REGISTRATION_PATTERNS,
  RequirePermissions,
  SERVICE_TOKENS,
} from '@dpgc/shared';
import {
  Body,
  Controller,
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
  BulkCommitteeActionDto,
  ChangeCommitteeStatusDto,
  DecideDiasporaDto,
  ListCommitteesQueryDto,
  ListDiasporaQueryDto,
  SubmitCommitteeDto,
  SubmitDiasporaDto,
  UpdateCommitteeDto,
} from './dto/registration.dto';

// ============================================================================
// PUBLIC Registration (no auth)
// ============================================================================

@ApiTags('Public Registration')
@Controller('registrations')
export class PublicRegistrationController {
  constructor(private readonly client: MicroserviceClient) {}

  @Public()
  @Post('diaspora')
  @ResponseMessage('Diaspora registration submitted successfully')
  @ApiOperation({
    summary: 'Submit a diaspora registration',
    description:
      'Public-facing form. Creates a pending diaspora registration that an admin will verify or reject.',
  })
  @ApiResponse({ status: 201, description: 'Registration created.' })
  @ApiResponse({ status: 409, description: 'A registration already exists for this email.' })
  submitDiaspora(@Body() dto: SubmitDiasporaDto) {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.DIASPORA_SUBMIT, dto);
  }

  @Public()
  @Post('committee')
  @ResponseMessage('Committee registration submitted successfully')
  @ApiOperation({
    summary: 'Submit a puja committee registration',
    description:
      'Public-facing form. Creates a pending committee application that an admin will review.',
  })
  @ApiResponse({ status: 201, description: 'Application created.' })
  submitCommittee(@Body() dto: SubmitCommitteeDto) {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.COMMITTEE_SUBMIT, dto);
  }
}

// ============================================================================
// Admin: Diaspora Verification
// ============================================================================

@ApiTags('Diaspora Verification')
@ApiBearerAuth()
@Controller('diaspora-verifications')
export class DiasporaVerificationController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_DIASPORA)
  @ResponseMessage('Diaspora registrations retrieved successfully')
  @ApiOperation({
    summary: 'List diaspora registrations',
    description: 'Paginated, searchable and filterable by status and country.',
  })
  findAll(@Query() query: ListDiasporaQueryDto) {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.DIASPORA_FIND_ALL, query);
  }

  @Get('stats')
  @RequirePermissions(PERMISSIONS.VIEW_DIASPORA)
  @ResponseMessage('Diaspora statistics retrieved successfully')
  @ApiOperation({ summary: 'Diaspora registration counts by status' })
  stats() {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.DIASPORA_STATS, {});
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_DIASPORA)
  @ResponseMessage('Diaspora registration retrieved successfully')
  @ApiOperation({ summary: 'Get a diaspora registration with its verification history' })
  @ApiResponse({ status: 404, description: 'No registration with that id.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.DIASPORA_FIND_ONE, { id });
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.VERIFY_DIASPORA)
  @ResponseMessage('Diaspora registration verified successfully')
  @ApiOperation({ summary: 'Verify a pending diaspora registration' })
  @ApiResponse({ status: 400, description: 'The registration is not pending.' })
  verify(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DecideDiasporaDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.DIASPORA_VERIFY, {
      id,
      reason: dto.reason,
      actorId: actor.id,
    });
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.REJECT_DIASPORA)
  @ResponseMessage('Diaspora registration rejected')
  @ApiOperation({ summary: 'Reject a pending diaspora registration' })
  @ApiResponse({ status: 400, description: 'A reason is required, or the registration is not pending.' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DecideDiasporaDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.DIASPORA_REJECT, {
      id,
      reason: dto.reason,
      actorId: actor.id,
    });
  }
}

// ============================================================================
// Admin: Puja Committee Management
// ============================================================================

@ApiTags('Puja Committees')
@ApiBearerAuth()
@Controller('puja-committees')
export class PujaCommitteeController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_COMMITTEES)
  @ResponseMessage('Puja committees retrieved successfully')
  @ApiOperation({
    summary: 'List puja committee applications',
    description: 'Paginated, searchable and filterable by status and city.',
  })
  findAll(@Query() query: ListCommitteesQueryDto) {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.COMMITTEE_FIND_ALL, query);
  }

  @Get('stats')
  @RequirePermissions(PERMISSIONS.VIEW_COMMITTEES)
  @ResponseMessage('Committee statistics retrieved successfully')
  @ApiOperation({ summary: 'Committee application counts by status' })
  stats() {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.COMMITTEE_STATS, {});
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_COMMITTEES)
  @ResponseMessage('Puja committee retrieved successfully')
  @ApiOperation({ summary: 'Get a committee application with status history' })
  @ApiResponse({ status: 404, description: 'No committee with that id.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.COMMITTEE_FIND_ONE, { id });
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.APPROVE_COMMITTEES)
  @ResponseMessage('Puja committee updated successfully')
  @ApiOperation({ summary: 'Update committee application details' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommitteeDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.COMMITTEE_UPDATE, {
      id,
      data: dto,
      actorId: actor.id,
    });
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.APPROVE_COMMITTEES)
  @ResponseMessage('Committee status updated successfully')
  @ApiOperation({
    summary: 'Change committee application status',
    description: 'Move between pending, under_review, approved, rejected.',
  })
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeCommitteeStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.COMMITTEE_CHANGE_STATUS, {
      id,
      status: dto.status,
      reason: dto.reason,
      actorId: actor.id,
    });
  }

  @Post(':id/create-portal-account')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.CREATE_COMMITTEE_PORTAL_ACCOUNT)
  @ResponseMessage('Portal account created successfully')
  @ApiOperation({
    summary: 'Create a portal user account for an approved committee',
    description:
      'Provisions a User linked to the committee, generates credentials and assigns the Committee Member role.',
  })
  @ApiResponse({ status: 400, description: 'Committee is not approved or already has an account.' })
  createPortalAccount(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(
      SERVICE_TOKENS.REGISTRATION,
      REGISTRATION_PATTERNS.COMMITTEE_CREATE_PORTAL_ACCOUNT,
      { id, actorId: actor.id },
    );
  }

  @Post('bulk-action')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.APPROVE_COMMITTEES)
  @ResponseMessage('Bulk action completed successfully')
  @ApiOperation({ summary: 'Apply a status change to multiple committees at once' })
  bulkAction(@Body() dto: BulkCommitteeActionDto, @CurrentUser() actor: AuthenticatedUser) {
    // Fan out to individual status changes; the service handles each one.
    const promises = dto.ids.map((id) =>
      this.client.send(SERVICE_TOKENS.REGISTRATION, REGISTRATION_PATTERNS.COMMITTEE_CHANGE_STATUS, {
        id,
        status: dto.action,
        reason: dto.reason,
        actorId: actor.id,
      }),
    );
    return Promise.allSettled(promises).then((results) => ({
      succeeded: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    }));
  }
}

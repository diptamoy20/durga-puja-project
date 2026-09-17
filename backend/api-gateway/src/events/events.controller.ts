import {
  AuthenticatedUser,
  CurrentUser,
  EVENTS_PATTERNS,
  PERMISSIONS,
  Public,
  RequirePermissions,
  SERVICE_TOKENS,
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { MicroserviceClient } from '../clients/microservice.client';
import { ResponseMessage } from '../interceptors/response.interceptor';
import {
  CreateWebinarDto,
  ListRsvpsQueryDto,
  ListWebinarsQueryDto,
  PushSubscribeDto,
  StoreRsvpDto,
  ToggleWebinarStatusDto,
  UpdateRsvpStatusDto,
  UpdateWebinarDto,
} from './dto/events.dto';

// ============================================================================
// Public Webinars
// ============================================================================

@ApiTags('Public Webinars')
@Controller('webinars')
export class PublicWebinarsController {
  constructor(private readonly client: MicroserviceClient) {}

  @Public()
  @Get()
  @ResponseMessage('Webinars retrieved successfully')
  @ApiOperation({ summary: 'Public listing of upcoming webinars' })
  index() {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.WEBINAR_PUBLIC_LIST, {});
  }

  @Public()
  @Get('replays')
  @ResponseMessage('Replays retrieved successfully')
  @ApiOperation({ summary: 'List completed webinars with replay URLs' })
  replays() {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.WEBINAR_REPLAYS, {});
  }

  @Public()
  @Get(':slug')
  @ResponseMessage('Webinar retrieved successfully')
  @ApiOperation({ summary: 'Get a single webinar by slug' })
  @ApiResponse({ status: 404 })
  show(@Param('slug') slug: string) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.WEBINAR_FIND_BY_SLUG, { slug });
  }

  @Public()
  @Post(':slug/rsvp')
  @ResponseMessage('RSVP submitted successfully')
  @ApiOperation({
    summary: 'Register for a webinar (public)',
    description: 'Creates a guest subscriber if the email is not a registered portal user.',
  })
  rsvp(@Param('slug') slug: string, @Body() dto: StoreRsvpDto) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.RSVP_CREATE, {
      slug,
      ...dto,
    });
  }

  @Public()
  @Post('push/subscribe')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Push subscription registered')
  @ApiOperation({ summary: 'Register a push subscription for webinar notifications' })
  pushSubscribe(@Body() dto: PushSubscribeDto) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.PUSH_SUBSCRIBE, {
      subscribableType: 'GuestSubscriber',
      subscribableId: 0,
      ...dto,
    });
  }
}

// ============================================================================
// Admin Webinar Management
// ============================================================================

@ApiTags('Admin Webinars')
@ApiBearerAuth()
@Controller('admin/webinars')
export class AdminWebinarsController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_WEBINARS)
  @ResponseMessage('Webinars retrieved successfully')
  @ApiOperation({ summary: 'List all webinars with admin filters' })
  findAll(@Query() query: ListWebinarsQueryDto) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.WEBINAR_FIND_ALL, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_WEBINARS)
  @ResponseMessage('Webinar retrieved successfully')
  @ApiOperation({ summary: 'Get a webinar with its registrations' })
  @ApiResponse({ status: 404 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.WEBINAR_FIND_ONE, { id });
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CREATE_WEBINARS)
  @ResponseMessage('Webinar created successfully')
  @ApiOperation({ summary: 'Schedule a new webinar' })
  create(@Body() dto: CreateWebinarDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.WEBINAR_CREATE, {
      data: dto,
      actorId: actor.id,
    });
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.CREATE_WEBINARS)
  @ResponseMessage('Webinar updated successfully')
  @ApiOperation({ summary: 'Update a webinar' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWebinarDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.WEBINAR_UPDATE, {
      id,
      data: dto,
      actorId: actor.id,
    });
  }

  @Post(':id/toggle-status')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.CREATE_WEBINARS)
  @ResponseMessage('Webinar status updated successfully')
  @ApiOperation({ summary: 'Change webinar status (e.g. go live, complete, cancel)' })
  toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToggleWebinarStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.WEBINAR_TOGGLE_STATUS, {
      id,
      status: dto.status,
      actorId: actor.id,
    });
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CREATE_WEBINARS)
  @ResponseMessage('Webinar deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.WEBINAR_REMOVE, {
      id,
      actorId: actor.id,
    });
  }

  // RSVPs
  @Get(':id/rsvps')
  @RequirePermissions(PERMISSIONS.MANAGE_WEBINAR_RSVPS)
  @ResponseMessage('RSVPs retrieved successfully')
  @ApiOperation({ summary: 'List RSVPs for a webinar' })
  rsvps(@Param('id', ParseIntPipe) id: number, @Query() query: ListRsvpsQueryDto) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.RSVP_FIND_ALL, {
      ...query,
      webinarId: id,
    });
  }

  @Post(':webinarId/rsvps/:id/status')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.MANAGE_WEBINAR_RSVPS)
  @ResponseMessage('RSVP status updated successfully')
  @ApiOperation({ summary: 'Update an RSVP status' })
  updateRsvpStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRsvpStatusDto,
  ) {
    return this.client.send(SERVICE_TOKENS.EVENTS, EVENTS_PATTERNS.RSVP_UPDATE_STATUS, {
      id,
      status: dto.status,
      notes: dto.notes,
    });
  }
}

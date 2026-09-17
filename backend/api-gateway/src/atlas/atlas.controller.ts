import {
  ATLAS_PATTERNS,
  AuthenticatedUser,
  CurrentUser,
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
  CreatePandalDto,
  ListPandalsQueryDto,
  MapBoundsQueryDto,
  ModeratePandalDto,
  UpdatePandalDto,
} from './dto/atlas.dto';

// ============================================================================
// Public Atlas
// ============================================================================

@ApiTags('Public Atlas')
@Controller('atlas')
export class PublicAtlasController {
  constructor(private readonly client: MicroserviceClient) {}

  @Public()
  @Get()
  @ResponseMessage('Public atlas data retrieved successfully')
  @ApiOperation({ summary: 'Public pandal atlas with optional map-bounds filtering' })
  index(@Query() query: MapBoundsQueryDto) {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.PUBLIC_LIST, query);
  }

  @Public()
  @Get('map-data')
  @ResponseMessage('Map data retrieved successfully')
  @ApiOperation({ summary: 'Pandal pins for the map view' })
  mapData(@Query() query: MapBoundsQueryDto) {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.MAP_DATA, query);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Pandal details retrieved successfully')
  @ApiOperation({ summary: 'Public pandal detail view' })
  @ApiResponse({ status: 404 })
  show(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.FIND_ONE, { id });
  }
}

// ============================================================================
// Admin Pandal Atlas
// ============================================================================

@ApiTags('Pandal Atlas (Admin)')
@ApiBearerAuth()
@Controller('admin/pandal-atlas')
export class AdminAtlasController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_PANDAL_ATLAS)
  @ResponseMessage('Pandals retrieved successfully')
  @ApiOperation({ summary: 'List all pandal entries with admin filters' })
  findAll(@Query() query: ListPandalsQueryDto) {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.FIND_ALL, query);
  }

  @Get('stats')
  @RequirePermissions(PERMISSIONS.VIEW_PANDAL_ATLAS)
  @ResponseMessage('Atlas statistics retrieved successfully')
  @ApiOperation({ summary: 'Pandal counts by status' })
  stats() {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.STATS, {});
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_PANDAL_ATLAS)
  @ResponseMessage('Pandal retrieved successfully')
  @ApiOperation({ summary: 'Get pandal details' })
  @ApiResponse({ status: 404 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.FIND_ONE, { id });
  }

  @Post()
  @RequirePermissions(PERMISSIONS.VIEW_PANDAL_ATLAS)
  @ResponseMessage('Pandal created successfully')
  @ApiOperation({ summary: 'Create a new pandal entry (starts as DRAFT)' })
  create(@Body() dto: CreatePandalDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.CREATE, {
      data: dto,
      actorId: actor.id,
    });
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.VIEW_PANDAL_ATLAS)
  @ResponseMessage('Pandal updated successfully')
  @ApiOperation({ summary: 'Update a pandal entry' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePandalDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.UPDATE, {
      id,
      data: dto,
      actorId: actor.id,
    });
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.VIEW_PANDAL_ATLAS)
  @ResponseMessage('Pandal deleted successfully')
  @ApiOperation({ summary: 'Delete a pandal entry' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.REMOVE, {
      id,
      actorId: actor.id,
    });
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.VIEW_PANDAL_ATLAS)
  @ResponseMessage('Pandal submitted for review')
  @ApiOperation({ summary: 'Submit a draft pandal for moderation' })
  submit(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.SUBMIT, {
      id,
      actorId: actor.id,
    });
  }

  @Post(':id/moderate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.MODERATE_PANDAL_ATLAS)
  @ResponseMessage('Pandal moderation action completed')
  @ApiOperation({
    summary: 'Moderate a submitted pandal',
    description: 'Actions: start_review, approve, reject',
  })
  moderate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModeratePandalDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.MODERATE, {
      id,
      decision: dto.decision,
      remarks: dto.remarks,
      actorId: actor.id,
    });
  }
}

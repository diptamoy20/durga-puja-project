import {
  AuthenticatedUser,
  CurrentUser,
  GALLERY_PATTERNS,
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
  CreateAlbumDto,
  CreateMediaDto,
  ListMediaQueryDto,
  ModerateMediaDto,
  SyncAlbumMediaDto,
  UpdateMediaDto,
} from './dto/gallery.dto';

// ============================================================================
// Public Gallery
// ============================================================================

@ApiTags('Public Gallery')
@Controller('gallery')
export class PublicGalleryController {
  constructor(private readonly client: MicroserviceClient) {}

  @Public()
  @Get()
  @ResponseMessage('Gallery items retrieved successfully')
  @ApiOperation({ summary: 'Public gallery listing (approved media only)' })
  index(@Query() query: ListMediaQueryDto) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_PUBLIC_LIST, query);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Gallery item retrieved successfully')
  @ApiOperation({ summary: 'Get a single gallery item' })
  @ApiResponse({ status: 404 })
  show(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_FIND_ONE, { id });
  }
}

// ============================================================================
// Committee Media (committee-member view)
// ============================================================================

@ApiTags('Committee Media')
@ApiBearerAuth()
@Controller('committee/media')
export class CommitteeMediaController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_GALLERY)
  @ResponseMessage('Media retrieved successfully')
  @ApiOperation({ summary: 'List media uploaded by the current committee' })
  index(@Query() query: ListMediaQueryDto) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_MY_UPLOADS, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_GALLERY)
  @ResponseMessage('Media item retrieved successfully')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_FIND_ONE, { id });
  }

  @Post()
  @RequirePermissions(PERMISSIONS.UPLOAD_MEDIA)
  @ResponseMessage('Media uploaded successfully')
  @ApiOperation({ summary: 'Upload new media' })
  create(@Body() dto: CreateMediaDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_CREATE, {
      ...dto,
      uploadedById: actor.id,
    });
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.UPLOAD_MEDIA)
  @ResponseMessage('Media updated successfully')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMediaDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_UPDATE, {
      id,
      data: dto,
      actorId: actor.id,
    });
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.UPLOAD_MEDIA)
  @ResponseMessage('Media deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_REMOVE, {
      id,
      actorId: actor.id,
    });
  }
}

// ============================================================================
// Admin Media Management
// ============================================================================

@ApiTags('Admin Media')
@ApiBearerAuth()
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.MODERATE_MEDIA)
  @ResponseMessage('Media retrieved successfully')
  @ApiOperation({ summary: 'List all committee media (admin view)' })
  findAll(@Query() query: ListMediaQueryDto) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_FIND_ALL, query);
  }

  @Get('moderation-queue')
  @RequirePermissions(PERMISSIONS.MODERATE_MEDIA)
  @ResponseMessage('Moderation queue retrieved successfully')
  @ApiOperation({ summary: 'List pending media awaiting moderation' })
  moderationQueue(@Query() query: ListMediaQueryDto) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_MODERATION_QUEUE, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.MODERATE_MEDIA)
  @ResponseMessage('Media item retrieved successfully')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_FIND_ONE, { id });
  }

  @Post(':id/moderate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.MODERATE_MEDIA)
  @ResponseMessage('Media moderated successfully')
  @ApiOperation({ summary: 'Approve or reject a media item' })
  moderate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModerateMediaDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_MODERATE, {
      id,
      decision: dto.decision,
      rejectionReason: dto.rejectionReason,
      actorId: actor.id,
    });
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MODERATE_MEDIA)
  @ResponseMessage('Media created successfully')
  @ApiOperation({ summary: 'Upload media as admin' })
  create(@Body() dto: CreateMediaDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.MEDIA_CREATE, {
      ...dto,
      uploadedById: actor.id,
    });
  }
}

// ============================================================================
// Albums
// ============================================================================

@ApiTags('Albums')
@ApiBearerAuth()
@Controller('albums')
export class AlbumsController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_ALBUMS)
  @ResponseMessage('Albums retrieved successfully')
  @ApiOperation({ summary: 'List albums' })
  findAll(
    @Query() query: ListMediaQueryDto,
  ) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.ALBUM_FIND_ALL, query);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MANAGE_ALBUMS)
  @ResponseMessage('Album created successfully')
  @ApiOperation({ summary: 'Create an album' })
  create(@Body() dto: CreateAlbumDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.ALBUM_CREATE, {
      data: dto,
      actorId: actor.id,
    });
  }

  @Put(':id/media')
  @RequirePermissions(PERMISSIONS.MANAGE_ALBUMS)
  @ResponseMessage('Album media updated successfully')
  @ApiOperation({
    summary: 'Replace the media items in an album',
    description: 'The supplied list becomes the complete set of media for this album.',
  })
  syncMedia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SyncAlbumMediaDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.GALLERY, GALLERY_PATTERNS.ALBUM_SYNC_MEDIA, {
      id,
      mediaIds: dto.mediaIds,
      actorId: actor.id,
    });
  }
}

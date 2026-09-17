import { GALLERY_PATTERNS } from '@dpgc/shared';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  CreateMediaPayload,
  GalleryService,
  ListMediaPayload,
  ModerateMediaPayload,
} from './gallery.service';

@Controller()
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  @MessagePattern('health.ping')
  ping(): { service: string; status: string } {
    return { service: 'gallery-service', status: 'ok' };
  }

  @MessagePattern(GALLERY_PATTERNS.MEDIA_FIND_ALL)
  findAll(@Payload() query: ListMediaPayload) {
    return this.gallery.findAll(query);
  }

  @MessagePattern(GALLERY_PATTERNS.MEDIA_PUBLIC_LIST)
  publicList(@Payload() query: ListMediaPayload) {
    return this.gallery.publicList(query);
  }

  @MessagePattern(GALLERY_PATTERNS.MEDIA_MY_UPLOADS)
  myUploads(@Payload() query: ListMediaPayload) {
    return this.gallery.findAll(query);
  }

  @MessagePattern(GALLERY_PATTERNS.MEDIA_FIND_ONE)
  findOne(@Payload() payload: { id: number; scopeToCommitteeId?: number }) {
    return this.gallery.findOne(payload);
  }

  @MessagePattern(GALLERY_PATTERNS.MEDIA_CREATE)
  create(@Payload() payload: CreateMediaPayload) {
    return this.gallery.create(payload);
  }

  @MessagePattern(GALLERY_PATTERNS.MEDIA_UPDATE)
  update(
    @Payload()
    payload: {
      id: number;
      data: {
        title?: string;
        description?: string;
        venueName?: string;
        categoryId?: number;
        subcategoryId?: number;
      };
      scopeToCommitteeId?: number;
      actorId: number;
    },
  ) {
    return this.gallery.update(payload);
  }

  @MessagePattern(GALLERY_PATTERNS.MEDIA_REMOVE)
  remove(@Payload() payload: { id: number; scopeToCommitteeId?: number; actorId: number }) {
    return this.gallery.remove(payload);
  }

  @MessagePattern(GALLERY_PATTERNS.MEDIA_MODERATION_QUEUE)
  moderationQueue(@Payload() query: ListMediaPayload) {
    return this.gallery.moderationQueue(query);
  }

  @MessagePattern(GALLERY_PATTERNS.MEDIA_MODERATE)
  moderate(@Payload() payload: ModerateMediaPayload) {
    return this.gallery.moderate(payload);
  }

  @MessagePattern(GALLERY_PATTERNS.ALBUM_FIND_ALL)
  findAllAlbums(
    @Payload()
    query: {
      page: number;
      perPage: number;
      search?: string;
      sortDir: 'asc' | 'desc';
      pujaCommitteeId?: number;
      scopeToCommitteeId?: number;
      publicOnly?: boolean;
    },
  ) {
    return this.gallery.findAllAlbums(query);
  }

  @MessagePattern(GALLERY_PATTERNS.ALBUM_CREATE)
  createAlbum(
    @Payload()
    payload: {
      data: {
        categoryId: number;
        subcategoryId?: number;
        pujaCommitteeId: number;
        title: string;
        description?: string;
        isPublic?: boolean;
      };
      actorId: number;
    },
  ) {
    return this.gallery.createAlbum(payload);
  }

  @MessagePattern(GALLERY_PATTERNS.ALBUM_SYNC_MEDIA)
  syncAlbumMedia(@Payload() payload: { id: number; mediaIds: number[]; actorId: number }) {
    return this.gallery.syncAlbumMedia(payload);
  }
}

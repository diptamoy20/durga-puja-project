import { Module } from '@nestjs/common';

import {
  AdminMediaController,
  AlbumsController,
  CommitteeMediaController,
  PublicGalleryController,
} from './gallery.controller';

@Module({
  controllers: [PublicGalleryController, CommitteeMediaController, AdminMediaController, AlbumsController],
})
export class GalleryModule {}

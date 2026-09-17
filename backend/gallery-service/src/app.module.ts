import { join } from 'node:path';

import { PrismaModule } from '@dpgc/database';
import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';

import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

const galleryConfig = registerAs('gallery', () => ({
  host: process.env.GALLERY_SERVICE_HOST ?? 'localhost',
  port: Number(process.env.GALLERY_SERVICE_PORT ?? 5005),
  uploadDir: process.env.UPLOAD_DIR ?? './storage/uploads',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 25),
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [galleryConfig],
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),
    PrismaModule,
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class AppModule {}

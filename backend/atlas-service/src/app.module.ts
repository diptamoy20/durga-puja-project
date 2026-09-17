import { join } from 'node:path';

import { PrismaModule } from '@dpgc/database';
import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';

import { AtlasController } from './atlas.controller';
import { AtlasService } from './atlas.service';

const atlasConfig = registerAs('atlas', () => ({
  host: process.env.ATLAS_SERVICE_HOST ?? 'localhost',
  port: Number(process.env.ATLAS_SERVICE_PORT ?? 5006),
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [atlasConfig],
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),
    PrismaModule,
  ],
  controllers: [AtlasController],
  providers: [AtlasService],
})
export class AppModule {}

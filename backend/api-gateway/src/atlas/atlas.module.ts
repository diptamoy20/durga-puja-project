import { Module } from '@nestjs/common';

import { AdminAtlasController, PublicAtlasController } from './atlas.controller';

@Module({
  controllers: [PublicAtlasController, AdminAtlasController],
})
export class AtlasModule {}

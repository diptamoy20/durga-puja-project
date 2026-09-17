import { join } from 'node:path';

import { PrismaModule } from '@dpgc/database';
import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';

import { ArticlesService } from './articles/articles.service';
import { ContentController } from './content.controller';
import { TaxonomyService } from './taxonomy/taxonomy.service';

const contentConfig = registerAs('content', () => ({
  host: process.env.CONTENT_SERVICE_HOST ?? 'localhost',
  port: Number(process.env.CONTENT_SERVICE_PORT ?? 5004),
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [contentConfig],
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),
    PrismaModule,
  ],
  controllers: [ContentController],
  providers: [ArticlesService, TaxonomyService],
})
export class AppModule {}

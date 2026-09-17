import { Module } from '@nestjs/common';

import {
  ArticlesController,
  CategoriesController,
  PublicNewsController,
  SubcategoriesController,
} from './content.controller';

@Module({
  controllers: [ArticlesController, PublicNewsController, CategoriesController, SubcategoriesController],
})
export class ContentModule {}

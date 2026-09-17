import { RecordStatus } from '@dpgc/database';
import { CONTENT_PATTERNS } from '@dpgc/shared';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  ArticleData,
  ArticleWorkflowAction,
  ArticlesService,
  ListArticlesPayload,
} from './articles/articles.service';
import { TaxonomyService } from './taxonomy/taxonomy.service';

interface ListQuery {
  page: number;
  perPage: number;
  search?: string;
  sortDir: 'asc' | 'desc';
}

@Controller()
export class ContentController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly taxonomy: TaxonomyService,
  ) {}

  @MessagePattern('health.ping')
  ping(): { service: string; status: string } {
    return { service: 'content-service', status: 'ok' };
  }

  // Articles
  @MessagePattern(CONTENT_PATTERNS.ARTICLE_FIND_ALL)
  findAllArticles(@Payload() query: ListArticlesPayload) {
    return this.articles.findAll(query);
  }

  @MessagePattern(CONTENT_PATTERNS.ARTICLE_PUBLIC_LIST)
  publicArticles(@Payload() query: ListArticlesPayload) {
    return this.articles.publicList(query);
  }

  @MessagePattern(CONTENT_PATTERNS.ARTICLE_STATS)
  articleStats() {
    return this.articles.stats();
  }

  @MessagePattern(CONTENT_PATTERNS.ARTICLE_FIND_ONE)
  findOneArticle(@Payload() payload: { id: number }) {
    return this.articles.findOne(payload.id);
  }

  @MessagePattern(CONTENT_PATTERNS.ARTICLE_FIND_BY_SLUG)
  findArticleBySlug(@Payload() payload: { slug: string }) {
    return this.articles.findBySlug(payload.slug);
  }

  @MessagePattern(CONTENT_PATTERNS.ARTICLE_CREATE)
  createArticle(@Payload() payload: { data: ArticleData; actorId: number }) {
    return this.articles.create(payload);
  }

  @MessagePattern(CONTENT_PATTERNS.ARTICLE_UPDATE)
  updateArticle(@Payload() payload: { id: number; data: Partial<ArticleData>; actorId: number }) {
    return this.articles.update(payload);
  }

  @MessagePattern(CONTENT_PATTERNS.ARTICLE_REMOVE)
  removeArticle(@Payload() payload: { id: number; actorId: number }) {
    return this.articles.remove(payload);
  }

  @MessagePattern(CONTENT_PATTERNS.ARTICLE_WORKFLOW)
  workflow(
    @Payload()
    payload: {
      id: number;
      action: ArticleWorkflowAction;
      comment?: string;
      scheduledAt?: string;
      actorId: number;
    },
  ) {
    return this.articles.workflow(payload);
  }

  // Taxonomy
  @MessagePattern(CONTENT_PATTERNS.CATEGORY_FIND_ALL)
  findAllCategories(@Payload() query: ListQuery) {
    return this.taxonomy.findAllCategories(query);
  }

  @MessagePattern(CONTENT_PATTERNS.CATEGORY_FIND_ONE)
  findOneCategory(@Payload() payload: { id: number }) {
    return this.taxonomy.findOneCategory(payload.id);
  }

  @MessagePattern(CONTENT_PATTERNS.CATEGORY_CREATE)
  createCategory(@Payload() payload: { data: { name: string; description?: string } }) {
    return this.taxonomy.createCategory(payload);
  }

  @MessagePattern(CONTENT_PATTERNS.CATEGORY_UPDATE)
  updateCategory(
    @Payload()
    payload: { id: number; data: { name?: string; description?: string; status?: RecordStatus } },
  ) {
    return this.taxonomy.updateCategory(payload);
  }

  @MessagePattern(CONTENT_PATTERNS.CATEGORY_REMOVE)
  removeCategory(@Payload() payload: { id: number }) {
    return this.taxonomy.removeCategory(payload);
  }

  @MessagePattern(CONTENT_PATTERNS.SUBCATEGORY_FIND_ALL)
  findAllSubcategories(@Payload() payload: { categoryId?: number }) {
    return this.taxonomy.findAllSubcategories(payload);
  }

  @MessagePattern(CONTENT_PATTERNS.SUBCATEGORY_CREATE)
  createSubcategory(
    @Payload() payload: { data: { categoryId: number; name: string; description?: string } },
  ) {
    return this.taxonomy.createSubcategory(payload);
  }

  @MessagePattern(CONTENT_PATTERNS.SUBCATEGORY_UPDATE)
  updateSubcategory(
    @Payload()
    payload: { id: number; data: { name?: string; description?: string; status?: RecordStatus } },
  ) {
    return this.taxonomy.updateSubcategory(payload);
  }

  @MessagePattern(CONTENT_PATTERNS.SUBCATEGORY_REMOVE)
  removeSubcategory(@Payload() payload: { id: number }) {
    return this.taxonomy.removeSubcategory(payload);
  }
}

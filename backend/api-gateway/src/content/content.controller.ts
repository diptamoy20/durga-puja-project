import {
  AuthenticatedUser,
  CONTENT_PATTERNS,
  CurrentUser,
  PERMISSIONS,
  PaginationQueryDto,
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
  ArticleWorkflowDto,
  CreateArticleDto,
  CreateCategoryDto,
  CreateSubcategoryDto,
  ListArticlesQueryDto,
  UpdateArticleDto,
  UpdateCategoryDto,
  UpdateSubcategoryDto,
} from './dto/content.dto';

// ============================================================================
// Articles
// ============================================================================

@ApiTags('Articles')
@ApiBearerAuth()
@Controller('articles')
export class ArticlesController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_ARTICLES)
  @ResponseMessage('Articles retrieved successfully')
  @ApiOperation({ summary: 'List articles with pagination and filters' })
  findAll(@Query() query: ListArticlesQueryDto) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.ARTICLE_FIND_ALL, query);
  }

  @Get('stats')
  @RequirePermissions(PERMISSIONS.VIEW_ARTICLES)
  @ResponseMessage('Article statistics retrieved successfully')
  @ApiOperation({ summary: 'Article counts by status' })
  stats() {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.ARTICLE_STATS, {});
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_ARTICLES)
  @ResponseMessage('Article retrieved successfully')
  @ApiOperation({ summary: 'Get a single article with its history' })
  @ApiResponse({ status: 404 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.ARTICLE_FIND_ONE, { id });
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CREATE_ARTICLES)
  @ResponseMessage('Article created successfully')
  @ApiOperation({ summary: 'Create a new article (starts as DRAFT)' })
  create(@Body() dto: CreateArticleDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.ARTICLE_CREATE, {
      data: dto,
      actorId: actor.id,
    });
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.EDIT_ARTICLES)
  @ResponseMessage('Article updated successfully')
  @ApiOperation({ summary: 'Update an article' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.ARTICLE_UPDATE, {
      id,
      data: dto,
      actorId: actor.id,
    });
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.EDIT_ARTICLES)
  @ResponseMessage('Article deleted successfully')
  @ApiOperation({ summary: 'Soft-delete an article' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.ARTICLE_REMOVE, {
      id,
      actorId: actor.id,
    });
  }

  @Post(':id/workflow')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.REVIEW_ARTICLES)
  @ResponseMessage('Article workflow action completed')
  @ApiOperation({
    summary: 'Perform a workflow action on an article',
    description: 'Actions: submit_for_review, start_review, approve, reject, schedule, publish, archive',
  })
  workflow(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ArticleWorkflowDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.ARTICLE_WORKFLOW, {
      id,
      action: dto.action,
      comment: dto.comment,
      scheduledAt: dto.scheduledAt,
      actorId: actor.id,
    });
  }
}

// ============================================================================
// Public article (news) view
// ============================================================================

@ApiTags('Public Content')
@Controller('news')
export class PublicNewsController {
  constructor(private readonly client: MicroserviceClient) {}

  @Public()
  @Get(':slug')
  @ResponseMessage('Article retrieved successfully')
  @ApiOperation({ summary: 'Get a published article by slug' })
  @ApiResponse({ status: 404 })
  findBySlug(@Param('slug') slug: string) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.ARTICLE_FIND_BY_SLUG, { slug });
  }
}

// ============================================================================
// Categories
// ============================================================================

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_CATEGORIES)
  @ResponseMessage('Categories retrieved successfully')
  @ApiOperation({ summary: 'List categories with pagination' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.CATEGORY_FIND_ALL, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VIEW_CATEGORIES)
  @ResponseMessage('Category retrieved successfully')
  @ApiOperation({ summary: 'Get a category with its subcategories' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.CATEGORY_FIND_ONE, { id });
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MANAGE_CATEGORIES)
  @ResponseMessage('Category created successfully')
  @ApiOperation({ summary: 'Create a category' })
  create(@Body() dto: CreateCategoryDto) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.CATEGORY_CREATE, { data: dto });
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.MANAGE_CATEGORIES)
  @ResponseMessage('Category updated successfully')
  @ApiOperation({ summary: 'Update a category' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.CATEGORY_UPDATE, {
      id,
      data: dto,
    });
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.MANAGE_CATEGORIES)
  @ResponseMessage('Category deleted successfully')
  @ApiOperation({ summary: 'Delete a category' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.CATEGORY_REMOVE, { id });
  }
}

// ============================================================================
// Subcategories
// ============================================================================

@ApiTags('Subcategories')
@ApiBearerAuth()
@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly client: MicroserviceClient) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_CATEGORIES)
  @ResponseMessage('Subcategories retrieved successfully')
  @ApiOperation({ summary: 'List subcategories, optionally filtered by category' })
  findAll(@Query('categoryId') categoryId?: number) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.SUBCATEGORY_FIND_ALL, {
      categoryId: categoryId ? Number(categoryId) : undefined,
    });
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MANAGE_CATEGORIES)
  @ResponseMessage('Subcategory created successfully')
  @ApiOperation({ summary: 'Create a subcategory' })
  create(@Body() dto: CreateSubcategoryDto) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.SUBCATEGORY_CREATE, { data: dto });
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.MANAGE_CATEGORIES)
  @ResponseMessage('Subcategory updated successfully')
  @ApiOperation({ summary: 'Update a subcategory' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubcategoryDto) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.SUBCATEGORY_UPDATE, {
      id,
      data: dto,
    });
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.MANAGE_CATEGORIES)
  @ResponseMessage('Subcategory deleted successfully')
  @ApiOperation({ summary: 'Delete a subcategory' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.SUBCATEGORY_REMOVE, { id });
  }
}

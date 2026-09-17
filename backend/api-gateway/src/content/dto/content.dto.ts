import { PaginationQueryDto } from '@dpgc/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export enum ArticleStatusDto {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

const ARTICLE_SORTABLE = ['createdAt', 'title', 'status', 'publishedAt'] as const;

export class ListArticlesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ARTICLE_SORTABLE, default: 'createdAt' })
  @IsIn(ARTICLE_SORTABLE as unknown as string[]) @IsOptional()
  sortBy: (typeof ARTICLE_SORTABLE)[number] = 'createdAt';

  @ApiPropertyOptional({ enum: ArticleStatusDto })
  @IsEnum(ArticleStatusDto) @IsOptional()
  status?: ArticleStatusDto;

  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional()
  subcategoryId?: number;
}

export class CreateArticleDto {
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(220)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @ApiProperty() @Type(() => Number) @IsInt()
  subcategoryId: number;

  @ApiPropertyOptional() @IsString() @IsOptional()
  excerpt?: string;

  @ApiProperty() @IsString() @MinLength(10)
  content: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500)
  featuredImage?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) seoTitle?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() seoDescription?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) seoKeywords?: string;

  @ApiPropertyOptional() @IsBoolean() @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  isFeatured?: boolean;

  @ApiPropertyOptional() @IsBoolean() @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  allowComments?: boolean;
}

export class UpdateArticleDto {
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(220)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title?: string;

  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional()
  subcategoryId?: number;

  @ApiPropertyOptional() @IsString() @IsOptional() excerpt?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() content?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) featuredImage?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) seoTitle?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() seoDescription?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) seoKeywords?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  isFeatured?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  allowComments?: boolean;
}

export type ArticleWorkflowActionDto =
  | 'submit_for_review'
  | 'start_review'
  | 'approve'
  | 'reject'
  | 'schedule'
  | 'publish'
  | 'archive';

export class ArticleWorkflowDto {
  @ApiProperty({
    enum: ['submit_for_review', 'start_review', 'approve', 'reject', 'schedule', 'publish', 'archive'],
  })
  @IsString()
  @IsIn(['submit_for_review', 'start_review', 'approve', 'reject', 'schedule', 'publish', 'archive'])
  action: ArticleWorkflowActionDto;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional({ description: 'Required when action is "schedule".' })
  @IsDateString() @IsOptional()
  scheduledAt?: string;
}

// ---------------------------------------------------------------------------
// Categories / Subcategories
// ---------------------------------------------------------------------------

export class CreateCategoryDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500)
  description?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional() @IsString() @IsOptional() @MinLength(2) @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) description?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsIn(['ACTIVE', 'INACTIVE']) @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}

export class CreateSubcategoryDto {
  @ApiProperty() @Type(() => Number) @IsInt()
  categoryId: number;

  @ApiProperty() @IsString() @MinLength(2) @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500)
  description?: string;
}

export class UpdateSubcategoryDto {
  @ApiPropertyOptional() @IsString() @IsOptional() @MinLength(2) @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) description?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsIn(['ACTIVE', 'INACTIVE']) @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}

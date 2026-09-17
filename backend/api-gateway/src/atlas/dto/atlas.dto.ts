import { PaginationQueryDto } from '@dpgc/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDecimal,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum AtlasStatusDto {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

const ATLAS_SORTABLE = ['createdAt', 'name', 'status'] as const;

export class ListPandalsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ATLAS_SORTABLE, default: 'createdAt' })
  @IsIn(ATLAS_SORTABLE as unknown as string[]) @IsOptional()
  sortBy: (typeof ATLAS_SORTABLE)[number] = 'createdAt';

  @ApiPropertyOptional({ enum: AtlasStatusDto })
  @IsEnum(AtlasStatusDto) @IsOptional()
  status?: AtlasStatusDto;

  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional()
  pujaCommitteeId?: number;
}

export class CreatePandalDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty() @IsString() location: string;

  @ApiProperty({ example: 22.5726 })
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 7 })
  latitude: number;

  @ApiProperty({ example: 88.3639 })
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 7 })
  longitude: number;

  @ApiProperty() @Type(() => Number) @IsInt()
  pujaCommitteeId: number;

  @ApiPropertyOptional() photos?: unknown;

  @ApiProperty() @IsString() @MaxLength(255) timing: string;
  @ApiProperty() @IsString() @MaxLength(255) specialFeatures: string;
  @ApiPropertyOptional() @IsString() @IsOptional() history?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) artisan?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) theme?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) pujaType?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(30) footfall?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(20) contactPhone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(180) contactEmail?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) website?: string;
}

export class UpdatePandalDto {
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() location?: string;
  @ApiPropertyOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 7 }) @IsOptional() latitude?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 7 }) @IsOptional() longitude?: number;
  @ApiPropertyOptional() photos?: unknown;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) timing?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) specialFeatures?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() history?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) artisan?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) theme?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) pujaType?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(30) footfall?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(20) contactPhone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(180) contactEmail?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) website?: string;
}

export class ModeratePandalDto {
  @ApiProperty({ enum: ['start_review', 'approve', 'reject'] })
  @IsIn(['start_review', 'approve', 'reject'])
  decision: 'start_review' | 'approve' | 'reject';

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(2000)
  remarks?: string;
}

export class MapBoundsQueryDto {
  @ApiPropertyOptional() @Type(() => Number) @IsNumber() @IsOptional() north?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsNumber() @IsOptional() south?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsNumber() @IsOptional() east?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsNumber() @IsOptional() west?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() limit?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
}

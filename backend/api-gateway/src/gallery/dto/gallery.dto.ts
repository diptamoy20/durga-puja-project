import { PaginationQueryDto } from '@dpgc/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// ---------------------------------------------------------------------------
// Committee Media
// ---------------------------------------------------------------------------

export enum MediaTypeDto {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
}

export enum MediaModerationStatusDto {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

const MEDIA_SORTABLE = ['createdAt', 'title', 'mediaType', 'status'] as const;

export class ListMediaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: MEDIA_SORTABLE, default: 'createdAt' })
  @IsIn(MEDIA_SORTABLE as unknown as string[]) @IsOptional()
  sortBy: (typeof MEDIA_SORTABLE)[number] = 'createdAt';

  @ApiPropertyOptional({ enum: MediaModerationStatusDto })
  @IsEnum(MediaModerationStatusDto) @IsOptional()
  status?: MediaModerationStatusDto;

  @ApiPropertyOptional({ enum: MediaTypeDto })
  @IsEnum(MediaTypeDto) @IsOptional()
  mediaType?: MediaTypeDto;

  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional()
  pujaCommitteeId?: number;

  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional()
  subcategoryId?: number;
}

export class CreateMediaDto {
  @ApiProperty({ enum: MediaTypeDto })
  @IsEnum(MediaTypeDto)
  mediaType: MediaTypeDto;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) title?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) venueName?: string;

  @ApiProperty() @Type(() => Number) @IsInt()
  pujaCommitteeId: number;

  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() categoryId?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() subcategoryId?: number;

  // File metadata (normally from multer, but accepted as fields for now)
  @ApiProperty() @IsString() originalFilename: string;
  @ApiProperty() @IsString() storedPath: string;
  @ApiPropertyOptional() @IsString() @IsOptional() thumbnailPath?: string;
  @ApiProperty() @IsString() mimeType: string;
  @ApiProperty() @Type(() => Number) @IsInt() fileSize: number;
}

export class UpdateMediaDto {
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) title?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) venueName?: string;
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() categoryId?: number;
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() subcategoryId?: number;
}

export class ModerateMediaDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(2000)
  rejectionReason?: string;
}

// ---------------------------------------------------------------------------
// Albums
// ---------------------------------------------------------------------------

export class CreateAlbumDto {
  @ApiProperty() @Type(() => Number) @IsInt() categoryId: number;
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() subcategoryId?: number;
  @ApiProperty() @Type(() => Number) @IsInt() pujaCommitteeId: number;

  @ApiProperty() @IsString() @MinLength(2) @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(2000) description?: string;

  @ApiPropertyOptional() @IsBoolean() @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  isPublic?: boolean;
}

export class SyncAlbumMediaDto {
  @ApiProperty({ type: [Number], description: 'Committee media ids to include in this album.' })
  @IsArray() @Type(() => Number) @IsInt({ each: true })
  mediaIds: number[];
}

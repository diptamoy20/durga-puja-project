import { PaginationQueryDto } from '@dpgc/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// ---------------------------------------------------------------------------
// Webinars
// ---------------------------------------------------------------------------

export enum WebinarStatusDto {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RsvpStatusDto {
  REGISTERED = 'REGISTERED',
  CONFIRMED = 'CONFIRMED',
  ATTENDED = 'ATTENDED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

const WEBINAR_SORTABLE = ['createdAt', 'title', 'scheduledAt', 'status'] as const;

export class ListWebinarsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: WEBINAR_SORTABLE, default: 'createdAt' })
  @IsIn(WEBINAR_SORTABLE as unknown as string[]) @IsOptional()
  sortBy: (typeof WEBINAR_SORTABLE)[number] = 'createdAt';

  @ApiPropertyOptional({ enum: WebinarStatusDto })
  @IsEnum(WebinarStatusDto) @IsOptional()
  status?: WebinarStatusDto;
}

export class CreateWebinarDto {
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @ApiPropertyOptional() @IsString() @IsOptional()
  description?: string;

  @ApiProperty() @IsDateString()
  scheduledAt: string;

  @ApiProperty() @IsString() @MaxLength(10)
  duration: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) meetingLink?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) speaker?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() speakerBio?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) bannerImage?: string;
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() maxAttendees?: number;
}

export class UpdateWebinarDto {
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() scheduledAt?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(10) duration?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) meetingLink?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) speaker?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() speakerBio?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) bannerImage?: string;
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() maxAttendees?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) replayUrl?: string;
}

export class ToggleWebinarStatusDto {
  @ApiProperty({ enum: WebinarStatusDto })
  @IsEnum(WebinarStatusDto)
  status: WebinarStatusDto;
}

export class StoreRsvpDto {
  @ApiProperty() @IsString() @MaxLength(200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Enter a valid email address.' }) @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(25) phone?: string;
}

export class UpdateRsvpStatusDto {
  @ApiProperty({ enum: RsvpStatusDto })
  @IsEnum(RsvpStatusDto)
  status: RsvpStatusDto;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) notes?: string;
}

export class ListRsvpsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional()
  webinarId?: number;

  @ApiPropertyOptional({ enum: RsvpStatusDto })
  @IsEnum(RsvpStatusDto) @IsOptional()
  status?: RsvpStatusDto;
}

export class PushSubscribeDto {
  @ApiProperty() @IsString() endpoint: string;
  @ApiPropertyOptional() @IsString() @IsOptional() publicKey?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() authToken?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() contentEncoding?: string;
}

import { PaginationQueryDto } from '@dpgc/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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
// Diaspora
// ---------------------------------------------------------------------------

export class SubmitDiasporaDto {
  @ApiProperty({ example: 'Subhash Chandra Bose' })
  @IsString() @MinLength(2) @MaxLength(200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  dob: string;

  @ApiProperty({ example: 'Male' })
  @IsString() @MaxLength(30)
  gender: string;

  @ApiProperty({ example: 'subhash@example.com' })
  @IsEmail({}, { message: 'Enter a valid email address.' }) @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString() @MaxLength(25)
  mobile: string;

  @ApiProperty({ example: 'United Kingdom' })
  @IsString() @MaxLength(100)
  country: string;

  @ApiProperty({ example: 'London' })
  @IsString() @MaxLength(100)
  city: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100)
  passportNo?: string;

  @ApiProperty({ example: 'Indian' })
  @IsString() @MaxLength(100)
  nationality: string;

  @ApiProperty({ example: '12 Baker Street' })
  @IsString() @MaxLength(255)
  address1: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255)
  address2?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100)
  state?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ example: 'Kolkata' })
  @IsString() @MaxLength(100)
  districtOrigin: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100)
  village?: string;

  @ApiProperty({ example: 'Born in Bengal' })
  @IsString() @MaxLength(100)
  relationshipWithBengal: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255)
  languages?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray() @IsString({ each: true }) @IsOptional()
  interests?: string[];

  @ApiPropertyOptional() @IsBoolean() @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  volunteer?: boolean;

  @ApiPropertyOptional() @IsBoolean() @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  receiveUpdates?: boolean;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  termsAccepted: boolean;
}

export enum DiasporaStatusDto {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export class ListDiasporaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DiasporaStatusDto })
  @IsEnum(DiasporaStatusDto) @IsOptional()
  status?: DiasporaStatusDto;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100)
  country?: string;
}

export class DecideDiasporaDto {
  @ApiPropertyOptional({ description: 'Required when rejecting.' })
  @IsString() @IsOptional() @MaxLength(2000)
  reason?: string;
}

// ---------------------------------------------------------------------------
// Committees
// ---------------------------------------------------------------------------

export class SubmitCommitteeDto {
  @ApiProperty()
  @IsString() @MinLength(2) @MaxLength(200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  committeeName: string;

  @ApiProperty({ example: 1920 })
  @Type(() => Number) @IsInt()
  establishedYear: number;

  @ApiProperty({ example: 'Sarbojanin' })
  @IsString() @MaxLength(60)
  pujaType: string;

  @ApiProperty({ example: 'Traditional' })
  @IsString() @MaxLength(100)
  pujaCategory: string;

  @ApiProperty()
  @IsString() @MinLength(10)
  committeeDescription: string;

  @ApiProperty() @IsString() @MaxLength(200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  contactPersonName: string;

  @ApiProperty() @IsString() @MaxLength(100)
  designation: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Enter a valid email address.' }) @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty() @IsString() @MaxLength(25)
  mobile: string;

  @ApiProperty() @IsString() @MaxLength(100) country: string;
  @ApiProperty() @IsString() @MaxLength(100) state: string;
  @ApiProperty() @IsString() @MaxLength(100) city: string;
  @ApiProperty() @IsString() @MaxLength(20) postalCode: string;
  @ApiProperty() @IsString() @MaxLength(180) venueName: string;
  @ApiProperty() @IsString() @MaxLength(255) venueAddress: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) landmark?: string;
  @ApiProperty() @IsString() address: string;

  @ApiProperty({ description: 'File path for the registration certificate.' })
  @IsString()
  registrationCertificate: string;

  @ApiProperty({ description: 'File path for the address proof.' })
  @IsString()
  addressProof: string;

  @ApiProperty({ description: 'File path for the pandal image.' })
  @IsString()
  pandalImage: string;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  declaration: boolean;
}

export enum CommitteeStatusDto {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

const COMMITTEE_SORTABLE = ['createdAt', 'committeeName', 'status'] as const;

export class ListCommitteesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: COMMITTEE_SORTABLE, default: 'createdAt' })
  @IsIn(COMMITTEE_SORTABLE as unknown as string[]) @IsOptional()
  sortBy: (typeof COMMITTEE_SORTABLE)[number] = 'createdAt';

  @ApiPropertyOptional({ enum: CommitteeStatusDto })
  @IsEnum(CommitteeStatusDto) @IsOptional()
  status?: CommitteeStatusDto;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100)
  city?: string;
}

export class ChangeCommitteeStatusDto {
  @ApiProperty({ enum: CommitteeStatusDto })
  @IsEnum(CommitteeStatusDto)
  status: CommitteeStatusDto;

  @ApiPropertyOptional({ description: 'Required when rejecting.' })
  @IsString() @IsOptional() @MaxLength(2000)
  reason?: string;
}

export class UpdateCommitteeDto {
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  committeeName?: string;

  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional()
  establishedYear?: number;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(60) pujaType?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) pujaCategory?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() committeeDescription?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  contactPersonName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) designation?: string;
  @ApiPropertyOptional()
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @IsOptional() @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(25) mobile?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) country?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) state?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) city?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(20) postalCode?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(180) venueName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) venueAddress?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(255) landmark?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() address?: string;
}

export class BulkCommitteeActionDto {
  @ApiProperty({ type: [Number] })
  @IsArray() @Type(() => Number) @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ enum: CommitteeStatusDto })
  @IsEnum(CommitteeStatusDto)
  action: CommitteeStatusDto;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(2000)
  reason?: string;
}

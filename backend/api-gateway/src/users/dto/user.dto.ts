import { PaginationQueryDto } from '@dpgc/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum UserStatusDto {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

const SORTABLE = ['createdAt', 'name', 'email', 'status', 'lastLoginAt'] as const;

export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SORTABLE, default: 'createdAt' })
  @IsIn(SORTABLE as unknown as string[])
  @IsOptional()
  sortBy: (typeof SORTABLE)[number] = 'createdAt';

  @ApiPropertyOptional({ enum: UserStatusDto })
  @IsEnum(UserStatusDto)
  @IsOptional()
  status?: UserStatusDto;

  @ApiPropertyOptional({ description: 'Filter by role id.' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  roleId?: number;

  @ApiPropertyOptional({ description: 'Filter by department id.' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  departmentId?: number;
}

export class CreateUserDto {
  @ApiProperty({ example: 'Ananya' })
  @IsString()
  @MinLength(1, { message: 'First name is required.' })
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName: string;

  @ApiProperty({ example: 'Sen' })
  @IsString()
  @MinLength(1, { message: 'Last name is required.' })
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName: string;

  @ApiProperty({ example: 'ananya.sen@durgapujaglobalconnect.in' })
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiPropertyOptional({
    description:
      'Omit to have a secure password generated and stored for the administrator to pass on.',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72)
  @Matches(/[a-z]/, { message: 'Password must contain a lowercase letter.' })
  @Matches(/[A-Z]/, { message: 'Password must contain an uppercase letter.' })
  @Matches(/[0-9]/, { message: 'Password must contain a number.' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(25) phone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) username?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(50) employeeId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) country?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) state?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) city?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) address?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({ enum: UserStatusDto, default: UserStatusDto.ACTIVE })
  @IsEnum(UserStatusDto)
  @IsOptional()
  status?: UserStatusDto;

  @ApiPropertyOptional({ type: [Number], description: 'Role ids to assign.' })
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @IsOptional()
  roleIds?: number[];
}

/**
 * Update accepts the same fields as create, all optional, minus the password
 * (changed through the dedicated reset endpoint so it is always audited).
 */
export class UpdateUserDto {
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName?: string;

  @ApiPropertyOptional()
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(180)
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(25) phone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) username?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(50) employeeId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) country?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) state?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(100) city?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(500) address?: string;

  @ApiPropertyOptional() @Type(() => Number) @IsInt() @IsOptional() departmentId?: number;

  @ApiPropertyOptional({ enum: UserStatusDto })
  @IsEnum(UserStatusDto)
  @IsOptional()
  status?: UserStatusDto;

  @ApiPropertyOptional({ type: [Number] })
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @IsOptional()
  roleIds?: number[];
}

export class AssignRolesDto {
  @ApiProperty({ type: [Number], description: 'The complete set of role ids for this user.' })
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  roleIds: number[];
}

export class BulkUserIdsDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Select at least one user.' })
  @Type(() => Number)
  @IsInt({ each: true })
  ids: number[];
}

export class BulkStatusDto extends BulkUserIdsDto {
  @ApiProperty({ enum: UserStatusDto })
  @IsEnum(UserStatusDto)
  status: UserStatusDto;
}

export class ResetUserPasswordDto {
  @ApiPropertyOptional({
    description: 'Omit to generate a secure password automatically.',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72)
  @Matches(/[a-z]/, { message: 'Password must contain a lowercase letter.' })
  @Matches(/[A-Z]/, { message: 'Password must contain an uppercase letter.' })
  @Matches(/[0-9]/, { message: 'Password must contain a number.' })
  @IsOptional()
  password?: string;
}

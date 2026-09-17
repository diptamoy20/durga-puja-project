import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Self-service registration. Accounts created this way land in PENDING status
 * and receive the Guest User role until an administrator promotes them, which
 * matches how the Laravel app treated Breeze registrations.
 */
export class RegisterDto {
  @IsString()
  @MinLength(1, { message: 'First name is required.' })
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName: string;

  @IsString()
  @MinLength(1, { message: 'Last name is required.' })
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName: string;

  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72, { message: 'Password must be at most 72 characters.' })
  @Matches(/[a-z]/, { message: 'Password must contain a lowercase letter.' })
  @Matches(/[A-Z]/, { message: 'Password must contain an uppercase letter.' })
  @Matches(/[0-9]/, { message: 'Password must contain a number.' })
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(25)
  phone?: string;
}

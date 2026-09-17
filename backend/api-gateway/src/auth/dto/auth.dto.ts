import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PASSWORD_RULES = {
  lower: { pattern: /[a-z]/, message: 'Password must contain a lowercase letter.' },
  upper: { pattern: /[A-Z]/, message: 'Password must contain an uppercase letter.' },
  digit: { pattern: /[0-9]/, message: 'Password must contain a number.' },
};

export class LoginRequestDto {
  @ApiProperty({ example: 'admin@durgapujaglobalconnect.in' })
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 1 })
  @IsString({ message: 'Password is required.' })
  @MinLength(1, { message: 'Password is required.' })
  @MaxLength(72)
  password: string;

  @ApiPropertyOptional({ description: 'Issue a longer-lived session.', default: false })
  @IsBoolean()
  @IsOptional()
  remember?: boolean;
}

export class RegisterRequestDto {
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

  @ApiProperty({ example: 'ananya.sen@example.com' })
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'At least 8 characters with upper case, lower case and a digit.',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72)
  @Matches(PASSWORD_RULES.lower.pattern, { message: PASSWORD_RULES.lower.message })
  @Matches(PASSWORD_RULES.upper.pattern, { message: PASSWORD_RULES.upper.message })
  @Matches(PASSWORD_RULES.digit.pattern, { message: PASSWORD_RULES.digit.message })
  password: string;

  @ApiPropertyOptional({ example: '+91 98300 00000' })
  @IsString()
  @IsOptional()
  @MaxLength(25)
  phone?: string;
}

export class RefreshRequestDto {
  @ApiProperty({ description: 'The refresh token issued at login.' })
  @IsString({ message: 'A refresh token is required.' })
  refreshToken: string;
}

export class ChangePasswordRequestDto {
  @ApiProperty()
  @IsString({ message: 'Your current password is required.' })
  @MaxLength(72)
  currentPassword: string;

  @ApiProperty({ description: 'At least 8 characters with upper case, lower case and a digit.' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72)
  @Matches(PASSWORD_RULES.lower.pattern, { message: PASSWORD_RULES.lower.message })
  @Matches(PASSWORD_RULES.upper.pattern, { message: PASSWORD_RULES.upper.message })
  @Matches(PASSWORD_RULES.digit.pattern, { message: PASSWORD_RULES.digit.message })
  newPassword: string;
}

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'admin@durgapujaglobalconnect.in' })
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty({ description: 'The token from the password reset email.' })
  @IsString({ message: 'The reset token is required.' })
  @MaxLength(128)
  token: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ description: 'At least 8 characters with upper case, lower case and a digit.' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72)
  @Matches(PASSWORD_RULES.lower.pattern, { message: PASSWORD_RULES.lower.message })
  @Matches(PASSWORD_RULES.upper.pattern, { message: PASSWORD_RULES.upper.message })
  @Matches(PASSWORD_RULES.digit.pattern, { message: PASSWORD_RULES.digit.message })
  password: string;
}

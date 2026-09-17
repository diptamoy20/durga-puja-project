import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const STRONG_PASSWORD = [
  { pattern: /[a-z]/, message: 'Password must contain a lowercase letter.' },
  { pattern: /[A-Z]/, message: 'Password must contain an uppercase letter.' },
  { pattern: /[0-9]/, message: 'Password must contain a number.' },
] as const;

export class ChangePasswordDto {
  @IsInt()
  userId: number;

  @IsString({ message: 'Your current password is required.' })
  @MaxLength(72)
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72)
  @Matches(STRONG_PASSWORD[0].pattern, { message: STRONG_PASSWORD[0].message })
  @Matches(STRONG_PASSWORD[1].pattern, { message: STRONG_PASSWORD[1].message })
  @Matches(STRONG_PASSWORD[2].pattern, { message: STRONG_PASSWORD[2].message })
  newPassword: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'The reset token is required.' })
  @MaxLength(128)
  token: string;

  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72)
  @Matches(STRONG_PASSWORD[0].pattern, { message: STRONG_PASSWORD[0].message })
  @Matches(STRONG_PASSWORD[1].pattern, { message: STRONG_PASSWORD[1].message })
  @Matches(STRONG_PASSWORD[2].pattern, { message: STRONG_PASSWORD[2].message })
  password: string;
}

export class RefreshTokenDto {
  @IsString({ message: 'A refresh token is required.' })
  refreshToken: string;
}

export class LogoutDto {
  @IsString({ message: 'A refresh token is required.' })
  refreshToken: string;
}

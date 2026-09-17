import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsString({ message: 'Password is required.' })
  @MinLength(1, { message: 'Password is required.' })
  @MaxLength(72)
  password: string;

  @IsBoolean()
  @IsOptional()
  remember?: boolean;
}

/** Request metadata captured for the refresh token audit trail. */
export class LoginContextDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  userAgent?: string;

  @IsString()
  @IsOptional()
  @MaxLength(45)
  ipAddress?: string;
}

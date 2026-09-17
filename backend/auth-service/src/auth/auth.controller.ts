import { AUTH_PATTERNS, AuthTokens, JwtPayload } from '@dpgc/shared';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { LoginContextDto, LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResultEntity, AuthUserEntity } from './entities/auth-user.entity';
import { AuthService } from './auth.service';

/**
 * TCP message handlers. There are no HTTP routes here — the gateway owns the
 * REST surface and this service is unreachable from the browser.
 *
 * Controllers stay thin: they unpack the payload and delegate. All business
 * rules live in AuthService.
 */
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Answers the gateway's readiness probe; every service handles this. */
  @MessagePattern('health.ping')
  ping(): { service: string; status: string } {
    return { service: 'auth-service', status: 'ok' };
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  login(
    @Payload() payload: { credentials: LoginDto; context?: LoginContextDto },
  ): Promise<AuthResultEntity> {
    return this.authService.login(payload.credentials, payload.context ?? {});
  }

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() dto: RegisterDto): Promise<AuthUserEntity> {
    return this.authService.register(dto);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH)
  refresh(
    @Payload() payload: { refreshToken: string; context?: LoginContextDto },
  ): Promise<AuthTokens> {
    return this.authService.refresh(payload.refreshToken, payload.context ?? {});
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  logout(@Payload() payload: { refreshToken: string }): Promise<{ revoked: true }> {
    return this.authService.logout(payload.refreshToken);
  }

  @MessagePattern(AUTH_PATTERNS.ME)
  me(@Payload() payload: { userId: number }): Promise<AuthUserEntity> {
    return this.authService.me(payload.userId);
  }

  @MessagePattern(AUTH_PATTERNS.VALIDATE_TOKEN)
  validateToken(@Payload() payload: { token: string }): Promise<JwtPayload> {
    return this.authService.validateToken(payload.token);
  }

  @MessagePattern(AUTH_PATTERNS.CHANGE_PASSWORD)
  changePassword(@Payload() dto: ChangePasswordDto): Promise<{ changed: true }> {
    return this.authService.changePassword(dto);
  }

  @MessagePattern(AUTH_PATTERNS.FORGOT_PASSWORD)
  forgotPassword(@Payload() dto: ForgotPasswordDto): Promise<{ sent: true; token?: string }> {
    return this.authService.forgotPassword(dto);
  }

  @MessagePattern(AUTH_PATTERNS.RESET_PASSWORD)
  resetPassword(@Payload() dto: ResetPasswordDto): Promise<{ reset: true }> {
    return this.authService.resetPassword(dto);
  }
}

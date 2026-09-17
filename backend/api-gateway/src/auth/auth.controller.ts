import {
  AUTH_PATTERNS,
  AuthTokens,
  AuthenticatedUser,
  CurrentUser,
  Public,
  SERVICE_TOKENS,
} from '@dpgc/shared';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { MicroserviceClient } from '../clients/microservice.client';
import { ResponseMessage } from '../interceptors/response.interceptor';
import {
  ChangePasswordRequestDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  RefreshRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from './dto/auth.dto';

/**
 * Public REST surface for authentication. Every handler forwards to
 * auth-service over TCP and holds no business logic of its own.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly client: MicroserviceClient) {}

  /** Request metadata recorded against the issued refresh token. */
  private context(request: Request): { userAgent?: string; ipAddress?: string } {
    return {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Signed in successfully')
  @ApiOperation({
    summary: 'Sign in with email and password',
    description:
      'Returns the user profile plus an access/refresh token pair. Repeated failures lock the account temporarily. Committee Member accounts additionally require an approved committee registration.',
  })
  @ApiResponse({ status: 200, description: 'Credentials accepted; tokens issued.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or the account is locked.' })
  @ApiResponse({ status: 403, description: 'The account is inactive or the committee is unapproved.' })
  @ApiResponse({ status: 422, description: 'The submitted data failed validation.' })
  login(@Body() dto: LoginRequestDto, @Req() request: Request) {
    return this.client.send(SERVICE_TOKENS.AUTH, AUTH_PATTERNS.LOGIN, {
      credentials: dto,
      context: this.context(request),
    });
  }

  @Public()
  @Post('register')
  @ResponseMessage('Account created successfully')
  @ApiOperation({
    summary: 'Self-service registration',
    description:
      'Creates a pending account with the Guest User role. An administrator must activate it before it can reach admin modules.',
  })
  @ApiResponse({ status: 201, description: 'Account created.' })
  @ApiResponse({ status: 409, description: 'The email address is already registered.' })
  register(@Body() dto: RegisterRequestDto) {
    return this.client.send(SERVICE_TOKENS.AUTH, AUTH_PATTERNS.REGISTER, dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Session refreshed successfully')
  @ApiOperation({
    summary: 'Exchange a refresh token for a new token pair',
    description:
      'Rotates the refresh token: the presented token is revoked and a new pair issued. Replaying a revoked token revokes every session for that user.',
  })
  @ApiResponse({ status: 200, description: 'New tokens issued.' })
  @ApiResponse({ status: 401, description: 'The refresh token is invalid, expired or revoked.' })
  refresh(@Body() dto: RefreshRequestDto, @Req() request: Request): Promise<AuthTokens> {
    return this.client.send<AuthTokens>(SERVICE_TOKENS.AUTH, AUTH_PATTERNS.REFRESH, {
      refreshToken: dto.refreshToken,
      context: this.context(request),
    });
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Signed out successfully')
  @ApiOperation({
    summary: 'Revoke a refresh token',
    description: 'Idempotent: an unknown or already-revoked token still reports success.',
  })
  logout(@Body() dto: RefreshRequestDto) {
    return this.client.send(SERVICE_TOKENS.AUTH, AUTH_PATTERNS.LOGOUT, {
      refreshToken: dto.refreshToken,
    });
  }

  @Get('me')
  @ApiBearerAuth()
  @ResponseMessage('Profile retrieved successfully')
  @ApiOperation({
    summary: 'Current user profile',
    description: 'Returns fresh roles and permissions from the database, not from the token claims.',
  })
  @ApiResponse({ status: 401, description: 'Missing, invalid or expired access token.' })
  me(@CurrentUser('id') userId: number) {
    return this.client.send(SERVICE_TOKENS.AUTH, AUTH_PATTERNS.ME, { userId });
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ResponseMessage('Password changed successfully')
  @ApiOperation({
    summary: 'Change your own password',
    description: 'Revokes all other sessions on success.',
  })
  @ApiResponse({ status: 400, description: 'The current password is incorrect.' })
  changePassword(
    @Body() dto: ChangePasswordRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.client.send(SERVICE_TOKENS.AUTH, AUTH_PATTERNS.CHANGE_PASSWORD, {
      userId: user.id,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('If that address is registered, a reset link has been sent')
  @ApiOperation({
    summary: 'Request a password reset link',
    description:
      'Always reports success, even for an unknown address, so the endpoint cannot be used to discover registered emails.',
  })
  forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    return this.client.send(SERVICE_TOKENS.AUTH, AUTH_PATTERNS.FORGOT_PASSWORD, dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Password reset successfully')
  @ApiOperation({ summary: 'Set a new password using a reset token' })
  @ApiResponse({ status: 400, description: 'The reset link is invalid or has expired.' })
  resetPassword(@Body() dto: ResetPasswordRequestDto) {
    return this.client.send(SERVICE_TOKENS.AUTH, AUTH_PATTERNS.RESET_PASSWORD, dto);
  }
}

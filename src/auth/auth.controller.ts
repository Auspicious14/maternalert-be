import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

/**
 * Authentication Controller
 *
 * ENDPOINTS:
 * - POST /auth/register - Register new user
 * - POST /auth/login - Login user
 * - POST /auth/refresh - Refresh access token
 * - POST /auth/forgot-password - Forgot password request
 * - POST /auth/reset-password - Reset password with token
 *
 * CLINICAL SAFETY:
 * - No health data collected
 * - Minimal PII only
 * - No credential logging
 */

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   *
   * @param registerDto - Email/phone and password
   * @returns Access token, refresh token, and user ID
   */
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   *
   * @param loginDto - Email/phone and password
   * @returns Access token, refresh token, and user ID
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Forgot password request
   *
   * @param forgotPasswordDto - Email or phone
   */
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Reset password with token
   *
   * @param resetPasswordDto - Token and new password
   */
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Refresh access token
   *
   * @param refreshTokenDto - Refresh token
   * @returns New access token and refresh token
   */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * Logout user
   *
   * SECURITY:
   * - Requires valid access token
   * - Clears stored refresh token so it cannot be reused
   */
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any): Promise<void> {
    await this.authService.logout(req.user.id);
  }
}

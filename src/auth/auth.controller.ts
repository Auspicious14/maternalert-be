import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";

/**
 * Authentication Controller
 *
 * ENDPOINTS:
 * - POST /auth/register - Register new user
 * - POST /auth/login - Login user
 * - POST /auth/refresh - Refresh access token
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
}

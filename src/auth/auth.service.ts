import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { PrismaService } from "../database/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { NotificationsService } from "../notifications/notifications.service";

/**
 * Authentication Service
 *
 * CLINICAL SAFETY PRINCIPLES:
 * - Minimal PII storage
 * - No health data in auth tables
 * - No credential logging
 * - Secure password hashing (bcrypt)
 * - JWT-based stateless authentication
 * - Refresh token rotation for security
 */

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService
  ) {}

  /**
   * Forgot password request
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email, phone } = forgotPasswordDto;

    // Find user
    const user = await this.prisma.userAuth.findFirst({
      where: {
        OR: [email ? { email } : {}, phone ? { phone } : {}],
      },
    });

    if (!user) {
      // Don't reveal if user exists for security
      this.logger.warn(`Forgot password attempt for non-existent user: ${email || phone}`);
      return;
    }

    // Generate token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Save token
    await this.prisma.userAuth.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    // Send reset message (via notification service)
    await this.notificationsService.sendResetPasswordNotification(user.id, token);
    
    this.logger.log(`Password reset token generated for user: ${user.id}`);
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    // Find user with valid token
    const user = await this.prisma.userAuth.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid or expired reset token");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update user
    await this.prisma.userAuth.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        refreshToken: null, // Force logout from all devices
      },
    });

    this.logger.log(`Password reset successful for user: ${user.id}`);
  }

  /**
   * Register a new user
   *
   * CONSTRAINTS:
   * - Email OR phone required (not both)
   * - Password must be at least 8 characters
   * - No duplicate email/phone
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Registration attempt for: ${registerDto.email || registerDto.phone}`);
    const { email, phone, password } = registerDto;

    // Validate that at least one identifier is provided
    if (!email && !phone) {
      throw new ConflictException("Either email or phone must be provided");
    }

    // Check for existing user
    const existingUser = await this.prisma.userAuth.findFirst({
      where: {
        OR: [email ? { email } : {}, phone ? { phone } : {}],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        "User with this email or phone already exists"
      );
    }

    // Hash password (NEVER log the password)
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user
    try {
      const user = await this.prisma.userAuth.create({
        data: {
          email,
          phone,
          passwordHash,
        },
      });
      this.logger.log(`New user registered: ${user.id}`);
      return this.generateTokens(user.id);
    } catch (error: any) {
      this.logger.error(`Database error during registration: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Login user
   *
   * CONSTRAINTS:
   * - Email OR phone required
   * - Password verification
   * - No credential logging
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, phone, password } = loginDto;

    // Validate that at least one identifier is provided
    if (!email && !phone) {
      throw new UnauthorizedException("Either email or phone must be provided");
    }

    // Find user
    const user = await this.prisma.userAuth.findFirst({
      where: {
        OR: [email ? { email } : {}, phone ? { phone } : {}],
      },
    });

    if (!user) {
      // Generic error to prevent user enumeration
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password (NEVER log the password)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException("Account is inactive");
    }

    this.logger.log(`User logged in: ${user.id}`);

    // Generate tokens
    return this.generateTokens(user.id);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
      });

      // Find user
      const user = await this.prisma.userAuth.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Verify stored refresh token matches
      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Generate new tokens
      return this.generateTokens(user.id);
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Logout user by invalidating stored refresh token
   *
   * SECURITY:
   * - Clears refresh token from database so it can no longer be used
   */
  async logout(userId: string): Promise<void> {
    await this.prisma.userAuth.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    this.logger.log(`User logged out: ${userId}`);
  }

  /**
   * Generate JWT access and refresh tokens
   *
   * SECURITY:
   * - Access token: short-lived (1 hour)
   * - Refresh token: longer-lived (7 days)
   * - Refresh token stored in database for rotation
   */
  private async generateTokens(userId: string): Promise<AuthResponseDto> {
    const payload = { sub: userId };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: this.configService.get("JWT_EXPIRATION"),
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRATION"),
    });

    // Store refresh token in database
    await this.prisma.userAuth.update({
      where: { id: userId },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      userId,
    };
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUser(userId: string) {
    const user = await this.prisma.userAuth.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }
}

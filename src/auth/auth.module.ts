import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { NotificationsModule } from "../notifications/notifications.module";

/**
 * Authentication Module
 *
 * RESPONSIBILITIES:
 * - User authentication (JWT-based)
 * - Minimal PII storage
 * - No health data in auth tables
 * - No credential logging
 *
 * FEATURES:
 * - Email OR phone login
 * - Password hashing with bcrypt
 * - JWT access tokens (short-lived)
 * - Refresh token rotation
 * - Secure authentication flow
 */

@Module({
  imports: [
    NotificationsModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get("JWT_EXPIRATION"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { UserProfileService } from "./user-profile.service";
import { CreateUserProfileDto } from "./dto/create-user-profile.dto";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

/**
 * User Profile Controller
 *
 * ENDPOINTS:
 * - POST /user-profile - Create profile (authenticated)
 * - GET /user-profile - Get own profile (authenticated)
 * - PUT /user-profile - Update profile (authenticated)
 * - DELETE /user-profile - Delete profile (authenticated)
 *
 * CLINICAL SAFETY:
 * - All endpoints require authentication
 * - Users can only access their own profile
 * - No PII collected (age range, not DOB)
 * - No free-text medical history
 * - Enumerated conditions only
 */

@Controller("user-profile")
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  /**
   * Create user profile
   *
   * @param req - Request with authenticated user
   * @param createUserProfileDto - Profile data
   * @returns Created profile
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any,
    @Body() createUserProfileDto: CreateUserProfileDto
  ) {
    const userId = req.user.id;
    return this.userProfileService.create(userId, createUserProfileDto);
  }

  /**
   * Get own user profile
   *
   * @param req - Request with authenticated user
   * @returns User profile
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: any) {
    const userId = req.user.id;
    return this.userProfileService.findByUserId(userId);
  }

  /**
   * Update user profile
   *
   * @param req - Request with authenticated user
   * @param updateUserProfileDto - Updated profile data
   * @returns Updated profile
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() req: any,
    @Body() updateUserProfileDto: UpdateUserProfileDto
  ) {
    const userId = req.user.id;
    return this.userProfileService.update(userId, updateUserProfileDto);
  }

  /**
   * Delete user profile
   *
   * @param req - Request with authenticated user
   * @returns Success message
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async delete(@Request() req: any) {
    const userId = req.user.id;
    return this.userProfileService.delete(userId);
  }
}

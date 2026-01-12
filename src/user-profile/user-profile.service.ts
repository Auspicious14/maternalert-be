import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateUserProfileDto } from "./dto/create-user-profile.dto";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";

/**
 * User Profile Service
 *
 * CLINICAL SAFETY PRINCIPLES:
 * - Data minimization (no DOB, no address, no free-text)
 * - Only pregnancy-relevant structured data
 * - No diagnostic interpretations
 * - All data enumerated or validated
 *
 * RESPONSIBILITIES:
 * - Create user profile after registration
 * - Update profile information
 * - Retrieve profile for care priority calculations
 */

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user profile
   *
   * CONSTRAINTS:
   * - One profile per user
   * - User must exist in UserAuth
   * - All fields validated
   */
  async create(userId: string, createUserProfileDto: CreateUserProfileDto) {
    // Check if user exists
    const userAuth = await this.prisma.userAuth.findUnique({
      where: { id: userId },
    });

    if (!userAuth) {
      throw new NotFoundException("User not found");
    }

    // Check if profile already exists
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException("User profile already exists");
    }

    // Create profile
    const profile = await this.prisma.userProfile.create({
      data: {
        userId,
        ...createUserProfileDto,
      },
    });

    this.logger.log(`Profile created for user: ${userId}`);

    return profile;
  }

  /**
   * Get user profile by user ID
   */
  async findByUserId(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException("User profile not found");
    }

    return profile;
  }

  /**
   * Update user profile
   *
   * CONSTRAINTS:
   * - Profile must exist
   * - Partial updates allowed
   * - All fields validated
   */
  async update(userId: string, updateUserProfileDto: UpdateUserProfileDto) {
    // Check if profile exists
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException("User profile not found");
    }

    // Update profile
    const updatedProfile = await this.prisma.userProfile.update({
      where: { userId },
      data: updateUserProfileDto,
    });

    this.logger.log(`Profile updated for user: ${userId}`);

    return updatedProfile;
  }

  /**
   * Check if user has a profile
   */
  async hasProfile(userId: string): Promise<boolean> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    return !!profile;
  }

  /**
   * Delete user profile
   * (Cascade delete will happen automatically when user is deleted)
   */
  async delete(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException("User profile not found");
    }

    await this.prisma.userProfile.delete({
      where: { userId },
    });

    this.logger.log(`Profile deleted for user: ${userId}`);

    return { message: "Profile deleted successfully" };
  }
}

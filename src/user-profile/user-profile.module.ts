import { Module } from "@nestjs/common";
import { UserProfileController } from "./user-profile.controller";
import { UserProfileService } from "./user-profile.service";

/**
 * User Profile Module
 *
 * RESPONSIBILITIES:
 * - Store minimal user profile data
 * - Age range (not DOB)
 * - Pregnancy information
 * - Known conditions (enumerated)
 *
 * DATA MINIMIZATION PRINCIPLE:
 * - No full DOB
 * - No address
 * - No free-text medical history
 * - No names or demographic data
 * - Only pregnancy-relevant structured data
 *
 * CLINICAL SAFETY:
 * - All data enumerated or validated
 * - No diagnostic interpretations
 * - Used for care priority calculations (Phase 3)
 */

@Module({
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}

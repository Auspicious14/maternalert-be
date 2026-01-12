import { Module } from "@nestjs/common";
import { CarePriorityService } from "./care-priority.service";
import { CarePriorityController } from "./care-priority.controller";
import { BloodPressureModule } from "../blood-pressure/blood-pressure.module";
import { SymptomsModule } from "../symptoms/symptoms.module";
import { UserProfileModule } from "../user-profile/user-profile.module";

/**
 * Care Priority Module
 *
 * RESPONSIBILITIES:
 * - Deterministic care priority calculation
 * - Rule-based escalation logic
 * - No diagnosis, no medical advice
 *
 * CRITICAL MODULE:
 * This is the core clinical safety module.
 * Must default to higher priority if uncertain.
 *
 * DEPENDENCIES:
 * - BloodPressureModule (for BP readings)
 * - SymptomsModule (for symptom tracking)
 * - UserProfileModule (for risk factors)
 */

@Module({
  imports: [BloodPressureModule, SymptomsModule, UserProfileModule],
  controllers: [CarePriorityController],
  providers: [CarePriorityService],
  exports: [CarePriorityService],
})
export class CarePriorityModule {}

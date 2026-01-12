import { Module } from "@nestjs/common";
import { BloodPressureController } from "./blood-pressure.controller";
import { BloodPressureService } from "./blood-pressure.service";

/**
 * Blood Pressure Module
 *
 * RESPONSIBILITIES:
 * - Store BP readings (systolic/diastolic)
 * - Manual entry only
 * - Timestamp tracking
 *
 * CLINICAL SAFETY CONSTRAINTS:
 * - Do NOT label readings as normal/abnormal
 * - Do NOT store interpretations
 * - Neutral data handling only
 * - Raw measurements for care priority engine
 */

@Module({
  controllers: [BloodPressureController],
  providers: [BloodPressureService],
  exports: [BloodPressureService],
})
export class BloodPressureModule {}

import { Module } from "@nestjs/common";
import { SymptomsController } from "./symptoms.controller";
import { SymptomsService } from "./symptoms.service";

/**
 * Symptoms Module
 *
 * RESPONSIBILITIES:
 * - Store individual symptom records
 * - Atomic, non-scored entries
 * - Timestamp tracking
 *
 * CLINICAL SAFETY CONSTRAINTS:
 * - No severity levels
 * - No numeric scoring
 * - Each symptom is a separate record
 * - Enumerated symptom types only
 */

@Module({
  controllers: [SymptomsController],
  providers: [SymptomsService],
  exports: [SymptomsService],
})
export class SymptomsModule {}

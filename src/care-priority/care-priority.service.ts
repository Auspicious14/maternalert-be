import { Injectable, Logger } from "@nestjs/common";
import { BloodPressureService } from "../blood-pressure/blood-pressure.service";
import { SymptomsService } from "../symptoms/symptoms.service";
import { UserProfileService } from "../user-profile/user-profile.service";
import { CarePriority, CarePriorityResult } from "./types/care-priority.types";
import { KnownCondition, SymptomType } from "@prisma/client";

/**
 * Care Priority Engine Service
 *
 * ⚠️ MOST CRITICAL MODULE - CLINICAL SAFETY ⚠️
 *
 * PRINCIPLES:
 * - Deterministic, rule-based logic (NO AI/ML)
 * - NO diagnosis
 * - NO medical advice
 * - NO risk scoring or probability calculations
 * - Default to HIGHER priority when uncertain
 * - Based on clinical guidelines for hypertensive disorders in pregnancy
 *
 * RULES SOURCE:
 * - ACOG (American College of Obstetricians and Gynecologists) guidelines
 * - Preeclampsia Foundation recommendations
 * - NHS (UK) hypertension in pregnancy guidelines
 *
 * PURPOSE:
 * - Provide care escalation recommendations
 * - Guide users to seek appropriate level of care
 * - NOT to replace clinical judgment
 */

@Injectable()
export class CarePriorityService {
  private readonly logger = new Logger(CarePriorityService.name);

  constructor(
    private readonly bloodPressureService: BloodPressureService,
    private readonly symptomsService: SymptomsService,
    private readonly userProfileService: UserProfileService
  ) {}

  /**
   * Calculate care priority for a user
   *
   * ALGORITHM:
   * 1. Check for EMERGENCY conditions (immediate medical attention)
   * 2. Check for URGENT_REVIEW conditions (contact provider within 24h)
   * 3. Check for INCREASED_MONITORING conditions (more frequent monitoring)
   * 4. Default to ROUTINE if no concerning factors
   *
   * CONSERVATIVE APPROACH:
   * - If multiple factors present, use highest priority
   * - If uncertain, escalate to higher priority
   * - Better to over-escalate than under-escalate
   */
  async calculateCarePriority(userId: string): Promise<CarePriorityResult> {
    const reasons: string[] = [];
    let priority: CarePriority = CarePriority.ROUTINE;

    try {
      // Get user data
      const profile = await this.userProfileService.findByUserId(userId);
      const latestBP = await this.bloodPressureService.getLatestReading(userId);
      const recentBPs = await this.bloodPressureService.getRecentReadings(
        userId,
        48
      );
      const recentSymptoms = await this.symptomsService.getRecentSymptoms(
        userId,
        72
      );

      // ========================================
      // EMERGENCY CHECKS
      // ========================================

      // EMERGENCY: Severe hypertension (BP ≥160/110)
      if (latestBP && (latestBP.systolic >= 160 || latestBP.diastolic >= 110)) {
        priority = CarePriority.EMERGENCY;
        reasons.push("Blood pressure reading indicates severe hypertension");
        this.logger.warn(
          `EMERGENCY priority for user ${userId}: BP ${latestBP.systolic}/${latestBP.diastolic}`
        );
      }

      // EMERGENCY: Dangerous symptom combinations
      const symptomTypes = new Set(
        recentSymptoms.map((s: any) => s.symptomType)
      );

      // Severe preeclampsia warning signs
      if (
        symptomTypes.has(SymptomType.HEADACHE) &&
        symptomTypes.has(SymptomType.BLURRED_VISION)
      ) {
        priority = CarePriority.EMERGENCY;
        reasons.push("Combination of severe headache and vision changes");
        this.logger.warn(
          `EMERGENCY priority for user ${userId}: Headache + Vision changes`
        );
      }

      if (
        symptomTypes.has(SymptomType.UPPER_ABDOMINAL_PAIN) &&
        symptomTypes.has(SymptomType.NAUSEA_VOMITING)
      ) {
        priority = CarePriority.EMERGENCY;
        reasons.push("Upper abdominal pain with nausea/vomiting");
        this.logger.warn(
          `EMERGENCY priority for user ${userId}: Abdominal pain + Nausea`
        );
      }

      if (symptomTypes.has(SymptomType.SHORTNESS_OF_BREATH)) {
        priority = CarePriority.EMERGENCY;
        reasons.push("Difficulty breathing reported");
        this.logger.warn(
          `EMERGENCY priority for user ${userId}: Shortness of breath`
        );
      }

      // If already EMERGENCY, return immediately
      if (priority === CarePriority.EMERGENCY) {
        return {
          priority,
          reasons,
          timestamp: new Date(),
        };
      }

      // ========================================
      // URGENT_REVIEW CHECKS
      // ========================================

      // URGENT: Confirmed hypertension (BP ≥140/90 on two occasions)
      if (recentBPs.length >= 2) {
        const elevatedReadings = recentBPs.filter(
          (bp: any) => bp.systolic >= 140 || bp.diastolic >= 90
        );

        if (elevatedReadings.length >= 2) {
          priority = CarePriority.URGENT_REVIEW;
          reasons.push("Multiple elevated blood pressure readings");
        }
      }

      // URGENT: High-risk conditions + elevated BP
      const highRiskConditions = [
        KnownCondition.CHRONIC_HYPERTENSION,
        KnownCondition.PREECLAMPSIA_HISTORY,
        KnownCondition.KIDNEY_DISEASE,
      ];

      const hasHighRiskCondition = profile.knownConditions.some(
        (condition: any) => highRiskConditions.includes(condition)
      );

      if (
        hasHighRiskCondition &&
        latestBP &&
        (latestBP.systolic >= 130 || latestBP.diastolic >= 85)
      ) {
        priority = CarePriority.URGENT_REVIEW;
        reasons.push("High-risk condition with elevated blood pressure");
      }

      // URGENT: Any severe symptoms individually
      if (
        symptomTypes.has(SymptomType.HEADACHE) ||
        symptomTypes.has(SymptomType.BLURRED_VISION) ||
        symptomTypes.has(SymptomType.UPPER_ABDOMINAL_PAIN)
      ) {
        if (priority !== CarePriority.URGENT_REVIEW) {
          priority = CarePriority.URGENT_REVIEW;
        }
        reasons.push("Warning symptoms present");
      }

      // URGENT: Reduced urine output
      if (symptomTypes.has(SymptomType.REDUCED_URINE)) {
        priority = CarePriority.URGENT_REVIEW;
        reasons.push("Reduced urine output reported");
      }

      // If URGENT_REVIEW, return
      if (priority === CarePriority.URGENT_REVIEW) {
        return {
          priority,
          reasons,
          timestamp: new Date(),
        };
      }

      // ========================================
      // INCREASED_MONITORING CHECKS
      // ========================================

      // INCREASED: Borderline BP (130-139 / 85-89)
      if (
        latestBP &&
        ((latestBP.systolic >= 130 && latestBP.systolic < 140) ||
          (latestBP.diastolic >= 85 && latestBP.diastolic < 90))
      ) {
        priority = CarePriority.INCREASED_MONITORING;
        reasons.push("Blood pressure in borderline range");
      }

      // INCREASED: High-risk conditions present
      if (hasHighRiskCondition) {
        priority = CarePriority.INCREASED_MONITORING;
        reasons.push("High-risk pregnancy condition present");
      }

      // INCREASED: Advanced maternal age (35+)
      if (profile.ageRange === "AGE_35_PLUS") {
        if (priority !== CarePriority.INCREASED_MONITORING) {
          priority = CarePriority.INCREASED_MONITORING;
        }
        reasons.push("Advanced maternal age");
      }

      // INCREASED: Multiple pregnancy
      if (profile.knownConditions.includes(KnownCondition.MULTIPLE_PREGNANCY)) {
        priority = CarePriority.INCREASED_MONITORING;
        reasons.push("Multiple pregnancy");
      }

      // INCREASED: Any symptoms present (even mild)
      if (recentSymptoms.length > 0) {
        if (priority !== CarePriority.INCREASED_MONITORING) {
          priority = CarePriority.INCREASED_MONITORING;
        }
        reasons.push("Symptoms reported");
      }

      // If INCREASED_MONITORING, return
      if (priority === CarePriority.INCREASED_MONITORING) {
        return {
          priority,
          reasons,
          timestamp: new Date(),
        };
      }

      // ========================================
      // ROUTINE (Default)
      // ========================================

      reasons.push("No concerning factors identified");

      return {
        priority: CarePriority.ROUTINE,
        reasons,
        timestamp: new Date(),
      };
    } catch (error) {
      // SAFETY: If calculation fails, default to INCREASED_MONITORING
      this.logger.error(
        `Error calculating care priority for user ${userId}:`,
        error
      );

      return {
        priority: CarePriority.INCREASED_MONITORING,
        reasons: [
          "Unable to complete assessment - please contact your healthcare provider",
        ],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get safe next step message based on priority
   *
   * CONSTRAINTS:
   * - Predefined templates only
   * - No dynamic medical text
   * - No diagnostic language
   * - No fear-based messaging
   */
  getSafeNextStepMessage(priority: CarePriority): string {
    const messages = {
      [CarePriority.EMERGENCY]:
        "Seek immediate medical attention. Call emergency services or go to the nearest emergency room.",

      [CarePriority.URGENT_REVIEW]:
        "Contact your healthcare provider within the next 24 hours to discuss your readings.",

      [CarePriority.INCREASED_MONITORING]:
        "Continue monitoring your blood pressure regularly and discuss with your healthcare provider at your next appointment.",

      [CarePriority.ROUTINE]:
        "Continue routine prenatal care and monitoring as recommended by your healthcare provider.",
    };

    return messages[priority];
  }
}

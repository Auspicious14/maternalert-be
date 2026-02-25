import { Injectable, Logger } from "@nestjs/common";
import { CarePriorityService } from "./care-priority.service";
import { NotificationsService } from "../notifications/notifications.service";
import { BloodPressureService } from "../blood-pressure/blood-pressure.service";
import { SymptomsService } from "../symptoms/symptoms.service";
import { CarePriority } from "./types/care-priority.types";
import { SymptomType } from "@prisma/client";

@Injectable()
export class HealthAssessmentService {
  private readonly logger = new Logger(HealthAssessmentService.name);

  constructor(
    private readonly carePriorityService: CarePriorityService,
    private readonly notificationsService: NotificationsService,
    private readonly bloodPressureService: BloodPressureService,
    private readonly symptomsService: SymptomsService
  ) {}

  /**
   * Assess user health after a new BP reading or symptom is recorded
   * and trigger appropriate notifications.
   */
  async assessAndNotify(userId: string): Promise<void> {
    try {
      this.logger.log(`Starting health assessment for user: ${userId}`);

      // 1. Calculate current care priority
      const assessment = await this.carePriorityService.calculateCarePriority(
        userId
      );
      const { priority } = assessment;

      // 2. Get latest data for specific alerts
      const latestBP = await this.bloodPressureService.getLatestReading(userId);
      const recentSymptoms = await this.symptomsService.getRecentSymptoms(
        userId,
        24
      );
      const symptomTypes = new Set(
        recentSymptoms.map((s: any) => s.symptomType)
      );

      // 3. Trigger specific BP alerts if needed
      if (latestBP) {
        if (latestBP.systolic >= 160 || latestBP.diastolic >= 110) {
          await this.notificationsService.sendSevereBPAlert(
            userId,
            latestBP.systolic,
            latestBP.diastolic
          );
        } else if (latestBP.systolic >= 140 || latestBP.diastolic >= 90) {
          await this.notificationsService.sendElevatedBPNotification(
            userId,
            latestBP.systolic,
            latestBP.diastolic
          );
        }
      }

      // 4. Trigger symptom alerts if dangerous symptoms are present
      const dangerousSymptoms = [
        SymptomType.HEADACHE,
        SymptomType.BLURRED_VISION,
        SymptomType.UPPER_ABDOMINAL_PAIN,
        SymptomType.SHORTNESS_OF_BREATH,
      ];

      const hasDangerousSymptom = Array.from(symptomTypes).some((type) =>
        dangerousSymptoms.includes(type)
      );

      if (hasDangerousSymptom) {
        const activeDangerous = Array.from(symptomTypes).filter((type) =>
          dangerousSymptoms.includes(type)
        );
        await this.notificationsService.sendDangerousSymptomAlert(
          userId,
          activeDangerous.map((s) => s.toString())
        );
      } else if (symptomTypes.size > 0) {
        await this.notificationsService.sendWarningSymptomNotification(
          userId,
          Array.from(symptomTypes)[0].toString()
        );
      }

      // 5. Trigger care priority notification if priority is not ROUTINE
      if (priority !== CarePriority.ROUTINE) {
        await this.notificationsService.sendCarePriorityNotification(
          userId,
          priority
        );
      }

      this.logger.log(`Health assessment completed for user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error during health assessment for user ${userId}:`,
        error
      );
    }
  }
}

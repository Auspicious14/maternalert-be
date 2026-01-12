import { Injectable, Logger } from "@nestjs/common";
import { CarePriority } from "../care-priority/types/care-priority.types";
import {
  CARE_PRIORITY_TEMPLATES,
  BP_ALERT_TEMPLATES,
  SYMPTOM_ALERT_TEMPLATES,
} from "./templates/notification.templates";

/**
 * Notification Service
 *
 * CLINICAL SAFETY PRINCIPLES:
 * - Template-based messaging only
 * - No dynamic medical text generation
 * - No fear-based language
 * - No predictions
 * - Clear, actionable guidance
 *
 * RESPONSIBILITIES:
 * - Send care priority escalation notifications
 * - Send BP alert notifications
 * - Send symptom alert notifications
 * - Log all notifications for audit trail
 *
 * DELIVERY:
 * - Currently logs to console (stub)
 * - In production: integrate with email/SMS service
 * - Could integrate with: SendGrid, Twilio, AWS SNS, etc.
 */

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /**
   * Send care priority escalation notification
   *
   * TRIGGERS:
   * - When care priority changes
   * - When priority is URGENT_REVIEW or EMERGENCY
   *
   * @param userId - User ID
   * @param priority - Care priority level
   */
  async sendCarePriorityNotification(
    userId: string,
    priority: CarePriority
  ): Promise<void> {
    const template = CARE_PRIORITY_TEMPLATES[priority];

    // Log notification (in production, send via email/SMS)
    this.logger.log(`[NOTIFICATION] User: ${userId}, Priority: ${priority}`);
    this.logger.log(`Subject: ${template.subject}`);
    this.logger.log(`Body: ${template.body}`);
    this.logger.log(`CTA: ${template.callToAction}`);

    // TODO: Integrate with actual notification service
    // Example: await this.emailService.send(userEmail, template);
    // Example: await this.smsService.send(userPhone, template);

    // For now, just log
    this.logger.log(`✅ Notification sent to user ${userId}`);
  }

  /**
   * Send severe BP alert
   *
   * TRIGGER:
   * - BP ≥160/110 (severe hypertension)
   *
   * @param userId - User ID
   * @param systolic - Systolic BP
   * @param diastolic - Diastolic BP
   */
  async sendSevereBPAlert(
    userId: string,
    systolic: number,
    diastolic: number
  ): Promise<void> {
    const template = BP_ALERT_TEMPLATES.SEVERE_HYPERTENSION;

    this.logger.warn(
      `[ALERT] Severe BP for user ${userId}: ${systolic}/${diastolic}`
    );
    this.logger.log(`Subject: ${template.subject}`);
    this.logger.log(`Body: ${template.body}`);
    this.logger.log(`CTA: ${template.callToAction}`);

    // TODO: Send actual notification
    this.logger.log(`✅ Severe BP alert sent to user ${userId}`);
  }

  /**
   * Send elevated BP notification
   *
   * TRIGGER:
   * - BP ≥140/90 (hypertension)
   *
   * @param userId - User ID
   * @param systolic - Systolic BP
   * @param diastolic - Diastolic BP
   */
  async sendElevatedBPNotification(
    userId: string,
    systolic: number,
    diastolic: number
  ): Promise<void> {
    const template = BP_ALERT_TEMPLATES.ELEVATED_BP;

    this.logger.log(
      `[NOTIFICATION] Elevated BP for user ${userId}: ${systolic}/${diastolic}`
    );
    this.logger.log(`Subject: ${template.subject}`);
    this.logger.log(`Body: ${template.body}`);

    // TODO: Send actual notification
    this.logger.log(`✅ Elevated BP notification sent to user ${userId}`);
  }

  /**
   * Send dangerous symptom combination alert
   *
   * TRIGGER:
   * - Dangerous symptom combinations detected
   *
   * @param userId - User ID
   * @param symptoms - List of symptoms
   */
  async sendDangerousSymptomAlert(
    userId: string,
    symptoms: string[]
  ): Promise<void> {
    const template = SYMPTOM_ALERT_TEMPLATES.DANGEROUS_COMBINATION;

    this.logger.warn(
      `[ALERT] Dangerous symptoms for user ${userId}: ${symptoms.join(", ")}`
    );
    this.logger.log(`Subject: ${template.subject}`);
    this.logger.log(`Body: ${template.body}`);

    // TODO: Send actual notification
    this.logger.log(`✅ Dangerous symptom alert sent to user ${userId}`);
  }

  /**
   * Send warning symptom notification
   *
   * TRIGGER:
   * - Single warning symptom reported
   *
   * @param userId - User ID
   * @param symptom - Symptom type
   */
  async sendWarningSymptomNotification(
    userId: string,
    symptom: string
  ): Promise<void> {
    const template = SYMPTOM_ALERT_TEMPLATES.SINGLE_WARNING_SYMPTOM;

    this.logger.log(
      `[NOTIFICATION] Warning symptom for user ${userId}: ${symptom}`
    );
    this.logger.log(`Subject: ${template.subject}`);
    this.logger.log(`Body: ${template.body}`);

    // TODO: Send actual notification
    this.logger.log(`✅ Warning symptom notification sent to user ${userId}`);
  }

  /**
   * Get notification history for user
   *
   * In production, this would query a notifications table
   * For now, returns empty array
   */
  async getNotificationHistory(userId: string): Promise<any[]> {
    this.logger.log(`Fetching notification history for user ${userId}`);

    // TODO: Implement notification history storage
    return [];
  }
}

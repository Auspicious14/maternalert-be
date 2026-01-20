import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CarePriority } from "../care-priority/types/care-priority.types";
import { NotificationType } from "@prisma/client";
import {
  CARE_PRIORITY_TEMPLATES,
  BP_ALERT_TEMPLATES,
  SYMPTOM_ALERT_TEMPLATES,
} from "./templates/notification.templates";

/**
 * Notification Service
 *
 * RESPONSIBILITIES:
 * - Send care priority escalation notifications
 * - Send BP alert notifications
 * - Send symptom alert notifications
 * - Log all notifications for audit trail
 * - Persist notifications to database
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send care priority escalation notification
   */
  async sendCarePriorityNotification(
    userId: string,
    priority: CarePriority
  ): Promise<void> {
    const template = CARE_PRIORITY_TEMPLATES[priority];

    // Log notification
    this.logger.log(`[NOTIFICATION] User: ${userId}, Priority: ${priority}`);
    
    // Persist to database
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.CARE_PRIORITY,
        title: template.subject,
        message: template.body,
      },
    });

    this.logger.log(`✅ Notification saved for user ${userId}`);
  }

  /**
   * Send severe BP alert
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

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.BP_ALERT,
        title: template.subject,
        message: template.body,
      },
    });

    this.logger.log(`✅ Severe BP alert saved for user ${userId}`);
  }

  /**
   * Send elevated BP notification
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

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.BP_ALERT,
        title: template.subject,
        message: template.body,
      },
    });

    this.logger.log(`✅ Elevated BP notification saved for user ${userId}`);
  }

  /**
   * Send dangerous symptom combination alert
   */
  async sendDangerousSymptomAlert(
    userId: string,
    symptoms: string[]
  ): Promise<void> {
    const template = SYMPTOM_ALERT_TEMPLATES.DANGEROUS_COMBINATION;

    this.logger.warn(
      `[ALERT] Dangerous symptoms for user ${userId}: ${symptoms.join(", ")}`
    );

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.SYMPTOM_ALERT,
        title: template.subject,
        message: template.body,
      },
    });

    this.logger.log(`✅ Dangerous symptom alert saved for user ${userId}`);
  }

  /**
   * Send warning symptom notification
   */
  async sendWarningSymptomNotification(
    userId: string,
    symptom: string
  ): Promise<void> {
    const template = SYMPTOM_ALERT_TEMPLATES.SINGLE_WARNING_SYMPTOM;

    this.logger.log(
      `[NOTIFICATION] Warning symptom for user ${userId}: ${symptom}`
    );

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.SYMPTOM_ALERT,
        title: template.subject,
        message: template.body,
      },
    });

    this.logger.log(`✅ Warning symptom notification saved for user ${userId}`);
  }

  /**
   * Get notification history for user
   */
  async getNotificationHistory(userId: string) {
    this.logger.log(`Fetching notification history for user ${userId}`);
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or access denied");
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}

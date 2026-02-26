import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";
import { EmailService } from "./email.service";
import { CarePriority } from "../care-priority/types/care-priority.types";
import { NotificationType } from "@prisma/client";
import {
  CARE_PRIORITY_TEMPLATES,
  BP_ALERT_TEMPLATES,
  SYMPTOM_ALERT_TEMPLATES,
  AUTH_TEMPLATES,
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Helper to get user's email
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    const user = await this.prisma.userAuth.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return user?.email || null;
  }

  /**
   * Send care priority escalation notification
   */
  async sendCarePriorityNotification(
    userId: string,
    priority: CarePriority
  ): Promise<void> {
    const template = CARE_PRIORITY_TEMPLATES[priority];
    const email = await this.getUserEmail(userId);

    // Log notification
    this.logger.log(`[NOTIFICATION] User: ${userId}, Priority: ${priority}`);
    
    // Persist to database
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.CARE_PRIORITY,
        title: template.subject,
        message: `${template.body}\n\n${template.callToAction}`,
      },
    });

    // Send email
    if (email) {
      await this.emailService.sendEmail(
        email,
        template.subject,
        `${template.body}\n\n${template.callToAction}`,
        `<h2>${template.subject}</h2><p>${template.body}</p><strong>${template.callToAction}</strong>`
      );
    }

    this.logger.log(`✅ Notification handled for user ${userId}`);
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
    const email = await this.getUserEmail(userId);

    this.logger.warn(
      `[ALERT] Severe BP for user ${userId}: ${systolic}/${diastolic}`
    );

    const message = `${template.body}\nReading: ${systolic}/${diastolic}\n\n${template.callToAction}`;

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.BP_ALERT,
        title: template.subject,
        message,
      },
    });

    // Send email
    if (email) {
      await this.emailService.sendEmail(
        email,
        template.subject,
        message,
        `<h2>${template.subject}</h2><p>${template.body}</p><p><strong>Reading: ${systolic}/${diastolic}</strong></p><strong>${template.callToAction}</strong>`
      );
    }

    this.logger.log(`✅ Severe BP alert handled for user ${userId}`);
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
    const email = await this.getUserEmail(userId);

    this.logger.log(
      `[NOTIFICATION] Elevated BP for user ${userId}: ${systolic}/${diastolic}`
    );

    const message = `${template.body}\nReading: ${systolic}/${diastolic}\n\n${template.callToAction}`;

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.BP_ALERT,
        title: template.subject,
        message,
      },
    });

    // Send email
    if (email) {
      await this.emailService.sendEmail(
        email,
        template.subject,
        message,
        `<h2>${template.subject}</h2><p>${template.body}</p><p><strong>Reading: ${systolic}/${diastolic}</strong></p><strong>${template.callToAction}</strong>`
      );
    }

    this.logger.log(`✅ Elevated BP notification handled for user ${userId}`);
  }

  /**
   * Send dangerous symptom combination alert
   */
  async sendDangerousSymptomAlert(
    userId: string,
    symptoms: string[]
  ): Promise<void> {
    const template = SYMPTOM_ALERT_TEMPLATES.DANGEROUS_COMBINATION;
    const email = await this.getUserEmail(userId);

    this.logger.warn(
      `[ALERT] Dangerous symptoms for user ${userId}: ${symptoms.join(", ")}`
    );

    const message = `${template.body}\nSymptoms reported: ${symptoms.join(", ")}\n\n${template.callToAction}`;

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.SYMPTOM_ALERT,
        title: template.subject,
        message,
      },
    });

    // Send email
    if (email) {
      await this.emailService.sendEmail(
        email,
        template.subject,
        message,
        `<h2>${template.subject}</h2><p>${template.body}</p><p><strong>Symptoms reported: ${symptoms.join(", ")}</strong></p><strong>${template.callToAction}</strong>`
      );
    }

    this.logger.log(`✅ Dangerous symptom alert handled for user ${userId}`);
  }

  /**
   * Send warning symptom notification
   */
  async sendWarningSymptomNotification(
    userId: string,
    symptom: string
  ): Promise<void> {
    const template = SYMPTOM_ALERT_TEMPLATES.SINGLE_WARNING_SYMPTOM;
    const email = await this.getUserEmail(userId);

    this.logger.log(
      `[NOTIFICATION] Warning symptom for user ${userId}: ${symptom}`
    );

    const message = `${template.body}\nSymptom reported: ${symptom}\n\n${template.callToAction}`;

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.SYMPTOM_ALERT,
        title: template.subject,
        message,
      },
    });

    // Send email
    if (email) {
      await this.emailService.sendEmail(
        email,
        template.subject,
        message,
        `<h2>${template.subject}</h2><p>${template.body}</p><p><strong>Symptom reported: ${symptom}</strong></p><strong>${template.callToAction}</strong>`
      );
    }

    this.logger.log(`✅ Warning symptom notification handled for user ${userId}`);
  }

  /**
   * Send reset password notification
   */
  async sendResetPasswordNotification(
    userId: string,
    token: string
  ): Promise<void> {
    const template = AUTH_TEMPLATES.RESET_PASSWORD;
    const email = await this.getUserEmail(userId);

    this.logger.log(`[AUTH] Reset password request for user ${userId}. Email: ${email || 'N/A'}`);

    const resetLink = `${this.configService.get("FRONTEND_URL")}/reset-password?token=${token}`;
    const message = `${template.body}\n\nReset Link: ${resetLink}`;

    // Store in database
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.REMINDER,
        title: template.subject,
        message,
      },
    });

    // Send actual email if available
    if (email) {
      await this.emailService.sendEmail(
        email,
        template.subject,
        message,
        `<p>${template.body}</p><p><a href="${resetLink}">Click here to reset your password</a></p><p>Or copy and paste this link: ${resetLink}</p>`
      );
    }

    this.logger.log(`✅ Reset password notification handled for user ${userId}`);
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

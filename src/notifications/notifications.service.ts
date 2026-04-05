import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../database/prisma.service";
import { EmailService } from "./email.service";
import { CarePriority } from "../care-priority/types/care-priority.types";
import { NotificationType } from "@prisma/client";
import type { ExpoPushMessage } from "expo-server-sdk";
import {
  CARE_PRIORITY_TEMPLATES,
  BP_ALERT_TEMPLATES,
  SYMPTOM_ALERT_TEMPLATES,
  AUTH_TEMPLATES,
  MONITORING_TEMPLATES,
  TREND_ALERT_TEMPLATES,
} from "./templates/notification.templates";
import { generateEmailHtml } from "./templates/email.template";

/**
 * Notification Service
 *
 * RESPONSIBILITIES:
 * - Send care priority escalation notifications
 * - Send BP alert notifications
 * - Send symptom alert notifications
 * - Log all notifications for audit trail
 * - Persist notifications to database
 * - Send push notifications via Expo
 * - Background monitoring (Inactivity, Daily reminders, Trends, Follow-ups)
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expoInstance: any = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Helper to get Expo instance dynamically (fixes ERR_REQUIRE_ESM)
   */
  private async getExpo() {
    if (!this.expoInstance) {
      const { Expo } = await import("expo-server-sdk");
      this.expoInstance = new Expo();
    }
    return this.expoInstance;
  }

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
   * Internal helper to send push notifications
   */
  private async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    const user = await this.prisma.userAuth.findUnique({
      where: { id: userId },
      select: { pushToken: true },
    });

    if (!user?.pushToken) {
      this.logger.debug(`No push token found for user ${userId}, skipping push.`);
      return;
    }

    const { Expo } = await import("expo-server-sdk");
    if (!Expo.isExpoPushToken(user.pushToken)) {
      this.logger.error(`Push token ${user.pushToken} is not a valid Expo push token`);
      return;
    }

    const messages: ExpoPushMessage[] = [
      {
        to: user.pushToken,
        sound: "default",
        title,
        body,
        data,
      },
    ];

    try {
      const expo = await this.getExpo();
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }
      this.logger.log(`Push notification sent to user ${userId}`);
    } catch (error) {
      this.logger.error(`Error sending push notification to user ${userId}:`, error);
    }
  }

  /**
   * Inactivity Monitor - Checks for users who haven't logged BP in 5 days
   * Runs daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkInactivity() {
    this.logger.log("Running inactivity check...");
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    // Find users whose last reading was > 5 days ago or who never logged
    const users = await this.prisma.userAuth.findMany({
      where: {
        isActive: true,
        bloodPressureReadings: {
          none: {
            recordedAt: { gte: fiveDaysAgo },
          },
        },
      },
      select: { id: true, email: true },
    });

    for (const user of users) {
      const template = MONITORING_TEMPLATES.INACTIVITY_REMINDER;
      await this.prisma.notification.create({
        data: {
          userId: user.id,
          type: NotificationType.REMINDER,
          title: template.subject,
          message: template.body,
        },
      });

      // Send Push
      await this.sendPushNotification(
        user.id,
        template.subject,
        template.body,
        { type: "INACTIVITY_REMINDER" }
      );

      // Send Email
      if (user.email) {
        const html = generateEmailHtml(
          template.subject,
          template.body,
          "Log BP Reading",
          `${this.configService.get("FRONTEND_URL")}/bp-entry`,
          "#2DE474"
        );

        await this.emailService.sendEmail(
          user.email,
          template.subject,
          template.body,
          html
        );
      }
    }
    this.logger.log(`Inactivity check finished. ${users.length} users notified.`);
  }

  /**
   * 4-Hour Follow-Up Monitor
   * Runs every 30 minutes
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkFollowUps() {
    this.logger.log("Running follow-up recheck monitor...");
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

    // Find users who had an elevated reading (130/80 - 159/109) 4-5 hours ago
    // AND haven't logged since then
    const users = await this.prisma.userAuth.findMany({
      where: {
        isActive: true,
        bloodPressureReadings: {
          some: {
            recordedAt: { gte: fiveHoursAgo, lte: fourHoursAgo },
            OR: [
              { systolic: { gte: 130 } },
              { diastolic: { gte: 80 } },
            ],
          },
          none: {
            recordedAt: { gt: fourHoursAgo },
          },
        },
      },
      select: { id: true, email: true },
    });

    for (const user of users) {
      const template = MONITORING_TEMPLATES.FOLLOW_UP_REMINDER;
      await this.prisma.notification.create({
        data: {
          userId: user.id,
          type: NotificationType.REMINDER,
          title: template.subject,
          message: template.body,
        },
      });

      // Send Push
      await this.sendPushNotification(
        user.id,
        template.subject,
        template.body,
        { type: "FOLLOW_UP" }
      );

      // Send Email
      if (user.email) {
        const html = generateEmailHtml(
          template.subject,
          template.body,
          "Recheck BP Now",
          `${this.configService.get("FRONTEND_URL")}/bp-entry`,
          "#FF9B3E"
        );

        await this.emailService.sendEmail(
          user.email,
          template.subject,
          template.body,
          html
        );
      }
    }
  }

  /**
   * Trend Analysis Monitor - Analyzes 7 days of readings for patterns
   * Runs every day at 1 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async analyzeTrends() {
    this.logger.log("Running trend analysis...");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const users = await this.prisma.userAuth.findMany({
      where: { isActive: true },
      select: { id: true, email: true },
    });

    for (const user of users) {
      const readings = await this.prisma.bloodPressureReading.findMany({
        where: {
          userId: user.id,
          recordedAt: { gte: sevenDaysAgo },
        },
        orderBy: { recordedAt: "asc" },
      });

      if (readings.length < 3) continue;

      // 1. Creeping Rise Detection (Consistent rise over 3+ readings)
      let riseCount = 0;
      for (let i = 1; i < readings.length; i++) {
        if (readings[i].systolic > readings[i-1].systolic) riseCount++;
        else riseCount = 0;
      }
      if (riseCount >= 3) {
        await this.sendTrendAlert(user.id, TREND_ALERT_TEMPLATES.CREEPING_RISE, "CREEPING_RISE", user.email);
        continue; // Don't spam multiple trend alerts
      }

      // 2. Repeated High Readings (3+ elevated readings in a week)
      const highReadings = readings.filter(r => r.systolic >= 135 || r.diastolic >= 85);
      if (highReadings.length >= 3) {
        await this.sendTrendAlert(user.id, TREND_ALERT_TEMPLATES.REPEATED_HIGH, "REPEATED_HIGH", user.email);
        continue;
      }

      // 3. Sudden Spike Detection (Latest reading is 20% > personal average)
      const avgSystolic = readings.slice(0, -1).reduce((acc, curr) => acc + curr.systolic, 0) / (readings.length - 1);
      const latest = readings[readings.length - 1];
      if (latest.systolic > avgSystolic * 1.2) {
        await this.sendTrendAlert(user.id, TREND_ALERT_TEMPLATES.SUDDEN_SPIKE, "SUDDEN_SPIKE", user.email);
      }
    }
  }

  private async sendTrendAlert(userId: string, template: any, trendType: string, email?: string | null) {
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.BP_ALERT,
        title: template.subject,
        message: template.body,
      },
    });

    await this.sendPushNotification(
      userId,
      template.subject,
      template.body,
      { type: "TREND_ALERT", trendType }
    );

    if (email) {
      const html = generateEmailHtml(
        template.subject,
        template.body,
        "View Trends",
        `${this.configService.get("FRONTEND_URL")}/(tabs)/tracking`,
        "#FF9B3E"
      );

      await this.emailService.sendEmail(
        email,
        template.subject,
        template.body,
        html
      );
    }
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
      const html = generateEmailHtml(
        template.subject,
        `${template.body}\n\n${template.callToAction}`,
        "View Details",
        `${this.configService.get("FRONTEND_URL")}/(tabs)/tracking`,
        priority === CarePriority.EMERGENCY ? "#FF4B4B" : priority === CarePriority.URGENT_REVIEW ? "#FF9B3E" : "#2DE474"
      );

      await this.emailService.sendEmail(
        email,
        template.subject,
        `${template.body}\n\n${template.callToAction}`,
        html
      );
    }

    // Send Push
    await this.sendPushNotification(
      userId,
      template.subject,
      template.body,
      { type: "ESCALATION_ALERT", priority }
    );

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
      const html = generateEmailHtml(
        template.subject,
        message,
        "Log Now",
        `${this.configService.get("FRONTEND_URL")}/bp-entry`,
        "#FF4B4B"
      );

      await this.emailService.sendEmail(
        email,
        template.subject,
        message,
        html
      );
    }

    // Send Push
    await this.sendPushNotification(
      userId,
      template.subject,
      template.body,
      { type: "TREND_ALERT", systolic, diastolic }
    );

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
      const html = generateEmailHtml(
        template.subject,
        message,
        "Log Now",
        `${this.configService.get("FRONTEND_URL")}/bp-entry`,
        "#FF9B3E"
      );

      await this.emailService.sendEmail(
        email,
        template.subject,
        message,
        html
      );
    }

    // Send Push
    await this.sendPushNotification(
      userId,
      template.subject,
      template.body,
      { type: "TREND_ALERT", systolic, diastolic }
    );

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
      const html = generateEmailHtml(
        template.subject,
        message,
        "Open App",
        `${this.configService.get("FRONTEND_URL")}/(tabs)/tracking`,
        "#FF4B4B"
      );

      await this.emailService.sendEmail(
        email,
        template.subject,
        message,
        html
      );
    }

    // Send Push
    await this.sendPushNotification(
      userId,
      template.subject,
      template.body,
      { type: "TREND_ALERT", symptoms }
    );

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
      const html = generateEmailHtml(
        template.subject,
        message,
        "Open App",
        `${this.configService.get("FRONTEND_URL")}/(tabs)/tracking`,
        "#FF9B3E"
      );

      await this.emailService.sendEmail(
        email,
        template.subject,
        message,
        html
      );
    }

    // Send Push
    await this.sendPushNotification(
      userId,
      template.subject,
      template.body,
      { type: "TREND_ALERT", symptom }
    );

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
      const html = generateEmailHtml(
        template.subject,
        template.body,
        "Reset Password",
        resetLink,
        "#1E6BFF" // Use setup blue for auth actions
      );

      await this.emailService.sendEmail(
        email,
        template.subject,
        message,
        html
      );
    }

    // Send Push
    await this.sendPushNotification(
      userId,
      template.subject,
      template.body,
      { type: "SESSION_EXPIRY" } // Using session expiry as a proxy for generic auth actions
    );

    this.logger.log(`✅ Reset password notification handled for user ${userId}`);
  }

  /**
   * Register push token for user
   */
  async registerPushToken(userId: string, pushToken: string) {
    this.logger.log(`Registering push token for user ${userId}`);
    return this.prisma.userAuth.update({
      where: { id: userId },
      data: { pushToken },
    });
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

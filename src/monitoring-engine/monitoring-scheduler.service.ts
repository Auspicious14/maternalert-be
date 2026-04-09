import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../database/prisma.service";
import { MonitoringEngineService } from "./monitoring-engine.service";
import {
  FollowUpTaskStatus,
  FollowUpTaskType,
  MonitoringState,
} from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { UserProfileService } from "../user-profile/user-profile.service";
import { AppNotificationType } from "../common/enums/app-notification-type.enum";

@Injectable()
export class MonitoringSchedulerService {
  private readonly logger = new Logger(MonitoringSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoringEngineService: MonitoringEngineService,
    private readonly notificationsService: NotificationsService,
    private readonly userProfileService: UserProfileService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleOverdueFollowUps() {
    this.logger.log("Checking for overdue follow-up tasks...");
    const now = new Date();

    const overdueTasks = await this.prisma.followUpTask.findMany({
      where: {
        dueAt: { lt: now },
        status: FollowUpTaskStatus.PENDING,
      },
    });

    for (const task of overdueTasks) {
      await this.prisma.followUpTask.update({
        where: { id: task.id },
        data: { status: FollowUpTaskStatus.MISSED },
      });
      this.logger.warn(
        `Follow-up task ${task.id} for user ${task.userId} missed.`,
      );

      // Trigger escalation (re-evaluate monitoring state)
      const result = await this.monitoringEngineService.evaluate(task.userId);
      this.logger.log(
        `Escalated state for user ${task.userId} due to missed follow-up: ${result.state}`,
      );

      // Trigger notification
      await this.notificationsService.sendPushNotification(
        task.userId,
        "Follow-up Missed",
        `Your ${task.type} follow-up task was missed. Current state: ${result.state}.`,
        { type: AppNotificationType.FOLLOW_UP_MISSED },
      );
    }
    this.logger.log(
      `Finished checking overdue follow-up tasks. ${overdueTasks.length} tasks updated.`,
    );
  }

  @Cron("0 9 * * *") // Every day at 9 AM
  async handleInactivity() {
    this.logger.log("Checking for user inactivity...");
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const users = await this.prisma.userAuth.findMany({
      select: {
        id: true,
        bloodPressureReadings: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    });

    for (const user of users) {
      const lastBpReading = user.bloodPressureReadings[0];
      if (!lastBpReading) {
        // No BP ever logged, send initial reminder after 5 days of account creation
        try {
          const userProfile = await this.userProfileService.findByUserId(
            user.id,
          );
          if (userProfile && userProfile.createdAt < fiveDaysAgo) {
            await this.notificationsService.sendPushNotification(
              user.id,
              "BP Log Reminder",
              "You haven't logged your blood pressure yet. Please log your first reading.",
              { type: AppNotificationType.INACTIVITY_REMINDER },
            );
            this.logger.log(
              `Inactivity reminder sent to user ${user.id} (no BP ever logged).`,
            );
          }
        } catch (error) {
          // If profile not found, skip for now. Profiling is needed for notifications.
          this.logger.debug(
            `Skipping inactivity check for user ${user.id}: No profile found.`,
          );
        }
        continue;
      }

      if (lastBpReading.recordedAt < sevenDaysAgo) {
        // No BP logged in >7 days -> escalate messaging urgency
        await this.notificationsService.sendPushNotification(
          user.id,
          "Urgent BP Reminder",
          "It's been over 7 days since your last blood pressure reading. Please log it now.",
          { type: AppNotificationType.URGENT_INACTIVITY_REMINDER },
        );
        this.logger.warn(
          `Urgent inactivity reminder sent to user ${user.id} (>7 days).`,
        );
      } else if (lastBpReading.recordedAt < fiveDaysAgo) {
        // No BP logged in >5 days -> send reminder
        await this.notificationsService.sendPushNotification(
          user.id,
          "BP Log Reminder",
          "It's been over 5 days since your last blood pressure reading. Please log it soon.",
          { type: AppNotificationType.INACTIVITY_REMINDER },
        );
        this.logger.log(
          `Inactivity reminder sent to user ${user.id} (>5 days).`,
        );
      }
    }
    this.logger.log("Finished checking for user inactivity.");
  }
}

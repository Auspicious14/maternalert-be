
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class EmailScheduler {
  private readonly logger = new Logger(EmailScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Weekly BP Summary
   * Every Sunday at 8AM ('0 8 * * 0')
   */
  @Cron('0 8 * * 0')
  async sendWeeklySummaries() {
    this.logger.log('[SCHEDULER] Starting weekly BP summary generation...');
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Fetch all users who have at least one BP reading
    const users = await this.prisma.userAuth.findMany({
      where: {
        isActive: true,
        email: { not: null },
        bloodPressureReadings: { some: {} },
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            userId: true, // Just to ensure profile exists
          }
        }
      }
    });

    for (const user of users) {
      if (!user.email) continue;

      const readings = await this.prisma.bloodPressureReading.findMany({
        where: {
          userId: user.id,
          recordedAt: { gte: oneWeekAgo },
        },
      });

      if (readings.length === 0) continue;

      const totalReadings = readings.length;
      const averageSystolic = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / totalReadings);
      const averageDiastolic = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / totalReadings);
      const highReadingsCount = readings.filter(r => r.systolic >= 140 || r.diastolic >= 90).length;

      const weekStartDate = oneWeekAgo.toLocaleDateString();
      const weekEndDate = new Date().toLocaleDateString();

      // Send asynchronously
      this.emailService.sendWeeklyBPSummary(user.email, {
        averageSystolic,
        averageDiastolic,
        totalReadings,
        highReadingsCount,
        weekStartDate,
        weekEndDate,
      }).catch(err => this.logger.error(`Failed to send weekly summary to ${user.email}`, err));
    }
  }

  /**
   * Inactivity Alerts
   * Daily at 10AM ('0 10 * * *')
   */
  @Cron('0 10 * * *')
  async checkInactivity() {
    this.logger.log('[SCHEDULER] Checking for inactive users...');
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Find users who haven't logged BP in 3+ days
    // and haven't logged today
    const users = await this.prisma.userAuth.findMany({
      where: {
        isActive: true,
        email: { not: null },
        bloodPressureReadings: {
          // No readings since 3 days ago
          none: {
            recordedAt: { gte: threeDaysAgo }
          }
        }
      },
      select: {
        id: true,
        email: true,
        bloodPressureReadings: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        }
      }
    });

    for (const user of users) {
      if (!user.email) continue;

      const lastReading = user.bloodPressureReadings[0];
      if (!lastReading) continue; // Should not happen given the query but safe-guard

      const diffTime = Math.abs(new Date().getTime() - lastReading.recordedAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 3) {
        // Send asynchronously
        this.emailService.sendInactivityAlert(user.email, diffDays, 'User')
          .catch(err => this.logger.error(`Failed to send inactivity alert to ${user.email}`, err));
      }
    }
  }
}

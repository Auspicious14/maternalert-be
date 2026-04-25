import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateBloodPressureDto } from "./dto/create-blood-pressure.dto";
import { EmailService } from "../email/email.service";

/**
 * Blood Pressure Service
 *
 * CLINICAL SAFETY PRINCIPLES:
 * - Manual entry only (no device integration)
 * - Do NOT label readings as normal/abnormal
 * - Do NOT store interpretations
 * - Neutral data handling only
 *
 * RESPONSIBILITIES:
 * - Store BP readings with validation
 * - Retrieve readings for user
 * - Provide latest reading for care priority engine
 * - Query readings by date range
 */

@Injectable()
export class BloodPressureService {
  private readonly logger = new Logger(BloodPressureService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create a new blood pressure reading
   *
   * CONSTRAINTS:
   * - Systolic: 60-260 mmHg
   * - Diastolic: 40-160 mmHg
   * - No interpretation stored
   */
  async create(userId: string, createBloodPressureDto: CreateBloodPressureDto) {
    const { systolic, diastolic, recordedAt } = createBloodPressureDto;

    const reading = await this.prisma.bloodPressureReading.create({
      data: {
        userId,
        systolic,
        diastolic,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      },
    });

    this.logger.log(
      `BP reading created for user: ${userId} (${systolic}/${diastolic})`
    );

    // TRIGGER 1 — Evaluate tier and send emails asynchronously
    this.evaluateAndSendAlerts(userId, systolic, diastolic).catch((err) =>
      this.logger.error(`Failed to process BP alerts for user ${userId}`, err),
    );

    return reading;
  }

  private async evaluateAndSendAlerts(
    userId: string,
    systolic: number,
    diastolic: number,
  ) {
    const user = await this.prisma.userAuth.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            emergencyContactEmail: true,
            emergencyContactRelationship: true,
          },
        },
      },
    });

    if (!user) return;

    let tier: "Urgent" | "Critical" | null = null;
    if (systolic >= 160 || diastolic >= 110) {
      tier = "Critical";
    } else if (systolic >= 140 || diastolic >= 90) {
      tier = "Urgent";
    }

    if (tier && user.email) {
      // Send BP Alert to user
      this.emailService.sendBPAlert(user.email, { systolic, diastolic }, tier);

      // If Critical, also send to emergency contact
      if (tier === "Critical" && user.profile?.emergencyContactEmail) {
        this.emailService.sendEmergencyContactAlert(
          user.profile.emergencyContactEmail,
          user.profile.emergencyContactRelationship || "Emergency Contact",
          "MaternAlert User", // We don't have user name in UserAuth, we'd need to fetch it from profile if it exists, but UserProfile schema doesn't have name
          { systolic, diastolic },
        );
      }
    }
  }

  /**
   * Get all BP readings for a user
   *
   * @param userId - User ID
   * @param limit - Optional limit (default: 50)
   * @returns Array of BP readings, newest first
   */
  async findByUserId(userId: string, limit: number = 50) {
    const readings = await this.prisma.bloodPressureReading.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });

    return readings;
  }

  /**
   * Get latest BP reading for a user
   *
   * Used by care priority engine
   */
  async getLatestReading(userId: string) {
    const reading = await this.prisma.bloodPressureReading.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    });

    return reading;
  }

  /**
   * Get BP readings within a date range
   *
   * @param userId - User ID
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Array of BP readings in range
   */
  async getReadingsInRange(userId: string, startDate: Date, endDate: Date) {
    const readings = await this.prisma.bloodPressureReading.findMany({
      where: {
        userId,
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { recordedAt: "desc" },
    });

    return readings;
  }

  /**
   * Get readings from last N hours
   *
   * Used by care priority engine to check recent trends
   */
  async getRecentReadings(userId: string, hours: number = 48) {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const readings = await this.prisma.bloodPressureReading.findMany({
      where: {
        userId,
        recordedAt: {
          gte: cutoffDate,
        },
      },
      orderBy: { recordedAt: "desc" },
    });

    return readings;
  }

  /**
   * Delete a BP reading
   */
  async delete(id: string, userId: string) {
    // Ensure user owns the reading
    const reading = await this.prisma.bloodPressureReading.findFirst({
      where: { id, userId },
    });

    if (!reading) {
      throw new Error("Reading not found or unauthorized");
    }

    await this.prisma.bloodPressureReading.delete({
      where: { id },
    });

    this.logger.log(`BP reading deleted: ${id}`);

    return { message: "Reading deleted successfully" };
  }
}

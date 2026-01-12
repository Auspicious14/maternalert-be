import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateBloodPressureDto } from "./dto/create-blood-pressure.dto";

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

  constructor(private readonly prisma: PrismaService) {}

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

    return reading;
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

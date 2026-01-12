import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateSymptomDto } from "./dto/create-symptom.dto";
import { SymptomType } from "@prisma/client";

/**
 * Symptoms Service
 *
 * CLINICAL SAFETY PRINCIPLES:
 * - Atomic recording (one symptom per record)
 * - No severity levels
 * - No numeric scoring
 * - No interpretation or diagnosis
 *
 * RESPONSIBILITIES:
 * - Record individual symptoms
 * - Retrieve symptoms for user
 * - Provide recent symptoms for care priority engine
 * - Query symptoms by type and date range
 */

@Injectable()
export class SymptomsService {
  private readonly logger = new Logger(SymptomsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record a new symptom
   *
   * CONSTRAINTS:
   * - Enumerated symptom types only
   * - No severity or scoring
   * - Each symptom is a separate record
   */
  async create(userId: string, createSymptomDto: CreateSymptomDto) {
    const { symptomType, recordedAt } = createSymptomDto;

    const symptom = await this.prisma.symptomRecord.create({
      data: {
        userId,
        symptomType,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      },
    });

    this.logger.log(`Symptom recorded for user: ${userId} (${symptomType})`);

    return symptom;
  }

  /**
   * Get all symptoms for a user
   *
   * @param userId - User ID
   * @param limit - Optional limit (default: 100)
   * @returns Array of symptom records, newest first
   */
  async findByUserId(userId: string, limit: number = 100) {
    const symptoms = await this.prisma.symptomRecord.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });

    return symptoms;
  }

  /**
   * Get symptoms from last N hours
   *
   * Used by care priority engine to check recent symptoms
   *
   * @param userId - User ID
   * @param hours - Number of hours to look back (default: 48)
   * @returns Array of recent symptom records
   */
  async getRecentSymptoms(userId: string, hours: number = 48) {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const symptoms = await this.prisma.symptomRecord.findMany({
      where: {
        userId,
        recordedAt: {
          gte: cutoffDate,
        },
      },
      orderBy: { recordedAt: "desc" },
    });

    return symptoms;
  }

  /**
   * Get symptoms by type
   *
   * @param userId - User ID
   * @param symptomType - Symptom type to filter by
   * @param limit - Optional limit
   * @returns Array of symptom records of specified type
   */
  async getSymptomsByType(
    userId: string,
    symptomType: SymptomType,
    limit: number = 50
  ) {
    const symptoms = await this.prisma.symptomRecord.findMany({
      where: {
        userId,
        symptomType,
      },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });

    return symptoms;
  }

  /**
   * Get symptoms within a date range
   *
   * @param userId - User ID
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Array of symptom records in range
   */
  async getSymptomsInRange(userId: string, startDate: Date, endDate: Date) {
    const symptoms = await this.prisma.symptomRecord.findMany({
      where: {
        userId,
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { recordedAt: "desc" },
    });

    return symptoms;
  }

  /**
   * Check for dangerous symptom combinations
   *
   * Used by care priority engine
   * Returns true if dangerous combinations are present in recent symptoms
   */
  async hasDangerousCombinations(
    userId: string,
    hours: number = 48
  ): Promise<boolean> {
    const recentSymptoms = await this.getRecentSymptoms(userId, hours);
    const symptomTypes = new Set(recentSymptoms.map((s: any) => s.symptomType));

    // Dangerous combinations (examples - will be refined in care priority engine)
    const dangerousCombos = [
      [SymptomType.HEADACHE, SymptomType.BLURRED_VISION],
      [SymptomType.UPPER_ABDOMINAL_PAIN, SymptomType.NAUSEA_VOMITING],
      [SymptomType.SWELLING, SymptomType.REDUCED_URINE],
    ];

    for (const combo of dangerousCombos) {
      if (combo.every((symptom) => symptomTypes.has(symptom))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Delete a symptom record
   */
  async delete(id: string, userId: string) {
    // Ensure user owns the symptom
    const symptom = await this.prisma.symptomRecord.findFirst({
      where: { id, userId },
    });

    if (!symptom) {
      throw new Error("Symptom not found or unauthorized");
    }

    await this.prisma.symptomRecord.delete({
      where: { id },
    });

    this.logger.log(`Symptom deleted: ${id}`);

    return { message: "Symptom deleted successfully" };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BloodPressureService } from '../blood-pressure/blood-pressure.service';
import { SymptomsService } from '../symptoms/symptoms.service';
import { UserProfileService } from '../user-profile/user-profile.service';
import {
  MonitoringState,
  FollowUpTaskType,
  FollowUpTaskStatus,
  SymptomType,
} from '@prisma/client';

@Injectable()
export class MonitoringEngineService {
  private readonly logger = new Logger(MonitoringEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bloodPressureService: BloodPressureService,
    private readonly symptomsService: SymptomsService,
    private readonly userProfileService: UserProfileService,
  ) {}

  async evaluate(userId: string) {
    const now = new Date();
    let currentState: MonitoringState = MonitoringState.NORMAL;
    let reason: string | null = null;
    let nextAction: string | null = null;
    let followUpTask = null;

    // 1. Aggregate historical data
    const last48Hours = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const last72Hours = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    const recentBPs = await this.bloodPressureService.getRecentReadings(
      userId,
      48,
    );
    const latestBP = recentBPs.length > 0 ? recentBPs[0] : null;
    const recentSymptoms = await this.symptomsService.getRecentSymptoms(
      userId,
      72,
    );
    const symptomTypes = new Set(recentSymptoms.map((s) => s.symptomType));

    // 2. Detect patterns (TREND ENGINE)
    // Rule B: Severe BP
    if (latestBP && (latestBP.systolic >= 160 || latestBP.diastolic >= 110)) {
      currentState = MonitoringState.EMERGENCY;
      reason = 'Severe blood pressure reading detected.';
      nextAction = 'Seek immediate medical attention.';
    }

    // Rule C: BP + symptom combination
    if (
      latestBP &&
      (latestBP.systolic >= 140 || latestBP.diastolic >= 90) &&
      (symptomTypes.has(SymptomType.HEADACHE) ||
        symptomTypes.has(SymptomType.BLURRED_VISION) ||
        symptomTypes.has(SymptomType.UPPER_ABDOMINAL_PAIN))
    ) {
      currentState = MonitoringState.EMERGENCY;
      reason = 'Elevated blood pressure with severe symptoms.';
      nextAction = 'Seek immediate medical attention.';
    }

    // If already EMERGENCY, we stop here for escalation
    if (currentState === MonitoringState.EMERGENCY) {
      await this.updateMonitoringState(userId, currentState, reason);
      return {
        state: currentState,
        message: reason,
        nextAction,
        followUp: null,
      };
    }

    // Rule A: Repeated high BP (>=3 readings where systolic >=140 OR diastolic >=90 within 48h)
    const elevatedReadings = recentBPs.filter(
      (bp) => bp.systolic >= 140 || bp.diastolic >= 90,
    );
    if (elevatedReadings.length >= 3) {
      currentState = MonitoringState.URGENT;
      reason = 'Repeated high blood pressure readings within 48 hours.';
      nextAction = 'Contact your healthcare provider within 24 hours.';
    }

    // Rule D: Rising trend (basic version) - last 3 readings show increasing systolic or diastolic
    if (recentBPs.length >= 3) {
      const sortedBPs = recentBPs
        .slice(0, 3)
        .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime()); // Oldest first

      const isSystolicRising =
        sortedBPs[0].systolic < sortedBPs[1].systolic &&
        sortedBPs[1].systolic < sortedBPs[2].systolic;
      const isDiastolicRising =
        sortedBPs[0].diastolic < sortedBPs[1].diastolic &&
        sortedBPs[1].diastolic < sortedBPs[2].diastolic;

      if (isSystolicRising || isDiastolicRising) {
        // Cast to avoid TS narrowing issues when comparing against the "current" state
        const checkState = currentState as MonitoringState;
        if (checkState === MonitoringState.NORMAL) {
          currentState = MonitoringState.MONITOR;
          reason = 'Rising trend in blood pressure detected.';
          nextAction = 'Continue monitoring closely.';
        } else if (checkState === MonitoringState.MONITOR) {
          currentState = MonitoringState.URGENT;
          reason = 'Significant rising trend in blood pressure detected.';
          nextAction = 'Contact your healthcare provider within 24 hours.';
        }
      }
    }

    // Initial high reading (NORMAL -> MONITOR)
    if (
      (currentState as MonitoringState) === MonitoringState.NORMAL &&
      latestBP &&
      (latestBP.systolic >= 140 || latestBP.diastolic >= 90)
    ) {
      currentState = MonitoringState.MONITOR;
      reason = 'First elevated blood pressure reading.';
      nextAction = 'Recheck your blood pressure in 4 hours.';
    }

    // 3. Introduce STATE MACHINE & 4. STATE TRANSITIONS
    const previousStateRecord = await this.prisma.monitoringStateRecord.findUnique(
      {
        where: { userId },
      },
    );

    if (previousStateRecord) {
      // Transition from Any -> NORMAL (after consistent normal readings)
      // This is a simplified check. A more robust solution would involve checking a longer history of normal readings.
      const checkState = currentState as MonitoringState;
      if (
        previousStateRecord.currentState !== MonitoringState.NORMAL &&
        checkState === MonitoringState.NORMAL &&
        recentBPs.every((bp) => bp.systolic < 140) &&
        recentBPs.every((bp) => bp.diastolic < 90) &&
        recentSymptoms.length === 0
      ) {
        currentState = MonitoringState.NORMAL;
        reason = 'Consistent normal readings and no concerning symptoms.';
        nextAction = 'Continue routine monitoring.';
      }
    }

    // 5. FOLLOW-UP SYSTEM (CRITICAL)
    // When BP >= 140/90: Create RECHECK task: dueAt = now + 4 hours
    if (
      latestBP &&
      (latestBP.systolic >= 140 || latestBP.diastolic >= 90) &&
      (currentState as MonitoringState) !== MonitoringState.EMERGENCY
    ) {
      followUpTask = await this.createFollowUpTask(
        userId,
        FollowUpTaskType.RECHECK,
        new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
        latestBP.id,
      );
      nextAction = 'Please recheck your blood pressure in 4 hours.';
    }

    // When state = URGENT: Create SEEK_CARE task: dueAt = now + 24 hours
    if ((currentState as MonitoringState) === MonitoringState.URGENT) {
      followUpTask = await this.createFollowUpTask(
        userId,
        FollowUpTaskType.SEEK_CARE,
        new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
        latestBP?.id, // Link to the latest BP if available
      );
      nextAction = 'Contact your healthcare provider within 24 hours.';
    }

    await this.updateMonitoringState(userId, currentState, reason);

    return {
      state: currentState,
      message: reason,
      nextAction,
      followUp: followUpTask,
    };
  }

  async getMonitoringState(userId: string) {
    return this.prisma.monitoringStateRecord.findUnique({
      where: { userId },
    });
  }

  async getPendingFollowUpTasks(userId: string) {
    return this.prisma.followUpTask.findMany({
      where: {
        userId,
        status: FollowUpTaskStatus.PENDING,
      },
      orderBy: {
        dueAt: 'asc',
      },
    });
  }

  async completeFollowUpTask(taskId: string) {
    return this.prisma.followUpTask.update({
      where: { id: taskId },
      data: { status: FollowUpTaskStatus.COMPLETED },
    });
  }

  private async updateMonitoringState(
    userId: string,
    newState: MonitoringState,
    reason: string | null,
  ) {
    return this.prisma.monitoringStateRecord.upsert({
      where: { userId },
      update: {
        currentState: newState,
        reason,
        lastUpdatedAt: new Date(),
      },
      create: {
        userId,
        currentState: newState,
        reason,
        lastUpdatedAt: new Date(),
      },
    });
  }

  private async createFollowUpTask(
    userId: string,
    type: FollowUpTaskType,
    dueAt: Date,
    relatedReadingId?: string,
  ) {
    // Check for existing pending tasks of the same type to avoid duplicates
    const existingTask = await this.prisma.followUpTask.findFirst({
      where: {
        userId,
        type,
        status: FollowUpTaskStatus.PENDING,
      },
    });

    if (existingTask) {
      // Update existing task if dueAt is earlier, or if it's a RECHECK and relatedReadingId is different
      if (
        existingTask.dueAt > dueAt ||
        (type === FollowUpTaskType.RECHECK &&
          existingTask.relatedReadingId !== relatedReadingId)
      ) {
        return this.prisma.followUpTask.update({
          where: { id: existingTask.id },
          data: { dueAt, relatedReadingId },
        });
      }
      return existingTask; // Return existing task if no update is needed
    }

    return this.prisma.followUpTask.create({
      data: {
        userId,
        type,
        dueAt,
        relatedReadingId,
      },
    });
  }
}

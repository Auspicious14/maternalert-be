import { Module } from '@nestjs/common';
import { MonitoringEngineService } from './monitoring-engine.service';
import { MonitoringEngineController } from './monitoring-engine.controller';
import { PrismaService } from '../database/prisma.service';
import { BloodPressureService } from '../blood-pressure/blood-pressure.service';
import { SymptomsService } from '../symptoms/symptoms.service';
import { UserProfileService } from '../user-profile/user-profile.service';
import { MonitoringSchedulerService } from './monitoring-scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [NotificationsModule, UserProfileModule, ScheduleModule.forRoot()],
  providers: [
    MonitoringEngineService,
    PrismaService,
    BloodPressureService,
    SymptomsService,
    UserProfileService,
    MonitoringSchedulerService,
  ],
  controllers: [MonitoringEngineController],
  exports: [MonitoringEngineService],
})
export class MonitoringEngineModule {}

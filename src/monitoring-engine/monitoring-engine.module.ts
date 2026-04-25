import { Module, forwardRef } from '@nestjs/common';
import { MonitoringEngineService } from './monitoring-engine.service';
import { MonitoringEngineController } from './monitoring-engine.controller';
import { MonitoringSchedulerService } from './monitoring-scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { BloodPressureModule } from '../blood-pressure/blood-pressure.module';
import { SymptomsModule } from '../symptoms/symptoms.module';

@Module({
  imports: [
    NotificationsModule,
    UserProfileModule,
    forwardRef(() => BloodPressureModule),
    SymptomsModule,
  ],
  providers: [
    MonitoringEngineService,
    MonitoringSchedulerService,
  ],
  controllers: [MonitoringEngineController],
  exports: [MonitoringEngineService],
})
export class MonitoringEngineModule {}

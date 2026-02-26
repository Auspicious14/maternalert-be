import { Module, forwardRef } from "@nestjs/common";
import { CarePriorityService } from "./care-priority.service";
import { CarePriorityController } from "./care-priority.controller";
import { BloodPressureModule } from "../blood-pressure/blood-pressure.module";
import { SymptomsModule } from "../symptoms/symptoms.module";
import { UserProfileModule } from "../user-profile/user-profile.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { HealthAssessmentService } from "./health-assessment.service";

@Module({
  imports: [
    forwardRef(() => BloodPressureModule),
    forwardRef(() => SymptomsModule),
    UserProfileModule,
    NotificationsModule,
  ],
  controllers: [CarePriorityController],
  providers: [CarePriorityService, HealthAssessmentService],
  exports: [CarePriorityService, HealthAssessmentService],
})
export class CarePriorityModule {}

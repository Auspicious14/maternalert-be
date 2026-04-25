import { Module, forwardRef } from "@nestjs/common";
import { BloodPressureController } from "./blood-pressure.controller";
import { BloodPressureService } from "./blood-pressure.service";
import { MonitoringEngineModule } from "../monitoring-engine/monitoring-engine.module";
import { CarePriorityModule } from "../care-priority/care-priority.module";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [forwardRef(() => MonitoringEngineModule), forwardRef(() => CarePriorityModule), EmailModule],
  controllers: [BloodPressureController],
  providers: [BloodPressureService],
  exports: [BloodPressureService],
})
export class BloodPressureModule {}

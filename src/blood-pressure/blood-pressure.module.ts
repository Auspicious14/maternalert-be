import { Module, forwardRef } from "@nestjs/common";
import { BloodPressureController } from "./blood-pressure.controller";
import { BloodPressureService } from "./blood-pressure.service";
import { MonitoringEngineModule } from "../monitoring-engine/monitoring-engine.module";
import { CarePriorityModule } from "../care-priority/care-priority.module";

@Module({
  imports: [MonitoringEngineModule, forwardRef(() => CarePriorityModule)],
  controllers: [BloodPressureController],
  providers: [BloodPressureService],
  exports: [BloodPressureService],
})
export class BloodPressureModule {}

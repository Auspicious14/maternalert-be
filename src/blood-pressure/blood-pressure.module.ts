import { Module, forwardRef } from "@nestjs/common";
import { BloodPressureController } from "./blood-pressure.controller";
import { BloodPressureService } from "./blood-pressure.service";
import { MonitoringEngineModule } from "../monitoring-engine/monitoring-engine.module";

@Module({
  imports: [MonitoringEngineModule],
  controllers: [BloodPressureController],
  providers: [BloodPressureService],
  exports: [BloodPressureService],
})
export class BloodPressureModule {}

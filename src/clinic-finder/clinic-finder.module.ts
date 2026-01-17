import { Module } from "@nestjs/common";
import { ClinicFinderController } from "./clinic-finder.controller";
import { ClinicFinderService } from "./clinic-finder.service";

@Module({
  controllers: [ClinicFinderController],
  providers: [ClinicFinderService],
  exports: [ClinicFinderService],
})
export class ClinicFinderModule {}


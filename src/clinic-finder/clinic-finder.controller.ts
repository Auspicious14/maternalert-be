import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { ClinicFinderService } from "./clinic-finder.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("clinic-finder")
@UseGuards(JwtAuthGuard)
export class ClinicFinderController {
  constructor(private readonly clinicFinderService: ClinicFinderService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query("city") city?: string) {
    if (city) {
      return this.clinicFinderService.findByCity(city);
    }

    return this.clinicFinderService.findAll();
  }
}


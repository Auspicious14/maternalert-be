import { Injectable } from "@nestjs/common";
import { CLINIC_LOCATIONS, ClinicLocation } from "./data/clinics.data";

@Injectable()
export class ClinicFinderService {
  findAll(): ClinicLocation[] {
    return CLINIC_LOCATIONS;
  }

  findByCity(city: string): ClinicLocation[] {
    const normalized = city.trim().toLowerCase();

    return CLINIC_LOCATIONS.filter(
      (clinic) => clinic.city.toLowerCase() === normalized
    );
  }
}


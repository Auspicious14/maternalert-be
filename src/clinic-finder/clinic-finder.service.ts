import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { CLINIC_LOCATIONS, ClinicLocation } from "./data/clinics.data";

@Injectable()
export class ClinicFinderService {
  private readonly logger = new Logger(ClinicFinderService.name);
  private readonly overpassUrl = "https://overpass-api.de/api/interpreter";

  async findNearby(
    lat: number,
    lng: number,
    radius: number = 5000
  ): Promise<ClinicLocation[]> {
    try {
      this.logger.log(`Searching for hospitals near ${lat}, ${lng} within ${radius}m using Overpass API`);
      
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          way["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="clinic"](around:${radius},${lat},${lng});
          way["amenity"="clinic"](around:${radius},${lat},${lng});
        );
        out center;
      `;

      const response = await axios.post(this.overpassUrl, `data=${encodeURIComponent(query)}`);

      if (response.data && response.data.elements) {
        return response.data.elements.map((element: any) => ({
          id: element.id.toString(),
          name: element.tags.name || "Unnamed Hospital",
          latitude: element.lat || element.center?.lat,
          longitude: element.lon || element.center?.lon,
          address: element.tags["addr:street"] 
            ? `${element.tags["addr:housenumber"] || ""} ${element.tags["addr:street"]}`.trim()
            : "Address not available",
          city: element.tags["addr:city"] || "Detected",
          country: "Nigeria",
          phone: element.tags.phone || element.tags["contact:phone"] || "Contact via Maps",
          isEmergency: element.tags.amenity === "hospital",
        }));
      }

      return [];
    } catch (error: any) {
      this.logger.error(`Failed to fetch nearby hospitals from Overpass: ${error.message}`);
      return this.findAll(); // Fallback to seed data on error
    }
  }

  findAll(): ClinicLocation[] {
    return CLINIC_LOCATIONS;
  }

  findByCity(city: string): ClinicLocation[] {
    const normalized = city.trim().toLowerCase();

    // If city is "Ikeja", include "Lagos" clinics as well, as Ikeja is part of Lagos
    const isIkeja = normalized === "ikeja";

    return CLINIC_LOCATIONS.filter((clinic) => {
      const clinicCity = clinic.city.toLowerCase();
      if (isIkeja) {
        return clinicCity === "ikeja" || clinicCity === "lagos";
      }
      return clinicCity === normalized;
    });
  }
}


export interface ClinicLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  phone?: string;
  isEmergency?: boolean;
}

export const CLINIC_LOCATIONS: ClinicLocation[] = [
  {
    id: "lagos-luth",
    name: "Lagos University Teaching Hospital",
    latitude: 6.5069,
    longitude: 3.3673,
    address: "Ishaga Road, Idi-Araba, Surulere",
    city: "Lagos",
    country: "Nigeria",
    phone: "+234-1-877-7000",
    isEmergency: true,
  },
  {
    id: "lagos-island-maternity",
    name: "Island Maternity Hospital",
    latitude: 6.4513,
    longitude: 3.3940,
    address: "Broad Street, Lagos Island",
    city: "Lagos",
    country: "Nigeria",
    phone: "+234-1-264-3018",
    isEmergency: true,
  },
  {
    id: "abuja-national-hospital",
    name: "National Hospital Abuja",
    latitude: 9.0360,
    longitude: 7.4899,
    address: "Plot 132 Central District (Phase II), Garki",
    city: "Abuja",
    country: "Nigeria",
    phone: "+234-9-234-0940",
    isEmergency: true,
  },
  {
    id: "abuja-nyanya-general",
    name: "Nyanya General Hospital",
    latitude: 8.9953,
    longitude: 7.6207,
    address: "Nyanya",
    city: "Abuja",
    country: "Nigeria",
    phone: "+234-9-123-4567",
    isEmergency: false,
  },
];


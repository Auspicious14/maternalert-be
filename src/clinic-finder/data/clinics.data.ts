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
  {
    id: "ikeja-lasuth",
    name: "Lagos State University Teaching Hospital (LASUTH)",
    latitude: 6.5962,
    longitude: 3.3514,
    address: "1-5 Oba Akinjobi Way, Ikeja",
    city: "Ikeja",
    country: "Nigeria",
    phone: "+234-1-493-4500",
    isEmergency: true,
  },
  {
    id: "ikeja-medical-centre",
    name: "Ikeja Medical Centre",
    latitude: 6.6015,
    longitude: 3.3421,
    address: "11-15 Olufemi Road, Ikeja",
    city: "Ikeja",
    country: "Nigeria",
    phone: "+234-1-497-2345",
    isEmergency: true,
  },
  {
    id: "reddington-hospital-ikeja",
    name: "Reddington Hospital Ikeja",
    latitude: 6.5921,
    longitude: 3.3587,
    address: "12 Isaac John St, GRA, Ikeja",
    city: "Ikeja",
    country: "Nigeria",
    phone: "+234-1-271-5341",
    isEmergency: true,
  },
  {
    id: "eunice-clinic-ikeja",
    name: "Eunice Clinic & Hospital",
    latitude: 6.6054,
    longitude: 3.3489,
    address: "24 Allen Ave, Ikeja",
    city: "Ikeja",
    country: "Nigeria",
    phone: "+234-803-123-4567",
    isEmergency: false,
  },
  {
    id: "nicholas-hospital-ikeja",
    name: "St. Nicholas Hospital Ikeja",
    latitude: 6.5901,
    longitude: 3.3602,
    address: "7b Maryland Est, Ikeja",
    city: "Ikeja",
    country: "Nigeria",
    phone: "+234-1-280-5000",
    isEmergency: true,
  },
  {
    id: "blue-cross-ikeja",
    name: "Blue Cross Hospital",
    latitude: 6.6123,
    longitude: 3.3345,
    address: "14 Ogba Road, Ikeja",
    city: "Ikeja",
    country: "Nigeria",
    phone: "+234-1-492-3456",
    isEmergency: false,
  },
];


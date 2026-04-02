import type { ParkingSpotResponse } from "../api/parking";

// Hard-coded sample parking data for demonstration
export const SAMPLE_PARKING_SPOTS: ParkingSpotResponse[] = [
  {
    id: 1,
    name: "Downtown Parking Garage",
    address: "123 Ste-Catherine St W, Montreal",
    latitude: 45.5017,
    longitude: -73.5673,
    parkingType: "GARAGE",
    totalSpots: 200,
    availableSpots: 45,
    pricePerHour: 4.50,
    status: "AVAILABLE",
    operatingHours: "24/7",
    hasEvCharging: true,
    hasDisabledAccess: true,
  },
  {
    id: 2,
    name: "McGill Street Parking",
    address: "800 McGill St, Montreal",
    latitude: 45.5048,
    longitude: -73.5572,
    parkingType: "STREET",
    totalSpots: 30,
    availableSpots: 8,
    pricePerHour: 3.00,
    status: "AVAILABLE",
    operatingHours: "6:00 AM - 11:00 PM",
    hasEvCharging: false,
    hasDisabledAccess: true,
  },
  {
    id: 3,
    name: "Old Port Parking Lot",
    address: "333 de la Commune St W, Montreal",
    latitude: 45.5075,
    longitude: -73.5545,
    parkingType: "LOT",
    totalSpots: 150,
    availableSpots: 0,
    pricePerHour: 5.00,
    status: "OCCUPIED",
    operatingHours: "7:00 AM - 12:00 AM",
    hasEvCharging: true,
    hasDisabledAccess: true,
  },
  {
    id: 4,
    name: "Place des Arts Garage",
    address: "175 Ste-Catherine St W, Montreal",
    latitude: 45.5081,
    longitude: -73.5668,
    parkingType: "GARAGE",
    totalSpots: 300,
    availableSpots: 120,
    pricePerHour: 6.00,
    status: "AVAILABLE",
    operatingHours: "24/7",
    hasEvCharging: true,
    hasDisabledAccess: true,
  },
  {
    id: 5,
    name: "Plateau Street Parking",
    address: "4000 St-Denis St, Montreal",
    latitude: 45.5225,
    longitude: -73.5816,
    parkingType: "STREET",
    totalSpots: 20,
    availableSpots: 3,
    pricePerHour: 2.50,
    status: "AVAILABLE",
    operatingHours: "8:00 AM - 9:00 PM",
    hasEvCharging: false,
    hasDisabledAccess: false,
  },
  {
    id: 6,
    name: "Central Station Lot",
    address: "895 de la Gauchetière St W, Montreal",
    latitude: 45.4998,
    longitude: -73.5671,
    parkingType: "LOT",
    totalSpots: 100,
    availableSpots: 25,
    pricePerHour: 4.00,
    status: "AVAILABLE",
    operatingHours: "5:00 AM - 1:00 AM",
    hasEvCharging: false,
    hasDisabledAccess: true,
  },
];

export interface ParkingUtilizationByCity {
  city: string;
  totalSpots: number;
  availableSpots: number;
  utilizationPercent: number;
}

function extractCityFromAddress(address: string | undefined): string {
  if (!address) return "Unknown";
  const s = address.trim();
  if (!s) return "Unknown";
  // Common format: "Street, City, Province" -> take City (second last)
  const parts = s.split(",");
  if (parts.length >= 2) {
    const candidate = parts[Math.max(0, parts.length - 2)].trim();
    if (candidate) {
      return titleCase(candidate);
    }
  }
  return "Unknown";
}

function titleCase(input: string): string {
  const s = input.trim().toLowerCase();
  if (!s) return "Unknown";
  return s
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function computeParkingUtilizationByCity(
  spots: ParkingSpotResponse[]
): ParkingUtilizationByCity[] {
  interface CityAgg {
    total: number;
    available: number;
  }

  const byCity: Record<string, CityAgg> = {};

  for (const spot of spots) {
    const city = extractCityFromAddress(spot.address);
    if (!byCity[city]) {
      byCity[city] = { total: 0, available: 0 };
    }
    byCity[city].total += Math.max(0, spot.totalSpots ?? 0);
    byCity[city].available += Math.max(0, spot.availableSpots ?? 0);
  }

  const result: ParkingUtilizationByCity[] = [];
  for (const [city, agg] of Object.entries(byCity)) {
    const total = agg.total;
    const available = agg.available;
    const utilization =
      total <= 0 ? 0 : ((1 - available / total) * 100);
    const utilizationPercent = Math.round(utilization * 10) / 10;
    result.push({
      city,
      totalSpots: total,
      availableSpots: available,
      utilizationPercent,
    });
  }

  result.sort((a, b) => b.utilizationPercent - a.utilizationPercent);
  return result;
}

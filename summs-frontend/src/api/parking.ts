import { API_BASE_URL } from "./config";

export interface ParkingSpotResponse {
  id?: number;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  parkingType?: string;
  totalSpots?: number;
  availableSpots?: number;
  pricePerHour?: number;
  status?: string;
  operatingHours?: string;
  hasEvCharging?: boolean;
  hasDisabledAccess?: boolean;
}

export async function fetchParkingSpots(
  type?: string,
  availableOnly?: boolean
): Promise<ParkingSpotResponse[]> {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  if (availableOnly) params.availableOnly = "true";

  const response = await fetch(
    `${API_BASE_URL}/api/parking?${new URLSearchParams(params)}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch parking spots");
  }
  
  return response.json();
}

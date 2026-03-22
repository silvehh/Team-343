import { API_BASE_URL } from "./config";

export interface TransitRouteResponse {
  id?: number;
  routeNumber?: string;
  routeName?: string;
  transitType?: string;
  startStation?: string;
  endStation?: string;
  frequencyMinutes?: number;
  currentDelayMinutes?: number;
  currentCapacityPercent?: number;
  reliabilityScore?: number;
  operatingHours?: string;
  isActive?: boolean;
}

export interface TransitStopResponse {
  id?: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  routeId?: number;
  routeNumber?: string;
  stopOrder?: number;
  nextArrival?: string;
}

export async function fetchTransitRoutes(
  type?: string,
  activeOnly?: boolean
): Promise<TransitRouteResponse[]> {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  if (activeOnly) params.activeOnly = "true";

  const response = await fetch(
    `${API_BASE_URL}/api/transit/routes?${new URLSearchParams(params)}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch transit routes");
  }
  
  return response.json();
}

export async function fetchTransitStops(routeId: number): Promise<TransitStopResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/transit/routes/${routeId}/stops`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch transit stops");
  }
  
  return response.json();
}

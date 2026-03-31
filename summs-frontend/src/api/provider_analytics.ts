import { API_BASE_URL } from "./config";

export interface RevenueResponse {
  totalRevenue: number;
  carRevenue: number;
  bikeRevenue: number;
  scooterRevenue: number;
}

export interface FleetUtilizationResponse {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  availabilityRate: number;
  availableCars: number;
  availableBikes: number;
  availableScooters: number;
  rentedCars: number;
  rentedBikes: number;
  rentedScooters: number;
}

export interface RentalActivityResponse {
  completedRentals: number;
  activeRentals: number;
  completedCarRentals: number;
  completedBikeRentals: number;
  completedScooterRentals: number;
  averageRentalDurationMinutes: number;
  bikeToScooterRatioIfMultiType: number;
}

export interface EfficiencyMetricsResponse {
  averageRevenuePerRental: number;
  averageCarRentalRevenue: number;
  averageBikeRentalRevenue: number;
  averageScooterRentalRevenue: number;
  revenuePerVehicle: number;
  averageRentalFrequencyPerVehicle: number;
  carRevenuePercentage: number;
  bikeRevenuePercentage: number;
  scooterRevenuePercentage: number;
}

export interface ProviderAnalyticsSummaryResponse {
  revenue: RevenueResponse;
  fleetUtilization: FleetUtilizationResponse;
  rentalActivity: RentalActivityResponse;
  efficiencyMetrics: EfficiencyMetricsResponse;
  generatedAt: string;
}

function providerHeaders(providerId: number): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Account-Type": "MOBILITY_PROVIDER",
    "X-User-Id": String(providerId),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchProviderAnalyticsSummary(
  providerId: number,
): Promise<ProviderAnalyticsSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/provider/analytics/summary`, {
    headers: providerHeaders(providerId),
  });
  return handleResponse<ProviderAnalyticsSummaryResponse>(response);
}

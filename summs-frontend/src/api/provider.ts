import { API_BASE_URL } from "./config";

export interface ProviderVehicleRequest {
  vehicleType: string;
  stationId: number;
  pricePerHour: number;
}

export interface ProviderVehicleResponse {
  id: number;
  vehicleType: string;
  providerName: string;
  providerId: number;
  pricePerHour: number;
  stationId: number | null;
  stationName: string | null;
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

export async function fetchProviderVehicles(providerId: number): Promise<ProviderVehicleResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/provider/vehicles`, {
    headers: providerHeaders(providerId),
  });
  return handleResponse<ProviderVehicleResponse[]>(response);
}

export async function addProviderVehicle(
  providerId: number,
  body: ProviderVehicleRequest,
): Promise<ProviderVehicleResponse> {
  const response = await fetch(`${API_BASE_URL}/api/provider/vehicles`, {
    method: "POST",
    headers: providerHeaders(providerId),
    body: JSON.stringify(body),
  });
  return handleResponse<ProviderVehicleResponse>(response);
}

export async function updateProviderVehicle(
  providerId: number,
  vehicleId: number,
  body: ProviderVehicleRequest,
): Promise<ProviderVehicleResponse> {
  const response = await fetch(`${API_BASE_URL}/api/provider/vehicles/${vehicleId}`, {
    method: "PUT",
    headers: providerHeaders(providerId),
    body: JSON.stringify(body),
  });
  return handleResponse<ProviderVehicleResponse>(response);
}

export async function deleteProviderVehicle(providerId: number, vehicleId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/provider/vehicles/${vehicleId}`, {
    method: "DELETE",
    headers: providerHeaders(providerId),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }
}

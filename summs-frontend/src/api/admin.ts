import createClient from "openapi-fetch";
import type { paths, components } from "./types";
import { API_BASE_URL } from "./config";
import { handleApiError } from "./api_error";

export type StationRequest = components["schemas"]["StationRequest"];
export type StationResponse = components["schemas"]["StationResponse"];

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
});

const ADMIN_PARAMS_HEADER = { "X-Account-Type": "ADMIN" } as const;

export async function fetchAdminStations(): Promise<StationResponse[]> {
  const { data, error } = await client.GET("/api/admin/stations", {
    params: { header: ADMIN_PARAMS_HEADER },
  });
  if (error) handleApiError(error);
  return data as StationResponse[];
}

export async function createStation(body: StationRequest): Promise<StationResponse> {
  const { data, error } = await client.POST("/api/admin/stations", {
    params: { header: ADMIN_PARAMS_HEADER },
    body,
  });
  if (error) handleApiError(error);
  return data as StationResponse;
}

export async function updateStation(id: number, body: StationRequest): Promise<StationResponse> {
  const { data, error } = await client.PUT("/api/admin/stations/{id}", {
    params: { path: { id }, header: ADMIN_PARAMS_HEADER },
    body,
  });
  if (error) handleApiError(error);
  return data as StationResponse;
}

export async function deleteStation(id: number): Promise<void> {
  const { error } = await client.DELETE("/api/admin/stations/{id}", {
    params: { path: { id }, header: ADMIN_PARAMS_HEADER },
  });
  if (error) handleApiError(error);
}

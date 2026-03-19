import createClient from "openapi-fetch";
import type { paths, components } from "./types";
import { API_BASE_URL } from "./config";
import { handleApiError } from "./api_error";

export type VehicleResponse = components["schemas"]["VehicleResponse"];

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
});

export async function fetchVehicles(type?: string, stationId?: number): Promise<VehicleResponse[]> {
  const { data, error } = await client.GET("/api/vehicles", {
    params: {
      query: {
        type: type || undefined,
        stationId: stationId ?? undefined,
      },
    },
  });
  if (error) handleApiError(error);
  return data as VehicleResponse[];
}

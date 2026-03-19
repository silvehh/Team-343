import createClient from "openapi-fetch";
import type { paths, components } from "./types";
import { API_BASE_URL } from "./config";
import { handleApiError } from "./api_error";

export type StationResponse = components["schemas"]["StationResponse"];

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
});

export async function fetchStations(): Promise<StationResponse[]> {
  const { data, error } = await client.GET("/api/stations");
  if (error) handleApiError(error);
  return data as StationResponse[];
}

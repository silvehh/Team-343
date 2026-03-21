import createClient from "openapi-fetch";
import type { paths, components } from "./types";
import { API_BASE_URL } from "./config";
import { handleApiError } from "./api_error";

export type RentalResponse = components["schemas"]["RentalResponse"];

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
});

export async function createRental(userId: number, vehicleId: number): Promise<RentalResponse> {
  const { data, error } = await client.POST("/api/rentals", {
    body: { userId, vehicleId },
  });
  if (error) handleApiError(error);
  return data as RentalResponse;
}

export async function returnRental(rentalId: number, userId: number, stationId: number): Promise<RentalResponse> {
  const { data, error } = await client.POST("/api/rentals/{id}/return", {
    params: { path: { id: rentalId } },
    body: { userId, stationId },
  });
  if (error) handleApiError(error);
  return data as RentalResponse;
}

export async function fetchUserRentals(userId: number, status?: string): Promise<RentalResponse[]> {
  const { data, error } = await client.GET("/api/rentals", {
    params: {
      query: {
        userId,
        status: status || undefined,
      },
    },
  });
  if (error) handleApiError(error);
  return data as RentalResponse[];
}

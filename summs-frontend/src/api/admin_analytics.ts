import createClient from "openapi-fetch";
import type { paths, components } from "./types";
import { API_BASE_URL } from "./config";
import { handleApiError } from "./api_error";

export type AdminAnalyticsSummaryResponse =
  components["schemas"]["AdminAnalyticsSummaryResponse"];

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
});

const ADMIN_PARAMS_HEADER = { "X-Account-Type": "ADMIN" } as const;

export async function fetchAdminAnalyticsSummary(): Promise<AdminAnalyticsSummaryResponse> {
  const { data, error } = await client.GET("/api/admin/analytics/summary", {
    params: { header: ADMIN_PARAMS_HEADER },
  });
  if (error) handleApiError(error);
  return data as AdminAnalyticsSummaryResponse;
}

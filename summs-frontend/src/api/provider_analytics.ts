import createClient from "openapi-fetch";

import { API_BASE_URL } from "./config";
import { components, paths } from "./types";
import { handleApiError } from "./api_error";

export type ProviderAnalyticsSummaryResponse =
  components["schemas"]["ProviderAnalyticsSummaryResponse"];

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
});

export async function fetchProviderAnalyticsSummary(
  providerId: number,
): Promise<ProviderAnalyticsSummaryResponse> {
  const { data, error } = await client.GET("/api/provider/analytics/summary", {
      params: { header: {
        "X-Account-Type": "MOBILITY_PROVIDER",
        "X-User-Id": providerId
      } },
    });
    if (error) handleApiError(error);
    return data as ProviderAnalyticsSummaryResponse;
}

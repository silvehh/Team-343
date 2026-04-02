import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleApiError } from "./api_error";

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock("openapi-fetch", () => ({
  default: vi.fn(() => ({
    GET: getMock,
  })),
}));

vi.mock("./api_error");

import { fetchProviderAnalyticsSummary } from "./provider_analytics";

describe("fetchProviderAnalyticsSummary", () => {
  afterEach(() => {
    getMock.mockReset();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.mocked(handleApiError).mockImplementation((error: unknown) => {
      const errorMessage =
        (error as { message?: string }).message || "An error occurred";
      throw new Error(errorMessage);
    });
  });

  it("returns summary when request succeeds", async () => {
    getMock.mockResolvedValue({
      data: {
        revenue: {
          "totalRevenue": 162.35,
          "carRevenue": 154.6,
          "bikeRevenue": 7.75,
          "scooterRevenue": 0
        },
        fleetUtilization: {
          "totalVehicles": 7,
          "availableVehicles": 4,
          "rentedVehicles": 3,
          "availabilityRate": 57.142857142857146,
          "availableCars": 3,
          "availableBikes": 1,
          "availableScooters": 0,
          "rentedCars": 0,
          "rentedBikes": 1,
          "rentedScooters": 2
        },
        rentalActivity: {
          "completedRentals": 3,
          "activeRentals": 3,
          "completedCarRentals": 2,
          "completedBikeRentals": 1,
          "completedScooterRentals": 0,
          "averageRentalDurationMinutes": 131.66666666666666,
          "bikeToScooterRatioIfMultiType": 0
        },
        efficiencyMetrics: {
          "averageRevenuePerRental": 54.12,
          "averageCarRentalRevenue": 77.3,
          "averageBikeRentalRevenue": 7.75,
          "averageScooterRentalRevenue": 0,
          "revenuePerVehicle": 23.19,
          "averageRentalFrequencyPerVehicle": 0.42857142857142855,
          "carRevenuePercentage": 95.23,
          "bikeRevenuePercentage": 4.77,
          "scooterRevenuePercentage": 0
        },
        generatedAt: "2026-04-01T01:23:16.2969363"
      },
      error: undefined,
    });

    const summary = await fetchProviderAnalyticsSummary(15);

    expect(summary.revenue!.totalRevenue).toBe(162.35);
    expect(summary.fleetUtilization!.totalVehicles).toBe(7);
    expect(summary.rentalActivity!.completedRentals).toBe(3);
    expect(summary.efficiencyMetrics!.averageRevenuePerRental).toBe(54.12);

    expect(getMock).toHaveBeenCalledWith("/api/provider/analytics/summary", {
      params: { header: {
        "X-Account-Type": "MOBILITY_PROVIDER",
        "X-User-Id": 15,
      } },
    });
  });

  it("throws when API returns an error", async () => {
    getMock.mockResolvedValue({
      data: undefined,
      error: { message: "Mobility provider access required" },
    });

    await expect(fetchProviderAnalyticsSummary(15)).rejects.toThrow(
      "Mobility provider access required",
    );
  });
});

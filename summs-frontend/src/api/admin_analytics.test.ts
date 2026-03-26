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

import { fetchAdminAnalyticsSummary } from "./admin_analytics";

describe("fetchAdminAnalyticsSummary", () => {
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
        totalRegisteredUsers: 123,
        completedTrips: 45,
        rentalVehicleUsage: { cars: 10, bikes: 20, scooters: 30 },
        bikeToScooterUsageRatio: 0.67,
        activeRentalsByCity: [{ city: "Montreal", count: 3 }],
        parkingUtilizationByCity: [
          {
            city: "Montreal",
            totalSpots: 100,
            availableSpots: 25,
            utilizationPercent: 75,
          },
        ],
        transitServiceSummary: {
          activeRoutes: 10,
          delayedRoutes: 2,
          averageDelayMinutes: 4.5,
          averageCapacityPercent: 66.6,
        },
        generatedAt: "2026-03-25T12:00:00Z",
      },
      error: undefined,
    });

    const summary = await fetchAdminAnalyticsSummary();

    expect(summary.totalRegisteredUsers).toBe(123);
    expect(summary.completedTrips).toBe(45);

    expect(getMock).toHaveBeenCalledWith("/api/admin/analytics/summary", {
      params: { header: { "X-Account-Type": "ADMIN" } },
    });
  });

  it("throws when API returns an error", async () => {
    getMock.mockResolvedValue({
      data: undefined,
      error: { message: "Admin access required" },
    });

    await expect(fetchAdminAnalyticsSummary()).rejects.toThrow(
      "Admin access required",
    );
  });
});

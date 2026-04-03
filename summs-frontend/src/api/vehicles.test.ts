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

import { fetchVehicles } from "./vehicles";

describe("fetchVehicles", () => {
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

  it("returns vehicles when request succeeds with no filters", async () => {
    const vehicles = [
      { id: 1, vehicleType: "BIKE" },
      { id: 2, vehicleType: "SCOOTER" },
    ];
    getMock.mockResolvedValue({ data: vehicles, error: undefined });

    const result = await fetchVehicles();

    expect(result).toEqual(vehicles);
    expect(getMock).toHaveBeenCalledWith("/api/vehicles", {
      params: {
        query: { type: undefined, stationId: undefined },
      },
    });
  });

  it("passes type filter when provided", async () => {
    getMock.mockResolvedValue({ data: [], error: undefined });

    await fetchVehicles("BIKE");

    expect(getMock).toHaveBeenCalledWith("/api/vehicles", {
      params: {
        query: { type: "BIKE", stationId: undefined },
      },
    });
  });

  it("passes stationId filter when provided", async () => {
    getMock.mockResolvedValue({ data: [], error: undefined });

    await fetchVehicles(undefined, 5);

    expect(getMock).toHaveBeenCalledWith("/api/vehicles", {
      params: {
        query: { type: undefined, stationId: 5 },
      },
    });
  });

  it("passes both filters when both provided", async () => {
    getMock.mockResolvedValue({ data: [], error: undefined });

    await fetchVehicles("SCOOTER", 3);

    expect(getMock).toHaveBeenCalledWith("/api/vehicles", {
      params: {
        query: { type: "SCOOTER", stationId: 3 },
      },
    });
  });

  it("converts empty string type to undefined", async () => {
    getMock.mockResolvedValue({ data: [], error: undefined });

    await fetchVehicles("");

    expect(getMock).toHaveBeenCalledWith("/api/vehicles", {
      params: {
        query: { type: undefined, stationId: undefined },
      },
    });
  });

  it("throws when API returns an error", async () => {
    getMock.mockResolvedValue({
      data: undefined,
      error: { message: "Server error" },
    });

    await expect(fetchVehicles()).rejects.toThrow("Server error");
  });
});

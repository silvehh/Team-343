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

import { fetchStations } from "./stations";

describe("fetchStations", () => {
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

  it("returns stations when request succeeds", async () => {
    const stations = [
      { id: 1, name: "Station A" },
      { id: 2, name: "Station B" },
    ];
    getMock.mockResolvedValue({ data: stations, error: undefined });

    const result = await fetchStations();

    expect(result).toEqual(stations);
    expect(getMock).toHaveBeenCalledWith("/api/stations");
  });

  it("throws when API returns an error", async () => {
    getMock.mockResolvedValue({
      data: undefined,
      error: { message: "Unauthorized" },
    });

    await expect(fetchStations()).rejects.toThrow("Unauthorized");
  });
});

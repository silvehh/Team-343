import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchParkingSpots } from "./parking";

describe("fetchParkingSpots", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function mockResponse(body: unknown, ok = true, status = 200) {
    return { ok, status, json: () => Promise.resolve(body) };
  }

  it("fetches with no params when none provided", async () => {
    const spots = [{ id: 1, name: "Spot A" }];
    fetchMock.mockResolvedValue(mockResponse(spots));

    const result = await fetchParkingSpots();

    expect(result).toEqual(spots);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/api/parking?");
  });

  it("includes type param when provided", async () => {
    fetchMock.mockResolvedValue(mockResponse([]));

    await fetchParkingSpots("GARAGE");

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("type=GARAGE");
  });

  it("includes availableOnly param when true", async () => {
    fetchMock.mockResolvedValue(mockResponse([]));

    await fetchParkingSpots(undefined, true);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("availableOnly=true");
  });

  it("does not include availableOnly when false", async () => {
    fetchMock.mockResolvedValue(mockResponse([]));

    await fetchParkingSpots(undefined, false);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).not.toContain("availableOnly");
  });

  it("includes both params when both provided", async () => {
    fetchMock.mockResolvedValue(mockResponse([]));

    await fetchParkingSpots("LOT", true);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("type=LOT");
    expect(url).toContain("availableOnly=true");
  });

  it("throws when response is not ok", async () => {
    fetchMock.mockResolvedValue(mockResponse(null, false, 500));

    await expect(fetchParkingSpots()).rejects.toThrow(
      "Failed to fetch parking spots",
    );
  });
});

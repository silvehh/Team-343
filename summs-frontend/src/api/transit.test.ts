import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchTransitRoutes, fetchTransitStops } from "./transit";

describe("fetchTransitRoutes", () => {
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
    const routes = [{ id: 1, routeName: "Route A" }];
    fetchMock.mockResolvedValue(mockResponse(routes));

    const result = await fetchTransitRoutes();

    expect(result).toEqual(routes);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/api/transit/routes?");
  });

  it("includes type param when provided", async () => {
    fetchMock.mockResolvedValue(mockResponse([]));

    await fetchTransitRoutes("BUS");

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("type=BUS");
  });

  it("includes activeOnly param when true", async () => {
    fetchMock.mockResolvedValue(mockResponse([]));

    await fetchTransitRoutes(undefined, true);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("activeOnly=true");
  });

  it("includes both params when both provided", async () => {
    fetchMock.mockResolvedValue(mockResponse([]));

    await fetchTransitRoutes("METRO", true);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("type=METRO");
    expect(url).toContain("activeOnly=true");
  });

  it("throws when response is not ok", async () => {
    fetchMock.mockResolvedValue(mockResponse(null, false, 500));

    await expect(fetchTransitRoutes()).rejects.toThrow(
      "Failed to fetch transit routes",
    );
  });
});

describe("fetchTransitStops", () => {
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

  it("fetches stops for a given routeId", async () => {
    const stops = [{ id: 1, name: "Stop A" }];
    fetchMock.mockResolvedValue(mockResponse(stops));

    const result = await fetchTransitStops(42);

    expect(result).toEqual(stops);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/api/transit/routes/42/stops");
  });

  it("throws when response is not ok", async () => {
    fetchMock.mockResolvedValue(mockResponse(null, false, 404));

    await expect(fetchTransitStops(99)).rejects.toThrow(
      "Failed to fetch transit stops",
    );
  });
});

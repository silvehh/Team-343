import { describe, expect, it } from "vitest";
import type { TransitRouteResponse } from "../api/transit";
import {
  computeTransitServiceSummary,
  computeAverageReliabilityScore,
  computeRoutesByTransitType,
  computeHighFrequencyRouteCount,
  SAMPLE_TRANSIT_ROUTES,
} from "./transitData";

function route(overrides: Partial<TransitRouteResponse> = {}): TransitRouteResponse {
  return {
    id: 1,
    routeNumber: "1",
    routeName: "Test Route",
    transitType: "BUS",
    isActive: true,
    currentDelayMinutes: 0,
    currentCapacityPercent: 50,
    reliabilityScore: 90,
    frequencyMinutes: 10,
    ...overrides,
  };
}

describe("computeTransitServiceSummary", () => {
  it("returns zeros for empty input", () => {
    const result = computeTransitServiceSummary([]);
    expect(result).toEqual({
      activeRoutes: 0,
      delayedRoutes: 0,
      averageDelayMinutes: 0,
      averageCapacityPercent: 0,
    });
  });

  it("counts active routes", () => {
    const routes = [route({ isActive: true }), route({ isActive: false }), route({ isActive: true })];
    expect(computeTransitServiceSummary(routes).activeRoutes).toBe(2);
  });

  it("counts delayed routes among active routes", () => {
    const routes = [
      route({ isActive: true, currentDelayMinutes: 5 }),
      route({ isActive: true, currentDelayMinutes: 0 }),
      route({ isActive: false, currentDelayMinutes: 10 }),
    ];
    expect(computeTransitServiceSummary(routes).delayedRoutes).toBe(1);
  });

  it("calculates average delay among delayed routes only", () => {
    const routes = [
      route({ currentDelayMinutes: 4 }),
      route({ currentDelayMinutes: 6 }),
      route({ currentDelayMinutes: 0 }),
    ];
    expect(computeTransitServiceSummary(routes).averageDelayMinutes).toBe(5);
  });

  it("calculates average capacity among active routes", () => {
    const routes = [
      route({ currentCapacityPercent: 50 }),
      route({ currentCapacityPercent: 70 }),
      route({ currentCapacityPercent: 80 }),
    ];
    const result = computeTransitServiceSummary(routes);
    expect(result.averageCapacityPercent).toBeCloseTo(66.7, 1);
  });

  it("returns zero delay when no routes are delayed", () => {
    const routes = [route({ currentDelayMinutes: 0 })];
    expect(computeTransitServiceSummary(routes).averageDelayMinutes).toBe(0);
  });

  it("handles undefined delay and capacity as 0", () => {
    const routes = [route({ currentDelayMinutes: undefined, currentCapacityPercent: undefined })];
    const result = computeTransitServiceSummary(routes);
    expect(result.delayedRoutes).toBe(0);
    expect(result.averageCapacityPercent).toBe(0);
  });

  it("returns zeros for all inactive routes", () => {
    const routes = [route({ isActive: false }), route({ isActive: false })];
    const result = computeTransitServiceSummary(routes);
    expect(result.activeRoutes).toBe(0);
    expect(result.averageCapacityPercent).toBe(0);
  });
});

describe("computeAverageReliabilityScore", () => {
  it("computes average of active routes scores", () => {
    const routes = [
      route({ reliabilityScore: 90 }),
      route({ reliabilityScore: 80 }),
    ];
    expect(computeAverageReliabilityScore(routes)).toBe(85);
  });

  it("returns 0 for empty array", () => {
    expect(computeAverageReliabilityScore([])).toBe(0);
  });

  it("returns 0 when all routes are inactive", () => {
    const routes = [route({ isActive: false, reliabilityScore: 95 })];
    expect(computeAverageReliabilityScore(routes)).toBe(0);
  });

  it("ignores inactive routes", () => {
    const routes = [
      route({ isActive: true, reliabilityScore: 80 }),
      route({ isActive: false, reliabilityScore: 100 }),
    ];
    expect(computeAverageReliabilityScore(routes)).toBe(80);
  });

  it("handles undefined reliabilityScore as 0", () => {
    const routes = [
      route({ reliabilityScore: undefined }),
      route({ reliabilityScore: 80 }),
    ];
    expect(computeAverageReliabilityScore(routes)).toBe(40);
  });
});

describe("computeRoutesByTransitType", () => {
  it("counts active routes by type", () => {
    const routes = [
      route({ transitType: "BUS" }),
      route({ transitType: "BUS" }),
      route({ transitType: "METRO" }),
      route({ transitType: "REM" }),
      route({ transitType: "TRAIN" }),
    ];
    expect(computeRoutesByTransitType(routes)).toEqual({
      BUS: 2,
      METRO: 1,
      REM: 1,
      TRAIN: 1,
    });
  });

  it("returns all zeros for empty input", () => {
    expect(computeRoutesByTransitType([])).toEqual({
      BUS: 0,
      METRO: 0,
      REM: 0,
      TRAIN: 0,
    });
  });

  it("ignores inactive routes", () => {
    const routes = [
      route({ transitType: "BUS", isActive: true }),
      route({ transitType: "BUS", isActive: false }),
    ];
    expect(computeRoutesByTransitType(routes).BUS).toBe(1);
  });

  it("ignores unknown transit types", () => {
    const routes = [route({ transitType: "FERRY" })];
    expect(computeRoutesByTransitType(routes)).toEqual({
      BUS: 0,
      METRO: 0,
      REM: 0,
      TRAIN: 0,
    });
  });
});

describe("computeHighFrequencyRouteCount", () => {
  it("counts routes with frequency below default threshold of 5", () => {
    const routes = [
      route({ frequencyMinutes: 4 }),
      route({ frequencyMinutes: 5 }),
      route({ frequencyMinutes: 3 }),
    ];
    expect(computeHighFrequencyRouteCount(routes)).toBe(2);
  });

  it("uses custom threshold when provided", () => {
    const routes = [
      route({ frequencyMinutes: 8 }),
      route({ frequencyMinutes: 12 }),
    ];
    expect(computeHighFrequencyRouteCount(routes, 10)).toBe(1);
  });

  it("only counts active routes", () => {
    const routes = [
      route({ frequencyMinutes: 3, isActive: true }),
      route({ frequencyMinutes: 2, isActive: false }),
    ];
    expect(computeHighFrequencyRouteCount(routes)).toBe(1);
  });

  it("returns 0 for empty input", () => {
    expect(computeHighFrequencyRouteCount([])).toBe(0);
  });

  it("treats undefined frequencyMinutes as Infinity (not counted)", () => {
    const routes = [route({ frequencyMinutes: undefined })];
    expect(computeHighFrequencyRouteCount(routes)).toBe(0);
  });

  it("works with SAMPLE_TRANSIT_ROUTES", () => {
    const count = computeHighFrequencyRouteCount(SAMPLE_TRANSIT_ROUTES);
    // Routes with frequency < 5: Orange (4), REM-B (4) = 2
    expect(count).toBe(2);
  });
});

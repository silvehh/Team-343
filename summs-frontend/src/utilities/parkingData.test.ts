import { describe, expect, it } from "vitest";
import type { ParkingSpotResponse } from "../api/parking";
import {
  computeParkingUtilizationByCity,
  SAMPLE_PARKING_SPOTS,
} from "./parkingData";

function spot(overrides: Partial<ParkingSpotResponse> = {}): ParkingSpotResponse {
  return {
    id: 1,
    name: "Test Spot",
    address: "123 Main St, Montreal, QC",
    totalSpots: 100,
    availableSpots: 25,
    ...overrides,
  };
}

describe("computeParkingUtilizationByCity", () => {
  it("returns empty array for empty input", () => {
    expect(computeParkingUtilizationByCity([])).toEqual([]);
  });

  it("aggregates spots in the same city", () => {
    const spots = [
      spot({ totalSpots: 100, availableSpots: 20 }),
      spot({ totalSpots: 200, availableSpots: 80 }),
    ];
    const result = computeParkingUtilizationByCity(spots);
    expect(result).toHaveLength(1);
    expect(result[0].city).toBe("Montreal");
    expect(result[0].totalSpots).toBe(300);
    expect(result[0].availableSpots).toBe(100);
  });

  it("calculates utilization percent correctly", () => {
    const result = computeParkingUtilizationByCity([
      spot({ totalSpots: 100, availableSpots: 25 }),
    ]);
    expect(result[0].utilizationPercent).toBe(75);
  });

  it("sorts results by utilization descending", () => {
    const spots = [
      spot({ address: "1 St, Toronto, ON", totalSpots: 100, availableSpots: 50 }), // 50%
      spot({ address: "2 St, Montreal, QC", totalSpots: 100, availableSpots: 10 }), // 90%
    ];
    const result = computeParkingUtilizationByCity(spots);
    expect(result[0].city).toBe("Montreal");
    expect(result[1].city).toBe("Toronto");
  });

  it("handles spots with undefined address as Unknown city", () => {
    const result = computeParkingUtilizationByCity([
      spot({ address: undefined }),
    ]);
    expect(result[0].city).toBe("Unknown");
  });

  it("handles spots with empty string address as Unknown city", () => {
    const result = computeParkingUtilizationByCity([
      spot({ address: "" }),
    ]);
    expect(result[0].city).toBe("Unknown");
  });

  it("handles zero totalSpots with 0% utilization", () => {
    const result = computeParkingUtilizationByCity([
      spot({ totalSpots: 0, availableSpots: 0 }),
    ]);
    expect(result[0].utilizationPercent).toBe(0);
  });

  it("handles undefined totalSpots and availableSpots", () => {
    const result = computeParkingUtilizationByCity([
      spot({ totalSpots: undefined, availableSpots: undefined }),
    ]);
    expect(result[0].totalSpots).toBe(0);
    expect(result[0].availableSpots).toBe(0);
    expect(result[0].utilizationPercent).toBe(0);
  });

  it("applies titleCase to city names", () => {
    const result = computeParkingUtilizationByCity([
      spot({ address: "123 Main St, montreal, QC" }),
    ]);
    expect(result[0].city).toBe("Montreal");
  });

  it("handles address with only one part as Unknown", () => {
    const result = computeParkingUtilizationByCity([
      spot({ address: "Montreal" }),
    ]);
    expect(result[0].city).toBe("Unknown");
  });

  it("extracts city from two-part address (first part)", () => {
    // "Street, City" -> parts.length === 2, takes parts[0] which is street
    const result = computeParkingUtilizationByCity([
      spot({ address: "123 Main St, Montreal" }),
    ]);
    expect(result[0].city).toBe("123 Main St");
  });

  it("extracts city from multi-part address (second-to-last)", () => {
    const result = computeParkingUtilizationByCity([
      spot({ address: "123 Main St, Montreal, QC" }),
    ]);
    expect(result[0].city).toBe("Montreal");
  });

  it("handles multiple cities with correct aggregation", () => {
    const spots = [
      spot({ address: "1 St, Montreal, QC", totalSpots: 100, availableSpots: 10 }),
      spot({ address: "2 St, Montreal, QC", totalSpots: 50, availableSpots: 5 }),
      spot({ address: "3 St, Toronto, ON", totalSpots: 200, availableSpots: 100 }),
    ];
    const result = computeParkingUtilizationByCity(spots);
    expect(result).toHaveLength(2);
    const montreal = result.find((r) => r.city === "Montreal")!;
    const toronto = result.find((r) => r.city === "Toronto")!;
    expect(montreal.totalSpots).toBe(150);
    expect(montreal.availableSpots).toBe(15);
    expect(toronto.totalSpots).toBe(200);
    expect(toronto.availableSpots).toBe(100);
  });

  it("processes SAMPLE_PARKING_SPOTS without error", () => {
    const result = computeParkingUtilizationByCity(SAMPLE_PARKING_SPOTS);
    expect(result.length).toBeGreaterThan(0);
    for (const entry of result) {
      expect(entry.utilizationPercent).toBeGreaterThanOrEqual(0);
      expect(entry.utilizationPercent).toBeLessThanOrEqual(100);
    }
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchProviderVehicles,
  addProviderVehicle,
  updateProviderVehicle,
  deleteProviderVehicle,
  reclaimProviderVehicle,
} from "./provider";
import type { ProviderVehicleRequest } from "./provider";

describe("provider API", () => {
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

  function mockFailedResponse(body: unknown, status = 500) {
    return { ok: false, status, json: () => Promise.resolve(body) };
  }

  function mockFailedResponseNoJson(status = 500) {
    return { ok: false, status, json: () => Promise.reject(new Error("no json")) };
  }

  const expectedHeaders = (providerId: number) => ({
    "Content-Type": "application/json",
    "X-Account-Type": "MOBILITY_PROVIDER",
    "X-User-Id": String(providerId),
  });

  const vehicleBody: ProviderVehicleRequest = {
    vehicleType: "BIKE",
    stationId: 1,
    pricePerHour: 5.0,
  };

  describe("fetchProviderVehicles", () => {
    it("fetches with correct provider headers", async () => {
      const vehicles = [{ id: 1, vehicleType: "BIKE" }];
      fetchMock.mockResolvedValue(mockResponse(vehicles));

      const result = await fetchProviderVehicles(42);

      expect(result).toEqual(vehicles);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/provider/vehicles"),
        { headers: expectedHeaders(42) },
      );
    });

    it("throws with body message on non-ok response", async () => {
      fetchMock.mockResolvedValue(
        mockFailedResponse({ message: "Forbidden" }, 403),
      );

      await expect(fetchProviderVehicles(42)).rejects.toThrow("Forbidden");
    });

    it("throws with status fallback when body has no message", async () => {
      fetchMock.mockResolvedValue(mockFailedResponse({}, 500));

      await expect(fetchProviderVehicles(42)).rejects.toThrow(
        "Request failed with status 500",
      );
    });

    it("throws with status fallback when body parse fails", async () => {
      fetchMock.mockResolvedValue(mockFailedResponseNoJson(500));

      await expect(fetchProviderVehicles(42)).rejects.toThrow(
        "Request failed with status 500",
      );
    });
  });

  describe("addProviderVehicle", () => {
    it("sends POST with correct headers and body", async () => {
      const created = { id: 1, ...vehicleBody };
      fetchMock.mockResolvedValue(mockResponse(created));

      const result = await addProviderVehicle(42, vehicleBody);

      expect(result).toEqual(created);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/provider/vehicles"),
        {
          method: "POST",
          headers: expectedHeaders(42),
          body: JSON.stringify(vehicleBody),
        },
      );
    });

    it("throws on error response", async () => {
      fetchMock.mockResolvedValue(
        mockFailedResponse({ message: "Invalid data" }, 400),
      );

      await expect(addProviderVehicle(42, vehicleBody)).rejects.toThrow(
        "Invalid data",
      );
    });
  });

  describe("updateProviderVehicle", () => {
    it("sends PUT with vehicleId in URL", async () => {
      const updated = { id: 99, ...vehicleBody };
      fetchMock.mockResolvedValue(mockResponse(updated));

      const result = await updateProviderVehicle(42, 99, vehicleBody);

      expect(result).toEqual(updated);
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("/api/provider/vehicles/99");
      expect(fetchMock).toHaveBeenCalledWith(url, {
        method: "PUT",
        headers: expectedHeaders(42),
        body: JSON.stringify(vehicleBody),
      });
    });

    it("throws on error response", async () => {
      fetchMock.mockResolvedValue(
        mockFailedResponse({ message: "Not found" }, 404),
      );

      await expect(
        updateProviderVehicle(42, 99, vehicleBody),
      ).rejects.toThrow("Not found");
    });
  });

  describe("deleteProviderVehicle", () => {
    it("sends DELETE with correct URL and headers", async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 204 });

      await deleteProviderVehicle(42, 99);

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("/api/provider/vehicles/99");
      expect(fetchMock).toHaveBeenCalledWith(url, {
        method: "DELETE",
        headers: expectedHeaders(42),
      });
    });

    it("throws with body message on non-ok response", async () => {
      fetchMock.mockResolvedValue(
        mockFailedResponse({ message: "Forbidden" }, 403),
      );

      await expect(deleteProviderVehicle(42, 99)).rejects.toThrow("Forbidden");
    });

    it("throws with status fallback when body parse fails", async () => {
      fetchMock.mockResolvedValue(mockFailedResponseNoJson(500));

      await expect(deleteProviderVehicle(42, 99)).rejects.toThrow(
        "Request failed with status 500",
      );
    });
  });

  describe("reclaimProviderVehicle", () => {
    it("sends PUT to reclaim endpoint with correct URL, headers, and body", async () => {
      const reclaimed = { id: 99, ...vehicleBody };
      fetchMock.mockResolvedValue(mockResponse(reclaimed));
      const result = await reclaimProviderVehicle(42, 99, vehicleBody);

      expect(result).toEqual(reclaimed);
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("/api/provider/vehicles/99/reclaim");
      expect(fetchMock).toHaveBeenCalledWith(url, {
        method: "PUT",
        headers: expectedHeaders(42),
        body: JSON.stringify(vehicleBody),
    });
    });
    it("throws on error response", async () => {
      fetchMock.mockResolvedValue(
        mockFailedResponse({ message: "Not found" }, 404),
      );

      await expect(
        updateProviderVehicle(42, 99, vehicleBody),
      ).rejects.toThrow("Not found");
    });
  }
);
});

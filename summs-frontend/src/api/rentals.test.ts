import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleApiError } from "./api_error";

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock("openapi-fetch", () => ({
  default: vi.fn(() => ({
    GET: getMock,
    POST: postMock,
  })),
}));

vi.mock("./api_error");

import { createRental, returnRental, fetchUserRentals } from "./rentals";

describe("createRental", () => {
  afterEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.mocked(handleApiError).mockImplementation((error: unknown) => {
      const errorMessage =
        (error as { message?: string }).message || "An error occurred";
      throw new Error(errorMessage);
    });
  });

  it("returns rental when request succeeds", async () => {
    const rental = { id: 1, userId: 10, vehicleId: 20, status: "ACTIVE" };
    postMock.mockResolvedValue({ data: rental, error: undefined });

    const result = await createRental(10, 20);

    expect(result).toEqual(rental);
    expect(postMock).toHaveBeenCalledWith("/api/rentals", {
      body: { userId: 10, vehicleId: 20 },
    });
  });

  it("throws when API returns an error", async () => {
    postMock.mockResolvedValue({
      data: undefined,
      error: { message: "Vehicle unavailable" },
    });

    await expect(createRental(10, 20)).rejects.toThrow("Vehicle unavailable");
  });
});

describe("returnRental", () => {
  afterEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.mocked(handleApiError).mockImplementation((error: unknown) => {
      const errorMessage =
        (error as { message?: string }).message || "An error occurred";
      throw new Error(errorMessage);
    });
  });

  it("returns rental when request succeeds", async () => {
    const rental = { id: 1, status: "RETURNED" };
    postMock.mockResolvedValue({ data: rental, error: undefined });

    const result = await returnRental(1, 10, 5);

    expect(result).toEqual(rental);
    expect(postMock).toHaveBeenCalledWith("/api/rentals/{id}/return", {
      params: { path: { id: 1 } },
      body: { userId: 10, stationId: 5 },
    });
  });

  it("throws when API returns an error", async () => {
    postMock.mockResolvedValue({
      data: undefined,
      error: { message: "Rental not found" },
    });

    await expect(returnRental(1, 10, 5)).rejects.toThrow("Rental not found");
  });
});

describe("fetchUserRentals", () => {
  afterEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.mocked(handleApiError).mockImplementation((error: unknown) => {
      const errorMessage =
        (error as { message?: string }).message || "An error occurred";
      throw new Error(errorMessage);
    });
  });

  it("returns rentals when request succeeds without status filter", async () => {
    const rentals = [{ id: 1 }, { id: 2 }];
    getMock.mockResolvedValue({ data: rentals, error: undefined });

    const result = await fetchUserRentals(10);

    expect(result).toEqual(rentals);
    expect(getMock).toHaveBeenCalledWith("/api/rentals", {
      params: {
        query: { userId: 10, status: undefined },
      },
    });
  });

  it("passes status filter when provided", async () => {
    getMock.mockResolvedValue({ data: [], error: undefined });

    await fetchUserRentals(10, "ACTIVE");

    expect(getMock).toHaveBeenCalledWith("/api/rentals", {
      params: {
        query: { userId: 10, status: "ACTIVE" },
      },
    });
  });

  it("converts empty string status to undefined", async () => {
    getMock.mockResolvedValue({ data: [], error: undefined });

    await fetchUserRentals(10, "");

    expect(getMock).toHaveBeenCalledWith("/api/rentals", {
      params: {
        query: { userId: 10, status: undefined },
      },
    });
  });

  it("throws when API returns an error", async () => {
    getMock.mockResolvedValue({
      data: undefined,
      error: { message: "Forbidden" },
    });

    await expect(fetchUserRentals(10)).rejects.toThrow("Forbidden");
  });
});

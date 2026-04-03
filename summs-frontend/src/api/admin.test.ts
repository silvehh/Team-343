import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleApiError } from "./api_error";

const { getMock, postMock, putMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("openapi-fetch", () => ({
  default: vi.fn(() => ({
    GET: getMock,
    POST: postMock,
    PUT: putMock,
    DELETE: deleteMock,
  })),
}));

vi.mock("./api_error");

import {
  fetchAdminStations,
  createStation,
  updateStation,
  deleteStation,
} from "./admin";

const ADMIN_HEADER = { "X-Account-Type": "ADMIN" };

describe("fetchAdminStations", () => {
  afterEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    putMock.mockReset();
    deleteMock.mockReset();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.mocked(handleApiError).mockImplementation((error: unknown) => {
      const errorMessage =
        (error as { message?: string }).message || "An error occurred";
      throw new Error(errorMessage);
    });
  });

  it("returns stations with ADMIN header", async () => {
    const stations = [{ id: 1, name: "Station A" }];
    getMock.mockResolvedValue({ data: stations, error: undefined });

    const result = await fetchAdminStations();

    expect(result).toEqual(stations);
    expect(getMock).toHaveBeenCalledWith("/api/admin/stations", {
      params: { header: ADMIN_HEADER },
    });
  });

  it("throws when API returns an error", async () => {
    getMock.mockResolvedValue({
      data: undefined,
      error: { message: "Unauthorized" },
    });

    await expect(fetchAdminStations()).rejects.toThrow("Unauthorized");
  });
});

describe("createStation", () => {
  afterEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    putMock.mockReset();
    deleteMock.mockReset();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.mocked(handleApiError).mockImplementation((error: unknown) => {
      const errorMessage =
        (error as { message?: string }).message || "An error occurred";
      throw new Error(errorMessage);
    });
  });

  it("creates station with ADMIN header and body", async () => {
    const body = { name: "New Station", latitude: 45.5, longitude: -73.5 };
    const created = { id: 1, ...body };
    postMock.mockResolvedValue({ data: created, error: undefined });

    const result = await createStation(body as never);

    expect(result).toEqual(created);
    expect(postMock).toHaveBeenCalledWith("/api/admin/stations", {
      params: { header: ADMIN_HEADER },
      body,
    });
  });

  it("throws when API returns an error", async () => {
    postMock.mockResolvedValue({
      data: undefined,
      error: { message: "Validation failed" },
    });

    await expect(createStation({} as never)).rejects.toThrow(
      "Validation failed",
    );
  });
});

describe("updateStation", () => {
  afterEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    putMock.mockReset();
    deleteMock.mockReset();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.mocked(handleApiError).mockImplementation((error: unknown) => {
      const errorMessage =
        (error as { message?: string }).message || "An error occurred";
      throw new Error(errorMessage);
    });
  });

  it("updates station with id, ADMIN header, and body", async () => {
    const body = { name: "Updated Station", latitude: 45.5, longitude: -73.5 };
    const updated = { id: 5, ...body };
    putMock.mockResolvedValue({ data: updated, error: undefined });

    const result = await updateStation(5, body as never);

    expect(result).toEqual(updated);
    expect(putMock).toHaveBeenCalledWith("/api/admin/stations/{id}", {
      params: { path: { id: 5 }, header: ADMIN_HEADER },
      body,
    });
  });

  it("throws when API returns an error", async () => {
    putMock.mockResolvedValue({
      data: undefined,
      error: { message: "Not found" },
    });

    await expect(updateStation(99, {} as never)).rejects.toThrow("Not found");
  });
});

describe("deleteStation", () => {
  afterEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    putMock.mockReset();
    deleteMock.mockReset();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.mocked(handleApiError).mockImplementation((error: unknown) => {
      const errorMessage =
        (error as { message?: string }).message || "An error occurred";
      throw new Error(errorMessage);
    });
  });

  it("deletes station with id and ADMIN header", async () => {
    deleteMock.mockResolvedValue({ error: undefined });

    await deleteStation(5);

    expect(deleteMock).toHaveBeenCalledWith("/api/admin/stations/{id}", {
      params: { path: { id: 5 }, header: ADMIN_HEADER },
    });
  });

  it("throws when API returns an error", async () => {
    deleteMock.mockResolvedValue({
      data: undefined,
      error: { message: "Forbidden" },
    });

    await expect(deleteStation(5)).rejects.toThrow("Forbidden");
  });
});

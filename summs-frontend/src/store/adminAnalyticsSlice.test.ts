import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}));

vi.mock("../api/admin_analytics", () => ({
  fetchAdminAnalyticsSummary: fetchMock,
}));

import adminAnalyticsReducer, {
  loadAdminAnalyticsSummary,
  resetAdminAnalytics,
} from "./adminAnalyticsSlice";

describe("adminAnalyticsSlice", () => {
  afterEach(() => {
    fetchMock.mockReset();
    vi.clearAllMocks();
  });

  function createStore() {
    return configureStore({ reducer: { adminAnalytics: adminAnalyticsReducer } });
  }

  describe("initial state", () => {
    it("starts with idle status, null data, null error", () => {
      const store = createStore();
      const state = store.getState().adminAnalytics;
      expect(state.status).toBe("idle");
      expect(state.data).toBeNull();
      expect(state.error).toBeNull();
      expect(state.lastUpdatedAt).toBeNull();
    });
  });

  describe("resetAdminAnalytics action", () => {
    it("resets state back to initial values", async () => {
      const store = createStore();
      const summaryData = { totalRentals: 100 };
      fetchMock.mockResolvedValue(summaryData);

      await store.dispatch(loadAdminAnalyticsSummary());

      store.dispatch(resetAdminAnalytics());

      const state = store.getState().adminAnalytics;
      expect(state.status).toBe("idle");
      expect(state.data).toBeNull();
      expect(state.error).toBeNull();
      expect(state.lastUpdatedAt).toBeNull();
    });
  });

  describe("loadAdminAnalyticsSummary thunk", () => {
    it("sets status to succeeded and stores data on fulfilled", async () => {
      const summaryData = { totalRentals: 100, totalRevenue: 5000 };
      fetchMock.mockResolvedValue(summaryData);

      const store = createStore();
      await store.dispatch(loadAdminAnalyticsSummary());

      const state = store.getState().adminAnalytics;
      expect(state.status).toBe("succeeded");
      expect(state.data).toEqual(summaryData);
      expect(state.lastUpdatedAt).toBeTruthy();
      expect(state.error).toBeNull();
    });

    it("sets status to failed and stores error on rejected", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"));

      const store = createStore();
      await store.dispatch(loadAdminAnalyticsSummary());

      const state = store.getState().adminAnalytics;
      expect(state.status).toBe("failed");
      expect(state.error).toBe("Network error");
      expect(state.data).toBeNull();
    });

    it("stores empty string error when Error has no message", async () => {
      fetchMock.mockRejectedValue(new Error());

      const store = createStore();
      await store.dispatch(loadAdminAnalyticsSummary());

      const state = store.getState().adminAnalytics;
      expect(state.status).toBe("failed");
      // new Error() has message="" which is not nullish, so ?? fallback is not used
      expect(state.error).toBe("");
    });

    it("uses fallback error message when error.message is undefined", async () => {
      fetchMock.mockRejectedValue({ notAnError: true });

      const store = createStore();
      await store.dispatch(loadAdminAnalyticsSummary());

      const state = store.getState().adminAnalytics;
      expect(state.status).toBe("failed");
      expect(state.error).toBe("Failed to load analytics");
    });

    it("clears previous error on new loading", async () => {
      fetchMock.mockRejectedValue(new Error("First error"));

      const store = createStore();
      await store.dispatch(loadAdminAnalyticsSummary());
      expect(store.getState().adminAnalytics.error).toBe("First error");

      fetchMock.mockResolvedValue({ totalRentals: 50 });
      await store.dispatch(loadAdminAnalyticsSummary());

      const state = store.getState().adminAnalytics;
      expect(state.status).toBe("succeeded");
      expect(state.error).toBeNull();
    });
  });
});

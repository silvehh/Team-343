import { afterEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}));

vi.mock("../api/provider_analytics", () => ({
  fetchProviderAnalyticsSummary: fetchMock,
}));

import providerAnalyticsReducer, {
  loadProviderAnalyticsSummary,
  resetProviderAnalytics,
} from "./providerAnalyticsSlice";

describe("providerAnalyticsSlice", () => {
  afterEach(() => {
    fetchMock.mockReset();
    vi.clearAllMocks();
  });

  function createStore() {
    return configureStore({
      reducer: { providerAnalytics: providerAnalyticsReducer },
    });
  }

  describe("initial state", () => {
    it("starts with idle status, null data, null error", () => {
      const store = createStore();
      const state = store.getState().providerAnalytics;
      expect(state.status).toBe("idle");
      expect(state.data).toBeNull();
      expect(state.error).toBeNull();
      expect(state.lastUpdatedAt).toBeNull();
    });
  });

  describe("resetProviderAnalytics action", () => {
    it("resets state back to initial values", async () => {
      const store = createStore();
      fetchMock.mockResolvedValue({ totalRevenue: 1000 });

      await store.dispatch(loadProviderAnalyticsSummary(42));

      store.dispatch(resetProviderAnalytics());

      const state = store.getState().providerAnalytics;
      expect(state.status).toBe("idle");
      expect(state.data).toBeNull();
      expect(state.error).toBeNull();
      expect(state.lastUpdatedAt).toBeNull();
    });
  });

  describe("loadProviderAnalyticsSummary thunk", () => {
    it("passes providerId to API and stores result on success", async () => {
      const summaryData = { totalRevenue: 1000, fleetSize: 25 };
      fetchMock.mockResolvedValue(summaryData);

      const store = createStore();
      await store.dispatch(loadProviderAnalyticsSummary(42));

      expect(fetchMock).toHaveBeenCalledWith(42);
      const state = store.getState().providerAnalytics;
      expect(state.status).toBe("succeeded");
      expect(state.data).toEqual(summaryData);
      expect(state.lastUpdatedAt).toBeTruthy();
    });

    it("sets status to failed and stores error on rejected", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"));

      const store = createStore();
      await store.dispatch(loadProviderAnalyticsSummary(42));

      const state = store.getState().providerAnalytics;
      expect(state.status).toBe("failed");
      expect(state.error).toBe("Network error");
    });

    it("stores empty string error when Error has no message", async () => {
      fetchMock.mockRejectedValue(new Error());

      const store = createStore();
      await store.dispatch(loadProviderAnalyticsSummary(42));

      const state = store.getState().providerAnalytics;
      expect(state.error).toBe("");
    });

    it("uses fallback error message when error.message is undefined", async () => {
      fetchMock.mockRejectedValue({ notAnError: true });

      const store = createStore();
      await store.dispatch(loadProviderAnalyticsSummary(42));

      const state = store.getState().providerAnalytics;
      expect(state.error).toBe("Failed to load analytics");
    });
  });
});

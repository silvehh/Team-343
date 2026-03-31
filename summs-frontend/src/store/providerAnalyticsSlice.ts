import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ProviderAnalyticsSummaryResponse } from "../api/provider_analytics";
import { fetchProviderAnalyticsSummary } from "../api/provider_analytics";

export type ProviderAnalyticsStatus = "idle" | "loading" | "succeeded" | "failed";

export interface ProviderAnalyticsState {
  status: ProviderAnalyticsStatus;
  data: ProviderAnalyticsSummaryResponse | null;
  error: string | null;
  lastUpdatedAt: string | null;
}

const initialState: ProviderAnalyticsState = {
  status: "idle",
  data: null,
  error: null,
  lastUpdatedAt: null,
};

export const loadProviderAnalyticsSummary = createAsyncThunk(
  "providerAnalytics/loadSummary",
  async (providerId: number) => {
    return await fetchProviderAnalyticsSummary(providerId);
  },
);

const providerAnalyticsSlice = createSlice({
  name: "providerAnalytics",
  initialState,
  reducers: {
    resetProviderAnalytics(state) {
      state.status = "idle";
      state.data = null;
      state.error = null;
      state.lastUpdatedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProviderAnalyticsSummary.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        loadProviderAnalyticsSummary.fulfilled,
        (state, action: PayloadAction<ProviderAnalyticsSummaryResponse>) => {
          state.status = "succeeded";
          state.data = action.payload;
          state.lastUpdatedAt = new Date().toISOString();
        },
      )
      .addCase(loadProviderAnalyticsSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load analytics";
      });
  },
});

export const { resetProviderAnalytics } = providerAnalyticsSlice.actions;
export default providerAnalyticsSlice.reducer;

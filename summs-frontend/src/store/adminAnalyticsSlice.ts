import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AdminAnalyticsSummaryResponse } from "../api/admin_analytics";
import { fetchAdminAnalyticsSummary } from "../api/admin_analytics";

export type AdminAnalyticsStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AdminAnalyticsState {
  status: AdminAnalyticsStatus;
  data: AdminAnalyticsSummaryResponse | null;
  error: string | null;
  lastUpdatedAt: string | null;
}

const initialState: AdminAnalyticsState = {
  status: "idle",
  data: null,
  error: null,
  lastUpdatedAt: null,
};

export const loadAdminAnalyticsSummary = createAsyncThunk(
  "adminAnalytics/loadSummary",
  async () => {
    return await fetchAdminAnalyticsSummary();
  },
);

const adminAnalyticsSlice = createSlice({
  name: "adminAnalytics",
  initialState,
  reducers: {
    resetAdminAnalytics(state) {
      state.status = "idle";
      state.data = null;
      state.error = null;
      state.lastUpdatedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminAnalyticsSummary.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        loadAdminAnalyticsSummary.fulfilled,
        (state, action: PayloadAction<AdminAnalyticsSummaryResponse>) => {
          state.status = "succeeded";
          state.data = action.payload;
          state.lastUpdatedAt = new Date().toISOString();
        },
      )
      .addCase(loadAdminAnalyticsSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load analytics";
      });
  },
});

export const { resetAdminAnalytics } = adminAnalyticsSlice.actions;
export default adminAnalyticsSlice.reducer;

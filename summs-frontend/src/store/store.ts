import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import adminAnalyticsReducer from "./adminAnalyticsSlice";
import providerAnalyticsReducer from "./providerAnalyticsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAnalytics: adminAnalyticsReducer,
    providerAnalytics: providerAnalyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

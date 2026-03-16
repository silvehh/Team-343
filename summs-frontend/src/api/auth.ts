import { API_BASE_URL } from "./config";
import axios, { isAxiosError } from "axios";
import type { AuthResponse } from "./types";

export type AuthMode = "signin" | "signup";

const getStringField = (value: unknown): string | null => {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const parseErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data;

    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      const message =
        getStringField(record.message) ??
        getStringField(record.detail) ??
        getStringField(record.error) ??
        getStringField(record.title);

      if (message) {
        return message;
      }
    }

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (error.response?.status) {
      return `Request failed (${error.response.status}). Please try again.`;
    }
  }

  return "Could not reach the server. Make sure the backend is running.";
};

export const submitAuth = async (mode: AuthMode, email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/api/auth/${mode === "signin" ? "login" : "signup"}`,
      { email, password },
    );

    return response.data;
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

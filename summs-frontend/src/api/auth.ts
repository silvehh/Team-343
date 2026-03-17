import { API_BASE_URL } from "./config";
import axios, { isAxiosError } from "axios";
import type { AuthResponse } from "./types";

export type AuthMode = "signin" | "signup";

type SigninPayload = {
  email: string;
  password: string;
};

type SignupPayload = SigninPayload & {
  username: string;
  mobilityOptions?: string[];
};

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

export function submitAuth(mode: "signin", payload: SigninPayload): Promise<AuthResponse>;
export function submitAuth(mode: "signup", payload: SignupPayload): Promise<AuthResponse>;
export async function submitAuth(mode: AuthMode, payload: SigninPayload | SignupPayload): Promise<AuthResponse> {
  try {
    const requestBody =
      mode === "signup" && "username" in payload
        ? {
          email: payload.email,
          password: payload.password,
          username: payload.username,
          mobilityOptions: payload.mobilityOptions ?? [],
        }
        : { email: payload.email, password: payload.password };

    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/api/auth/${mode === "signin" ? "login" : "signup"}`,
      requestBody,
    );

    return response.data;
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
}

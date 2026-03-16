import { API_BASE_URL } from "./config";
import type { AuthResponse } from "./types";

export type AuthMode = "signin" | "signup";

const getStringField = (value: unknown): string | null => {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const parseErrorMessage = async (_mode: AuthMode, response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const body = (await response.json()) as Record<string, unknown>;

      const message =
        getStringField(body.message) ??
        getStringField(body.detail) ??
        getStringField(body.error) ??
        getStringField(body.title);

      if (message) {
        return message;
      }
    } catch {
      // Fall through to status-based fallback.
    }
  } else {
    const text = (await response.text()).trim();
    if (text) {
      return text;
    }
  }

  return `Request failed (${response.status}). Please try again.`;
};

export const submitAuth = async (mode: AuthMode, email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/${mode === "signin" ? "login" : "signup"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(mode, response));
  }

  return (await response.json()) as AuthResponse;
};

export type AuthMode = "signin" | "signup";

export type AuthResponse = {
  userId: number;
  email: string;
  message: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

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

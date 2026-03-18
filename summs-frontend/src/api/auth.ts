import createClient from "openapi-fetch";
import type { paths, components } from "./types";
import { API_BASE_URL } from "./config";

type AuthResponse = components["schemas"]["AuthResponse"];
type LoginRequest = components["schemas"]["LoginRequest"];
type SignupRequest = components["schemas"]["SignupRequest"];

export type AuthMode = "signin" | "signup";

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
});

const parseErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Could not reach the server. Make sure the backend is running.";
};

export function submitAuth(
  mode: "signin",
  payload: LoginRequest,
): Promise<AuthResponse>;

export function submitAuth(
  mode: "signup",
  payload: SignupRequest,
): Promise<AuthResponse>;

export async function submitAuth(
  mode: AuthMode,
  payload: LoginRequest | SignupRequest,
): Promise<AuthResponse> {
  try {
    if (mode === "signin") {
      const { data, error } = await client.POST("/api/auth/login", {
        body: payload as LoginRequest,
      });

      if (error) throw error;
      return data as AuthResponse;
    }

    const { data, error } = await client.POST("/api/auth/signup", {
      body: payload as SignupRequest,
    });

    if (error) throw error;
    return data as AuthResponse;
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
}

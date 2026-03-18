import createClient from "openapi-fetch";
import type { paths, components } from "./types";
import { API_BASE_URL } from "./config";
import { handleApiError } from "./api_error";

type AuthResponse = components["schemas"]["AuthResponse"];
type LoginRequest = components["schemas"]["LoginRequest"];
type SignupRequest = components["schemas"]["SignupRequest"];

export type AuthMode = "signin" | "signup";

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
});

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
  if (mode === "signin") {
    const { data, error } = await client.POST("/api/auth/login", {
      body: payload as LoginRequest,
    });

    console.log(error);
    if (error) handleApiError(error);
    return data as AuthResponse;
  }

  const { data, error } = await client.POST("/api/auth/signup", {
    body: payload as SignupRequest,
  });

  if (error) handleApiError(error);
  return data as AuthResponse;
}

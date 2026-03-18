import { components } from "./types";

type ErrorResponse = components["schemas"]["ErrorResponse"];

export function handleApiError(error: unknown): never {
  const errorMessage = (error as ErrorResponse).message || "An error occurred";
  throw new Error(errorMessage);
}

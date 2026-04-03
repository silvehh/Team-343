import { describe, expect, it } from "vitest";
import { handleApiError } from "./api_error";

describe("handleApiError", () => {
  it("throws Error with message from error object", () => {
    expect(() => handleApiError({ message: "Not found" })).toThrow("Not found");
  });

  it("throws fallback message when error has no message property", () => {
    expect(() => handleApiError({})).toThrow("An error occurred");
  });

  it("throws fallback message when error.message is empty string", () => {
    expect(() => handleApiError({ message: "" })).toThrow("An error occurred");
  });

  it("throws when error is null", () => {
    expect(() => handleApiError(null)).toThrow();
  });

  it("throws when error is undefined", () => {
    expect(() => handleApiError(undefined)).toThrow();
  });

  it("always throws and never returns", () => {
    let returned = false;
    try {
      handleApiError({ message: "fail" });
      returned = true;
    } catch {
      // expected
    }
    expect(returned).toBe(false);
  });
});

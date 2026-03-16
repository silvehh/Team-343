import { afterEach, describe, expect, it, vi } from "vitest";
import { submitAuth } from "./auth";

describe("submitAuth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns auth response when request succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ userId: 1, email: "user@example.com", message: "Login successful" }),
        headers: { get: () => "application/json" },
      }),
    );

    const response = await submitAuth("signin", "user@example.com", "12345678");

    expect(response.email).toBe("user@example.com");
    expect(response.message).toBe("Login successful");
  });

  it("returns backend signin error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Invalid email or password" }),
        headers: { get: () => "application/json" },
      }),
    );

    await expect(submitAuth("signin", "user@example.com", "wrong-pass")).rejects.toThrow("Invalid email or password");
  });

  it("returns backend signup error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ message: "Email is already registered" }),
        headers: { get: () => "application/json" },
      }),
    );

    await expect(submitAuth("signup", "existing@example.com", "12345678")).rejects.toThrow("Email is already registered");
  });
});

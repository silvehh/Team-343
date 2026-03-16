import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { submitAuth } from "./auth";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
  isAxiosError: (error: unknown) => Boolean(error && typeof error === "object" && "isAxiosError" in (error as object)),
}));

describe("submitAuth", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns auth response when request succeeds", async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { userId: 1, email: "user@example.com", message: "Login successful" },
    } as never);

    const response = await submitAuth("signin", "user@example.com", "12345678");

    expect(response.email).toBe("user@example.com");
    expect(response.message).toBe("Login successful");
  });

  it("returns backend signin error message", async () => {
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: "Invalid email or password" },
      },
    });

    await expect(submitAuth("signin", "user@example.com", "wrong-pass")).rejects.toThrow("Invalid email or password");
  });

  it("returns backend signup error message", async () => {
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: { message: "Email is already registered" },
      },
    });

    await expect(submitAuth("signup", "existing@example.com", "12345678")).rejects.toThrow("Email is already registered");
  });
});

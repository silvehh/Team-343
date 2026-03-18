import { afterEach, describe, expect, it, vi } from "vitest";

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}));

vi.mock("openapi-fetch", () => ({
  default: vi.fn(() => ({
    POST: postMock,
  })),
}));

import { submitAuth } from "./auth";

describe("submitAuth", () => {
  afterEach(() => {
    postMock.mockReset();
    vi.clearAllMocks();
  });

  it("returns auth response when request succeeds", async () => {
    postMock.mockResolvedValue({
      data: {
        userId: 1,
        email: "user@example.com",
        username: "valid.user",
        message: "Login successful",
      },
      error: undefined,
    });

    const response = await submitAuth("signin", {
      email: "user@example.com",
      password: "12345678",
    });

    expect(response.email).toBe("user@example.com");
    expect(response.username).toBe("valid.user");
    expect(response.message).toBe("Login successful");
    expect(postMock).toHaveBeenCalledWith("/api/auth/login", {
      body: { email: "user@example.com", password: "12345678" },
    });
  });

  it("returns backend signin error message", async () => {
    postMock.mockResolvedValue({
      data: undefined,
      error: new Error("Invalid email or password"),
    });

    await expect(
      submitAuth("signin", {
        email: "user@example.com",
        password: "wrong-pass",
      }),
    ).rejects.toThrow("Invalid email or password");
  });

  it("posts username for signup and returns backend signup error message", async () => {
    postMock.mockResolvedValue({
      data: undefined,
      error: new Error("Email is already registered"),
    });

    await expect(
      submitAuth("signup", {
        email: "existing@example.com",
        password: "12345678",
        username: "valid.user",
        accountType: "provider",
        mobilityOptions: ["Scooter", "Bike"],
      }),
    ).rejects.toThrow("Email is already registered");

    expect(postMock).toHaveBeenCalledWith("/api/auth/signup", {
      body: {
        email: "existing@example.com",
        password: "12345678",
        username: "valid.user",
        accountType: "provider",
        mobilityOptions: ["Scooter", "Bike"],
      },
    });
  });

  it("returns signup response including username when request succeeds", async () => {
    postMock.mockResolvedValue({
      data: {
        userId: 2,
        email: "new@example.com",
        username: "new.user",
        message: "Signup successful",
      },
      error: undefined,
    });

    const response = await submitAuth("signup", {
      email: "new@example.com",
      password: "12345678",
      username: "new.user",
      accountType: "provider",
      mobilityOptions: ["Car"],
    });

    expect(response.email).toBe("new@example.com");
    expect(response.username).toBe("new.user");
    expect(response.message).toBe("Signup successful");
    expect(postMock).toHaveBeenCalledWith("/api/auth/signup", {
      body: {
        email: "new@example.com",
        password: "12345678",
        username: "new.user",
        accountType: "provider",
        mobilityOptions: ["Car"],
      },
    });
  });

  it("sends account type for user signup without mobility options", async () => {
    postMock.mockResolvedValue({
      data: {
        userId: 3,
        email: "new2@example.com",
        username: "new.user2",
        message: "Signup successful",
      },
      error: undefined,
    });

    await submitAuth("signup", {
      email: "new2@example.com",
      password: "12345678",
      username: "new.user2",
      accountType: "user",
    });

    expect(postMock).toHaveBeenCalledWith("/api/auth/signup", {
      body: {
        email: "new2@example.com",
        password: "12345678",
        username: "new.user2",
        accountType: "user",
      },
    });
  });

  it("returns fallback message for non-Error failures", async () => {
    postMock.mockResolvedValue({
      data: undefined,
      error: { message: "Backend says no" },
    });

    await expect(
      submitAuth("signin", { email: "user@example.com", password: "12345678" }),
    ).rejects.toThrow(
      "Could not reach the server. Make sure the backend is running.",
    );
  });
});

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
      data: { userId: 1, email: "user@example.com", username: "valid.user", message: "Login successful" },
    } as never);

    const response = await submitAuth("signin", { email: "user@example.com", password: "12345678" });

    expect(response.email).toBe("user@example.com");
    expect(response.username).toBe("valid.user");
    expect(response.message).toBe("Login successful");
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      { email: "user@example.com", password: "12345678" },
    );
  });

  it("returns backend signin error message", async () => {
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: "Invalid email or password" },
      },
    });

    await expect(submitAuth("signin", { email: "user@example.com", password: "wrong-pass" })).rejects.toThrow("Invalid email or password");
  });

  it("posts username for signup and returns backend signup error message", async () => {
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: { message: "Email is already registered" },
      },
    });

    await expect(
      submitAuth("signup", {
        email: "existing@example.com",
        password: "12345678",
        username: "valid.user",
        mobilityOptions: ["Scooter", "Bike"],
      }),
    ).rejects.toThrow("Email is already registered");

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/signup"),
      {
        email: "existing@example.com",
        password: "12345678",
        username: "valid.user",
        mobilityOptions: ["Scooter", "Bike"],
      },
    );
  });

  it("returns signup response including username when request succeeds", async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { userId: 2, email: "new@example.com", username: "new.user", message: "Signup successful" },
    } as never);

    const response = await submitAuth("signup", {
      email: "new@example.com",
      password: "12345678",
      username: "new.user",
      mobilityOptions: ["Car"],
    });

    expect(response.email).toBe("new@example.com");
    expect(response.username).toBe("new.user");
    expect(response.message).toBe("Signup successful");
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/signup"),
      {
        email: "new@example.com",
        password: "12345678",
        username: "new.user",
        mobilityOptions: ["Car"],
      },
    );
  });

  it("sends empty mobility options array for signup when no options are selected", async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { userId: 3, email: "new2@example.com", username: "new.user2", message: "Signup successful" },
    } as never);

    await submitAuth("signup", {
      email: "new2@example.com",
      password: "12345678",
      username: "new.user2",
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/signup"),
      {
        email: "new2@example.com",
        password: "12345678",
        username: "new.user2",
        mobilityOptions: [],
      },
    );
  });
});

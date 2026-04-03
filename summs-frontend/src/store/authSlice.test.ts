import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

// authSlice calls loadFromLocalStorage() at module load time, which accesses
// the bare `localStorage` global. In Node/vitest there is no localStorage,
// so we must polyfill it before the module is evaluated.
// vi.hoisted() runs before any imports, but we can't import authSlice there.
// Instead we use dynamic import() inside beforeAll.

let authReducer: typeof import("./authSlice").default;
let login: typeof import("./authSlice").login;
let logout: typeof import("./authSlice").logout;

const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key];
    }
  }),
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: vi.fn((_index: number) => null),
};

describe("authSlice", () => {
  beforeAll(async () => {
    // Polyfill localStorage before the module is loaded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).localStorage = localStorageMock;
    const mod = await import("./authSlice");
    authReducer = mod.default;
    login = mod.login;
    logout = mod.logout;
  });

  afterEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  function createStore() {
    return configureStore({ reducer: { auth: authReducer } });
  }

  describe("login action", () => {
    it("sets user data and isAuthenticated to true", () => {
      const store = createStore();
      store.dispatch(
        login({
          userId: 1,
          username: "testuser",
          email: "test@example.com",
          accountType: "user",
        }),
      );

      const state = store.getState().auth;
      expect(state.userId).toBe(1);
      expect(state.username).toBe("testuser");
      expect(state.email).toBe("test@example.com");
      expect(state.accountType).toBe("user");
      expect(state.isAuthenticated).toBe(true);
    });

    it("persists to localStorage", () => {
      const store = createStore();
      store.dispatch(
        login({
          userId: 1,
          username: "testuser",
          email: "test@example.com",
          accountType: "user",
        }),
      );

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "summs.auth.userId",
        "1",
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "summs.auth.username",
        "testuser",
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "summs.auth.email",
        "test@example.com",
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "summs.auth.accountType",
        "user",
      );
    });
  });

  describe("logout action", () => {
    it("clears user data and sets isAuthenticated to false", () => {
      const store = createStore();
      store.dispatch(
        login({
          userId: 1,
          username: "testuser",
          email: "test@example.com",
          accountType: "user",
        }),
      );

      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.userId).toBeNull();
      expect(state.username).toBe("");
      expect(state.email).toBe("");
      expect(state.accountType).toBe("");
      expect(state.isAuthenticated).toBe(false);
    });

    it("removes from localStorage", () => {
      const store = createStore();
      store.dispatch(
        login({
          userId: 1,
          username: "testuser",
          email: "test@example.com",
          accountType: "user",
        }),
      );
      vi.clearAllMocks();

      store.dispatch(logout());

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "summs.auth.userId",
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "summs.auth.username",
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "summs.auth.email",
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "summs.auth.accountType",
      );
    });
  });
});

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  userId: number | null;
  username: string;
  email: string;
  accountType: string;
  isAuthenticated: boolean;
}

const AUTH_KEYS = {
  userId: "summs.auth.userId",
  username: "summs.auth.username",
  email: "summs.auth.email",
  accountType: "summs.auth.accountType",
} as const;

function loadFromLocalStorage(): AuthState {
  const userId = localStorage.getItem(AUTH_KEYS.userId);
  const username = localStorage.getItem(AUTH_KEYS.username) ?? "";
  const email = localStorage.getItem(AUTH_KEYS.email) ?? "";
  const accountType = localStorage.getItem(AUTH_KEYS.accountType) ?? "";

  return {
    userId: userId ? Number(userId) : null,
    username,
    email,
    accountType,
    isAuthenticated: !!userId && !!username,
  };
}

const initialState: AuthState = loadFromLocalStorage();

interface LoginPayload {
  userId: number;
  username: string;
  email: string;
  accountType: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<LoginPayload>) {
      const { userId, username, email, accountType } = action.payload;
      state.userId = userId;
      state.username = username;
      state.email = email;
      state.accountType = accountType;
      state.isAuthenticated = true;

      localStorage.setItem(AUTH_KEYS.userId, String(userId));
      localStorage.setItem(AUTH_KEYS.username, username);
      localStorage.setItem(AUTH_KEYS.email, email);
      localStorage.setItem(AUTH_KEYS.accountType, accountType);
    },
    logout(state) {
      state.userId = null;
      state.username = "";
      state.email = "";
      state.accountType = "";
      state.isAuthenticated = false;

      localStorage.removeItem(AUTH_KEYS.userId);
      localStorage.removeItem(AUTH_KEYS.username);
      localStorage.removeItem(AUTH_KEYS.email);
      localStorage.removeItem(AUTH_KEYS.accountType);
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

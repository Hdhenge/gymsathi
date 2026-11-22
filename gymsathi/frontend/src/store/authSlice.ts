import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { apiConfigured } from "../lib/apiClient";
import type { UserProfile } from "../types";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

function getStoredUser(): UserProfile | null {
  try {
    return JSON.parse(localStorage.getItem("user") ?? "null") as UserProfile | null;
  } catch {
    return null;
  }
}

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    if (email.trim().toLowerCase() === "owner@studionorth.fit" && password === "demo1234") {
      return { token: "demo-session", user: { id: "demo-owner", name: "Alex Morgan", email: email.trim(), role: "owner" as const } };
    }
    try {
      if (!apiConfigured) {
        if (!email.trim() || password.length < 6) return rejectWithValue("Enter a valid email and a password with at least 6 characters.");
        return { token: "demo-session", user: { id: "demo-owner", name: "Alex Morgan", email: email.trim(), role: "owner" as const } };
      }
      const response = await api.post("/api/auth/login", { email, password });
      return {
        token: response.data.token as string,
        user: { id: response.data.user.id ?? response.data.user._id, name: response.data.user.name, email: response.data.user.email, role: response.data.user.role, gymId: response.data.user.gymId } as UserProfile,
      };
    } catch (error) {
      const message = (error as { response?: { data?: { msg?: string; error?: string } } })?.response?.data?.msg;
      return rejectWithValue(message ?? "We couldn’t sign you in. Check your details and try again.");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ name, gymName, email, password }: { name: string; gymName: string; email: string; password: string }, { rejectWithValue }) => {
    if (!apiConfigured) {
      return { token: "demo-session", user: { id: "demo-owner", name, email: email.trim(), role: "owner" as const }, gymName };
    }
    try {
      const response = await api.post("/api/auth/register", { name, gymName, email, password, role: "owner" });
      return { token: response.data.token as string, user: { id: response.data.user.id ?? response.data.user._id, name: response.data.user.name, email: response.data.user.email, role: response.data.user.role, gymId: response.data.user.gymId } as UserProfile, gymName };
    } catch (error) {
      const message = (error as { response?: { data?: { msg?: string; error?: string } } })?.response?.data?.msg;
      if ((error as { response?: unknown })?.response === undefined) return rejectWithValue("GymSathi’s API is unavailable. Try again or sign in with the sample workspace.");
      return rejectWithValue(message ?? "Your account couldn’t be created. Please try again.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token"),
    user: getStoredUser(),
    loading: false,
    error: null,
  } as AuthState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

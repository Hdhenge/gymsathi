import { configureStore, type Middleware } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import gymReducer, { persistGymData } from "./gymSlice";
import type { GymData } from "../types";
import { syncGymAction } from "../lib/backendSync";
import { apiConfigured } from "../lib/apiClient";

const workspaceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  if (!apiConfigured) return result;
  const token = store.getState().auth.token;
  if (!token || token === "demo-session") return result;
  const syncableActions = new Set([
    "gym/addMember", "gym/updateMember", "gym/deleteMember", "gym/addLead", "gym/updateLead", "gym/deleteLead",
    "gym/addPayment", "gym/markAttendance", "gym/checkOut", "gym/updateProfile", "gym/addClass", "gym/deleteClass", "gym/bookClass", "gym/cancelClassBooking",
  ]);
  const type = typeof action === "object" && action !== null && "type" in action ? String(action.type) : "";
  if (!syncableActions.has(type)) return result;

  void syncGymAction(
    action as { type: string; payload?: unknown },
    store.getState().gym as GymData,
    (type, payload) => store.dispatch({ type, payload }),
  ).then(() => {
    store.dispatch({ type: "gym/setSyncError", payload: null });
  }).catch((error: unknown) => {
    const message = (error as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
    store.dispatch({ type: "gym/setSyncError", payload: message ?? "Changes are saved here, but could not reach the gym server." });
  });
  return result;
};

const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  if (typeof action === "object" && action !== null && "type" in action && String(action.type).startsWith("gym/")) {
    persistGymData(store.getState().gym as GymData);
  }
  return result;
};

export const store = configureStore({
  reducer: { auth: authReducer, gym: gymReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistenceMiddleware, workspaceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

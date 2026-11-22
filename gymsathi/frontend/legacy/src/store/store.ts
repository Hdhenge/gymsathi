import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import membersReducer from "./membersSlice";
import inquiriesReducer from "./inquiriesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    inquiries: inquiriesReducer,
  },
});

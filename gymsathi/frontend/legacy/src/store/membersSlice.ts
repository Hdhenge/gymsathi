import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/api";

export const fetchMembers = createAsyncThunk(
  "members/fetchMembers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/members");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch members."
      );
    }
  }
);

export const addMember = createAsyncThunk(
  "members/addMember",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/members/add", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to add member."
      );
    }
  }
);

const membersSlice = createSlice({
  name: "members",
  initialState: {
    list: [],
    loading: false,
    adding: false,
    addError: null,
    error: null,
  },
  reducers: {
    clearAddError(state) {
      state.addError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addMember.pending, (state) => {
        state.adding = true;
        state.addError = null;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.adding = false;
        state.list.unshift(action.payload);
      })
      .addCase(addMember.rejected, (state, action) => {
        state.adding = false;
        state.addError = action.payload;
      });
  },
});

export const { clearAddError } = membersSlice.actions;
export default membersSlice.reducer;

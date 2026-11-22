import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/api";

export const fetchInquiries = createAsyncThunk(
  "inquiries/fetchInquiries",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/inquiries");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to fetch inquiries."
      );
    }
  }
);

export const addInquiry = createAsyncThunk(
  "inquiries/addInquiry",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/inquiries/add", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.response?.data?.error || "Failed to add inquiry."
      );
    }
  }
);

export const updateInquiry = createAsyncThunk(
  "inquiries/updateInquiry",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/inquiries/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update inquiry."
      );
    }
  }
);

const inquiriesSlice = createSlice({
  name: "inquiries",
  initialState: {
    list: [],
    loading: false,
    adding: false,
    updatingId: null,
    error: null,
    addError: null,
  },
  reducers: {
    clearInquiryAddError(state) {
      state.addError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchInquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addInquiry.pending, (state) => {
        state.adding = true;
        state.addError = null;
      })
      .addCase(addInquiry.fulfilled, (state, action) => {
        state.adding = false;
        state.list.unshift(action.payload);
      })
      .addCase(addInquiry.rejected, (state, action) => {
        state.adding = false;
        state.addError = action.payload;
      })
      .addCase(updateInquiry.pending, (state, action) => {
        state.updatingId = action.meta.arg.id;
      })
      .addCase(updateInquiry.fulfilled, (state, action) => {
        state.updatingId = null;
        const idx = state.list.findIndex((i) => i._id === action.payload._id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      })
      .addCase(updateInquiry.rejected, (state) => {
        state.updatingId = null;
      });
  },
});

export const { clearInquiryAddError } = inquiriesSlice.actions;
export default inquiriesSlice.reducer;

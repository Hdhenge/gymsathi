import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { demoData } from "../data";
import type { AttendanceRecord, GymClass, GymData, GymProfile, Lead, Member, Payment } from "../types";

const STORAGE_KEY = "gymsathi-data-v1";

function readGymData(): GymData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<GymData>;
      return {
        members: parsed.members ?? demoData.members,
        leads: parsed.leads ?? demoData.leads,
        payments: parsed.payments ?? demoData.payments,
        attendance: parsed.attendance ?? demoData.attendance,
        classes: parsed.classes ?? demoData.classes,
        profile: { ...demoData.profile, ...parsed.profile },
      };
    }
  } catch {
    // A malformed cache is replaced by the demo workspace.
  }
  return demoData;
}

const initialState = readGymData();
const extendedInitialState = { ...initialState, syncError: null as string | null };

const gymSlice = createSlice({
  name: "gym",
  initialState: extendedInitialState,
  reducers: {
    addMember(state, action: PayloadAction<Member>) {
      state.members.unshift(action.payload);
    },
    updateMember(state, action: PayloadAction<Member>) {
      const index = state.members.findIndex((member) => member.id === action.payload.id);
      if (index !== -1) state.members[index] = action.payload;
    },
    deleteMember(state, action: PayloadAction<string>) {
      state.members = state.members.filter((member) => member.id !== action.payload);
    },
    addLead(state, action: PayloadAction<Lead>) {
      state.leads.unshift(action.payload);
    },
    updateLead(state, action: PayloadAction<Lead>) {
      const index = state.leads.findIndex((lead) => lead.id === action.payload.id);
      if (index !== -1) state.leads[index] = action.payload;
    },
    deleteLead(state, action: PayloadAction<string>) {
      state.leads = state.leads.filter((lead) => lead.id !== action.payload);
    },
    addPayment(state, action: PayloadAction<Payment>) {
      state.payments.unshift(action.payload);
      const member = state.members.find((item) => item.id === action.payload.memberId);
      if (member && action.payload.note !== "Initial membership payment") {
        member.paidAmount = Math.min(member.totalFees, member.paidAmount + action.payload.amount);
      }
    },
    markAttendance(state, action: PayloadAction<AttendanceRecord>) {
      state.attendance.unshift(action.payload);
    },
    addClass(state, action: PayloadAction<GymClass>) {
      state.classes.push(action.payload);
      state.classes.sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    },
    deleteClass(state, action: PayloadAction<string>) {
      state.classes = state.classes.filter((item) => item.id !== action.payload);
    },
    bookClass(state, action: PayloadAction<{ classId: string; memberId: string }>) {
      const item = state.classes.find((entry) => entry.id === action.payload.classId);
      if (item && item.memberIds.length < item.capacity && !item.memberIds.includes(action.payload.memberId)) item.memberIds.push(action.payload.memberId);
    },
    cancelClassBooking(state, action: PayloadAction<{ classId: string; memberId: string }>) {
      const item = state.classes.find((entry) => entry.id === action.payload.classId);
      if (item) item.memberIds = item.memberIds.filter((id) => id !== action.payload.memberId);
    },
    replaceClass(state, action: PayloadAction<{ localId: string; item: GymClass }>) {
      const index = state.classes.findIndex((entry) => entry.id === action.payload.localId);
      if (index !== -1) state.classes[index] = action.payload.item;
    },
    checkOut(state, action: PayloadAction<string>) {
      const record = state.attendance.find((item) => item.id === action.payload);
      if (record) record.checkOut = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    },
    updateProfile(state, action: PayloadAction<GymProfile>) {
      state.profile = action.payload;
    },
    createWorkspace(state, action: PayloadAction<GymProfile>) {
      state.members = [];
      state.leads = [];
      state.payments = [];
      state.attendance = [];
      state.classes = [];
      state.profile = action.payload;
      state.syncError = null;
    },
    replaceWorkspace(state, action: PayloadAction<Partial<GymData>>) {
      if (action.payload.members) state.members = action.payload.members;
      if (action.payload.leads) state.leads = action.payload.leads;
      if (action.payload.payments) state.payments = action.payload.payments;
      if (action.payload.attendance) state.attendance = action.payload.attendance;
      if (action.payload.classes) state.classes = action.payload.classes;
      if (action.payload.profile) state.profile = { ...state.profile, ...action.payload.profile };
      state.syncError = null;
    },
    replaceMember(state, action: PayloadAction<{ localId: string; member: Member }>) {
      const index = state.members.findIndex((member) => member.id === action.payload.localId);
      if (index !== -1) state.members[index] = action.payload.member;
      state.payments.forEach((payment) => {
        if (payment.memberId === action.payload.localId) {
          payment.memberId = action.payload.member.id;
          payment.memberName = action.payload.member.name;
        }
      });
    },
    replaceLead(state, action: PayloadAction<{ localId: string; lead: Lead }>) {
      const index = state.leads.findIndex((lead) => lead.id === action.payload.localId);
      if (index !== -1) state.leads[index] = action.payload.lead;
    },
    replacePayment(state, action: PayloadAction<{ localId: string; payment: Payment }>) {
      const index = state.payments.findIndex((payment) => payment.id === action.payload.localId);
      if (index !== -1) state.payments[index] = action.payload.payment;
    },
    replaceAttendanceId(state, action: PayloadAction<{ localId: string; id: string }>) {
      const record = state.attendance.find((item) => item.id === action.payload.localId);
      if (record) record.id = action.payload.id;
    },
    setSyncError(state, action: PayloadAction<string | null>) {
      state.syncError = action.payload;
    },
    resetDemo(state) {
      Object.assign(state, demoData, { syncError: null });
    },
  },
});

export const { addMember, updateMember, deleteMember, addLead, updateLead, deleteLead, addPayment, markAttendance, addClass, deleteClass, bookClass, cancelClassBooking, replaceClass, checkOut, updateProfile, createWorkspace, replaceWorkspace, replaceMember, replaceLead, replacePayment, replaceAttendanceId, setSyncError, resetDemo } = gymSlice.actions;
export default gymSlice.reducer;

export function persistGymData(data: GymData) {
  try {
    const { syncError: _syncError, ...savedData } = data as GymData & { syncError?: string | null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
  } catch {
    // Storage can be unavailable in private browsing; the app remains usable in memory.
  }
}

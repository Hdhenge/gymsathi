import type { GymClass, GymData, Lead, Member, Payment } from "../types";
import type { GymProfile } from "../types";
import api from "./apiClient";

const objectId = /^[a-f\d]{24}$/i;
const toDate = (value: unknown) => value ? new Date(String(value)).toISOString().slice(0, 10) : "";
const toClock = (value: unknown) => value ? new Date(String(value)).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }) : "";

export const isServerId = (id: string) => objectId.test(id);

export function fromServerMember(raw: Record<string, unknown>): Member {
  return {
    id: String(raw._id ?? raw.id), name: String(raw.name ?? ""), email: String(raw.email ?? ""), phone: String(raw.phone ?? ""),
    plan: (raw.plan ?? "custom") as Member["plan"], startDate: toDate(raw.startDate), endDate: toDate(raw.endDate),
    totalFees: Number(raw.totalFees ?? 0), paidAmount: Number(raw.paidAmount ?? 0), trainer: String(raw.trainer ?? ""), goal: String(raw.goal ?? ""), joinedAt: toDate(raw.createdAt ?? raw.startDate),
  };
}

export function fromServerLead(raw: Record<string, unknown>): Lead {
  return {
    id: String(raw._id ?? raw.id), name: String(raw.name ?? ""), phone: String(raw.phone ?? ""), email: String(raw.email ?? ""),
    goal: String(raw.goal ?? ""), source: (raw.source ?? "walk_in") as Lead["source"], status: (raw.status ?? "new") as Lead["status"],
    followUpDate: toDate(raw.followUpDate), createdAt: toDate(raw.createdAt), notes: String(raw.notes ?? ""),
  };
}

export function fromServerPayment(raw: Record<string, unknown>): Payment {
  const member = raw.memberId && typeof raw.memberId === "object" ? raw.memberId as Record<string, unknown> : {};
  const rawMethod = String(raw.paymentType ?? "cash");
  const method = (rawMethod === "online" ? "upi" : rawMethod) as Payment["method"];
  return {
    id: String(raw._id ?? raw.id), memberId: String(member._id ?? raw.memberId ?? ""), memberName: String(member.name ?? raw.memberName ?? "Member"),
    amount: Number(raw.amount ?? 0), method, date: String(raw.createdAt ?? raw.date ?? new Date().toISOString()), note: String(raw.note ?? ""),
  };
}

export function fromServerAttendance(raw: Record<string, unknown>, member: Member): GymData["attendance"] {
  const entries = Array.isArray(raw.attendance) ? raw.attendance as Array<Record<string, unknown>> : [];
  return entries.map((entry) => ({ id: String(entry._id ?? `${member.id}-${entry.date}`), memberId: member.id, memberName: member.name, date: toDate(entry.date), checkIn: toClock(entry.checkInTime), checkOut: entry.checkOutTime ? toClock(entry.checkOutTime) : undefined }));
}

export function toServerMember(member: Member) {
  return { name: member.name, email: member.email, phone: member.phone, plan: member.plan, startDate: member.startDate, endDate: member.endDate, totalFees: member.totalFees, paidAmount: member.paidAmount, trainer: member.trainer, goal: member.goal };
}

export function toServerLead(lead: Lead) {
  return { name: lead.name, phone: lead.phone, email: lead.email, goal: lead.goal, source: lead.source, status: lead.status, followUpDate: lead.followUpDate || null, notes: lead.notes };
}

export function fromServerClass(raw: Record<string, unknown>): GymClass {
  const memberIds = Array.isArray(raw.memberIds) ? raw.memberIds.map((member) => String(typeof member === "object" && member !== null ? (member as Record<string, unknown>)._id : member)) : [];
  return {
    id: String(raw._id ?? raw.id), title: String(raw.title ?? ""), category: (raw.category ?? "strength") as GymClass["category"], trainer: String(raw.trainer ?? ""),
    date: toDate(raw.date), startTime: String(raw.startTime ?? "18:00"), durationMinutes: Number(raw.durationMinutes ?? 45), capacity: Number(raw.capacity ?? 12), memberIds,
  };
}

export function toServerClass(item: GymClass) {
  return { title: item.title, category: item.category, trainer: item.trainer, date: item.date, startTime: item.startTime, durationMinutes: item.durationMinutes, capacity: item.capacity };
}

export async function hydrateServerWorkspace() {
  const settled = await Promise.allSettled([
    api.get("/api/members"), api.get("/api/inquiries"), api.get("/api/payments"), api.get("/api/gyms"), api.get("/api/classes"),
  ]);
  if (settled.every((result) => result.status === "rejected")) throw new Error("Could not load the gym workspace.");
  const membersResponse = settled[0].status === "fulfilled" && Array.isArray(settled[0].value.data) ? settled[0].value.data as Array<Record<string, unknown>> : null;
  const leadsResponse = settled[1].status === "fulfilled" && Array.isArray(settled[1].value.data) ? settled[1].value.data as Array<Record<string, unknown>> : null;
  const paymentsResponse = settled[2].status === "fulfilled" && Array.isArray(settled[2].value.data) ? settled[2].value.data as Array<Record<string, unknown>> : null;
  const gymsResponse = settled[3].status === "fulfilled" && Array.isArray(settled[3].value.data) ? settled[3].value.data as Array<Record<string, unknown>> : null;
  const classesResponse = settled[4].status === "fulfilled" && Array.isArray(settled[4].value.data) ? settled[4].value.data as Array<Record<string, unknown>> : null;
  const serverMembers = membersResponse?.map(fromServerMember);
  const profile = gymsResponse?.[0] ? {
    id: String(gymsResponse[0]._id), name: String(gymsResponse[0].gymName ?? "Studio"), address: String(gymsResponse[0].gymAddress ?? ""),
    phone: String(gymsResponse[0].gymPhone ?? ""), email: String(gymsResponse[0].gymEmail ?? ""), currency: "INR" as const,
  } satisfies GymProfile : undefined;
  const data: Partial<GymData> = {};
  if (serverMembers) {
    data.members = serverMembers;
    data.attendance = (membersResponse ?? []).flatMap((raw, index) => fromServerAttendance(raw, serverMembers[index]));
  }
  if (leadsResponse) data.leads = leadsResponse.map(fromServerLead);
  if (paymentsResponse) data.payments = paymentsResponse.map(fromServerPayment);
  if (classesResponse) data.classes = classesResponse.map(fromServerClass);
  if (profile) data.profile = profile;
  return data;
}

export async function syncGymAction(action: { type: string; payload?: unknown }, data: GymData, replace: (type: string, payload: unknown) => void) {
  const payload = action.payload;
  const stringPayloadActions = new Set(["gym/deleteMember", "gym/deleteLead", "gym/deleteClass", "gym/checkOut"]);
  if ((typeof payload !== "object" || payload === null) && !stringPayloadActions.has(action.type)) return;
  const body = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {};
  switch (action.type) {
    case "gym/addMember": {
      const member = body as unknown as Member;
      const response = await api.post("/api/members/add", toServerMember(member));
      replace("gym/replaceMember", { localId: member.id, member: fromServerMember(response.data) });
      break;
    }
    case "gym/updateMember": {
      const member = body as unknown as Member;
      if (isServerId(member.id)) await api.put(`/api/members/${member.id}`, toServerMember(member));
      break;
    }
    case "gym/deleteMember":
      if (isServerId(String(payload))) await api.delete(`/api/members/${String(payload)}`);
      break;
    case "gym/addLead": {
      const lead = body as unknown as Lead;
      const response = await api.post("/api/inquiries/add", toServerLead(lead));
      replace("gym/replaceLead", { localId: lead.id, lead: fromServerLead(response.data) });
      break;
    }
    case "gym/updateLead": {
      const lead = body as unknown as Lead;
      if (isServerId(lead.id)) await api.put(`/api/inquiries/${lead.id}`, toServerLead(lead));
      break;
    }
    case "gym/deleteLead":
      if (isServerId(String(payload))) await api.delete(`/api/inquiries/${String(payload)}`);
      break;
    case "gym/addPayment": {
      const payment = body as unknown as Payment;
      if (isServerId(payment.memberId)) {
        const response = await api.post("/api/payments/add", { memberId: payment.memberId, amount: payment.amount, paymentType: payment.method, note: payment.note });
        replace("gym/replacePayment", { localId: payment.id, payment: fromServerPayment({ ...response.data, memberId: { _id: payment.memberId, name: payment.memberName } }) });
      }
      break;
    }
    case "gym/markAttendance": {
      const record = body as unknown as GymData["attendance"][number];
      if (isServerId(record.memberId)) {
        const response = await api.post(`/api/members/${record.memberId}/attendance`, { date: `${record.date}T00:00:00.000Z`, checkInTime: new Date().toISOString(), status: "present" });
        const saved = Array.isArray(response.data.attendance) ? response.data.attendance.at(-1) as Record<string, unknown> : null;
        if (saved?._id) replace("gym/replaceAttendanceId", { localId: record.id, id: String(saved._id) });
      }
      break;
    }
    case "gym/checkOut": {
      const recordId = String(payload);
      const record = data.attendance.find((entry) => entry.id === recordId);
      if (record && isServerId(record.memberId) && isServerId(record.id)) await api.put(`/api/members/${record.memberId}/attendance/${record.id}`, { checkOutTime: new Date().toISOString(), status: "present" });
      break;
    }
    case "gym/addClass": {
      const item = body as unknown as GymClass;
      const response = await api.post("/api/classes", toServerClass(item));
      replace("gym/replaceClass", { localId: item.id, item: fromServerClass(response.data) });
      break;
    }
    case "gym/deleteClass":
      if (isServerId(String(payload))) await api.delete(`/api/classes/${String(payload)}`);
      break;
    case "gym/bookClass": {
      const booking = body as { classId: string; memberId: string };
      if (isServerId(booking.classId) && isServerId(booking.memberId)) await api.post(`/api/classes/${booking.classId}/bookings`, { memberId: booking.memberId });
      break;
    }
    case "gym/cancelClassBooking": {
      const booking = body as { classId: string; memberId: string };
      if (isServerId(booking.classId) && isServerId(booking.memberId)) await api.delete(`/api/classes/${booking.classId}/bookings/${booking.memberId}`);
      break;
    }
    case "gym/updateProfile": {
      const profile = body as unknown as GymProfile;
      if (profile.id && isServerId(profile.id)) await api.put(`/api/gyms/${profile.id}`, { gymName: profile.name, gymEmail: profile.email, gymAddress: profile.address, gymPhone: profile.phone });
      break;
    }
  }
}

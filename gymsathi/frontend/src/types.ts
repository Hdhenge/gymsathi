export type MemberPlan = "monthly" | "quarterly" | "yearly" | "custom";
export type MemberStatus = "active" | "expiring" | "expired";
export type LeadStatus = "new" | "follow_up" | "converted" | "closed";
export type LeadSource = "walk_in" | "call" | "instagram" | "facebook" | "referral" | "other";
export type PaymentMethod = "cash" | "upi" | "card" | "bank_transfer";
export type ClassCategory = "strength" | "yoga" | "conditioning" | "cycling" | "mobility";

export interface GymClass {
  id: string;
  title: string;
  category: ClassCategory;
  trainer: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  memberIds: string[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: MemberPlan;
  startDate: string;
  endDate: string;
  totalFees: number;
  paidAmount: number;
  trainer: string;
  goal: string;
  joinedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  goal: string;
  source: LeadSource;
  status: LeadStatus;
  followUpDate: string;
  createdAt: string;
  notes: string;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  note: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
}

export interface GymProfile {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  currency: "INR";
}

export interface GymData {
  members: Member[];
  leads: Lead[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  classes: GymClass[];
  profile: GymProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  gymId?: string;
  role: "owner" | "admin" | "trainer";
}

export const PLAN_LABELS: Record<MemberPlan, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Annual",
  custom: "Custom",
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  walk_in: "Walk-in",
  call: "Phone call",
  instagram: "Instagram",
  facebook: "Facebook",
  referral: "Referral",
  other: "Other",
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank transfer",
};

export const CLASS_CATEGORY_LABELS: Record<ClassCategory, string> = {
  strength: "Strength",
  yoga: "Yoga",
  conditioning: "Conditioning",
  cycling: "Cycling",
  mobility: "Mobility",
};

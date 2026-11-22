import type { AttendanceRecord, GymClass, GymData, Lead, Member, Payment } from "./types";
import { dateKey, shiftDate } from "./lib/dates";

const dateOffset = (days: number) => {
  return shiftDate(dateKey(), days);
};

const dateTimeOffset = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() + hours, 0, 0, 0);
  return date.toISOString();
};

const members: Member[] = [
  { id: "m-101", name: "Ananya Sharma", email: "ananya.sharma@email.com", phone: "+91 98765 43210", plan: "yearly", startDate: dateOffset(-112), endDate: dateOffset(253), totalFees: 18000, paidAmount: 18000, trainer: "Arjun Mehta", goal: "Strength", joinedAt: dateOffset(-112) },
  { id: "m-102", name: "Rohan Kapoor", email: "rohan.k@email.com", phone: "+91 98990 11223", plan: "monthly", startDate: dateOffset(-26), endDate: dateOffset(4), totalFees: 2500, paidAmount: 2500, trainer: "Priya Nair", goal: "Fat loss", joinedAt: dateOffset(-26) },
  { id: "m-103", name: "Meera Iyer", email: "meera.iyer@email.com", phone: "+91 98111 45678", plan: "quarterly", startDate: dateOffset(-77), endDate: dateOffset(13), totalFees: 6500, paidAmount: 4500, trainer: "Arjun Mehta", goal: "Mobility", joinedAt: dateOffset(-77) },
  { id: "m-104", name: "Kabir Singh", email: "kabir.singh@email.com", phone: "+91 98100 22334", plan: "monthly", startDate: dateOffset(-43), endDate: dateOffset(-13), totalFees: 2500, paidAmount: 1500, trainer: "Dev Malhotra", goal: "Muscle gain", joinedAt: dateOffset(-43) },
  { id: "m-105", name: "Zara Khan", email: "zara.khan@email.com", phone: "+91 98334 00991", plan: "yearly", startDate: dateOffset(-212), endDate: dateOffset(153), totalFees: 18000, paidAmount: 12000, trainer: "Priya Nair", goal: "General fitness", joinedAt: dateOffset(-212) },
  { id: "m-106", name: "Aarav Patel", email: "aarav.p@email.com", phone: "+91 98980 77889", plan: "quarterly", startDate: dateOffset(-100), endDate: dateOffset(-10), totalFees: 6500, paidAmount: 6500, trainer: "Dev Malhotra", goal: "Strength", joinedAt: dateOffset(-100) },
  { id: "m-107", name: "Diya Reddy", email: "diya.reddy@email.com", phone: "+91 98450 66778", plan: "monthly", startDate: dateOffset(-5), endDate: dateOffset(25), totalFees: 2500, paidAmount: 2500, trainer: "Arjun Mehta", goal: "Conditioning", joinedAt: dateOffset(-5) },
  { id: "m-108", name: "Ishaan Verma", email: "ishaan.v@email.com", phone: "+91 98222 55443", plan: "quarterly", startDate: dateOffset(-65), endDate: dateOffset(25), totalFees: 6500, paidAmount: 6500, trainer: "Priya Nair", goal: "Weight loss", joinedAt: dateOffset(-65) },
  { id: "m-109", name: "Sana Das", email: "sana.das@email.com", phone: "+91 98919 33445", plan: "yearly", startDate: dateOffset(-35), endDate: dateOffset(330), totalFees: 18000, paidAmount: 18000, trainer: "Dev Malhotra", goal: "Strength", joinedAt: dateOffset(-35) },
  { id: "m-110", name: "Vihaan Joshi", email: "vihaan.j@email.com", phone: "+91 98250 44556", plan: "monthly", startDate: dateOffset(-20), endDate: dateOffset(10), totalFees: 2500, paidAmount: 1000, trainer: "Arjun Mehta", goal: "General fitness", joinedAt: dateOffset(-20) },
  { id: "m-111", name: "Tara Menon", email: "tara.menon@email.com", phone: "+91 98470 33667", plan: "quarterly", startDate: dateOffset(-42), endDate: dateOffset(48), totalFees: 6500, paidAmount: 6500, trainer: "Priya Nair", goal: "Mobility", joinedAt: dateOffset(-42) },
  { id: "m-112", name: "Aditya Bose", email: "aditya.bose@email.com", phone: "+91 98300 22778", plan: "monthly", startDate: dateOffset(-62), endDate: dateOffset(-32), totalFees: 2500, paidAmount: 2500, trainer: "Dev Malhotra", goal: "Muscle gain", joinedAt: dateOffset(-62) },
];

const leads: Lead[] = [
  { id: "l-301", name: "Nisha Gupta", phone: "+91 98100 44556", email: "nisha.g@email.com", goal: "Build a consistent routine", source: "instagram", status: "new", followUpDate: dateOffset(0), createdAt: dateOffset(-1), notes: "Interested in morning classes" },
  { id: "l-302", name: "Karan Malhotra", phone: "+91 98990 88776", email: "karan.m@email.com", goal: "Strength training", source: "referral", status: "follow_up", followUpDate: dateOffset(1), createdAt: dateOffset(-4), notes: "Send quarterly plan details" },
  { id: "l-303", name: "Pooja Shah", phone: "+91 98220 11887", email: "pooja.s@email.com", goal: "Lose 8 kg", source: "walk_in", status: "new", followUpDate: dateOffset(2), createdAt: dateOffset(-2), notes: "Trial session completed" },
  { id: "l-304", name: "Neil Fernandes", phone: "+91 98770 11223", email: "neil.f@email.com", goal: "Improve mobility", source: "call", status: "follow_up", followUpDate: dateOffset(0), createdAt: dateOffset(-6), notes: "Prefers evening sessions" },
  { id: "l-305", name: "Riya Sethi", phone: "+91 98001 23456", email: "riya.s@email.com", goal: "Personal training", source: "facebook", status: "converted", followUpDate: "", createdAt: dateOffset(-9), notes: "Joined on annual plan" },
];

const payments: Payment[] = [
  { id: "p-201", memberId: "m-101", memberName: "Ananya Sharma", amount: 18000, method: "upi", date: dateTimeOffset(-3), note: "Annual membership" },
  { id: "p-202", memberId: "m-102", memberName: "Rohan Kapoor", amount: 2500, method: "cash", date: dateTimeOffset(-8), note: "Monthly renewal" },
  { id: "p-203", memberId: "m-103", memberName: "Meera Iyer", amount: 4500, method: "card", date: dateTimeOffset(-15), note: "Quarterly plan · part payment" },
  { id: "p-204", memberId: "m-107", memberName: "Diya Reddy", amount: 2500, method: "upi", date: dateTimeOffset(-20), note: "Monthly membership" },
  { id: "p-205", memberId: "m-109", memberName: "Sana Das", amount: 18000, method: "bank_transfer", date: dateTimeOffset(-28), note: "Annual membership" },
  { id: "p-206", memberId: "m-110", memberName: "Vihaan Joshi", amount: 1000, method: "cash", date: dateTimeOffset(-38), note: "Monthly plan · deposit" },
  { id: "p-207", memberId: "m-105", memberName: "Zara Khan", amount: 12000, method: "upi", date: dateTimeOffset(-52), note: "Annual plan · part payment" },
  { id: "p-208", memberId: "m-108", memberName: "Ishaan Verma", amount: 6500, method: "card", date: dateTimeOffset(-65), note: "Quarterly membership" },
];

const attendance: AttendanceRecord[] = [
  { id: "a-401", memberId: "m-101", memberName: "Ananya Sharma", date: dateOffset(0), checkIn: "06:12" },
  { id: "a-402", memberId: "m-103", memberName: "Meera Iyer", date: dateOffset(0), checkIn: "06:38", checkOut: "07:52" },
  { id: "a-403", memberId: "m-105", memberName: "Zara Khan", date: dateOffset(0), checkIn: "07:04" },
  { id: "a-404", memberId: "m-107", memberName: "Diya Reddy", date: dateOffset(0), checkIn: "07:31", checkOut: "08:44" },
  { id: "a-405", memberId: "m-109", memberName: "Sana Das", date: dateOffset(0), checkIn: "08:02" },
];

const classes: GymClass[] = [
  { id: "c-501", title: "Strength foundations", category: "strength", trainer: "Arjun Mehta", date: dateOffset(0), startTime: "07:00", durationMinutes: 50, capacity: 12, memberIds: ["m-101", "m-103", "m-107", "m-109"] },
  { id: "c-502", title: "Slow flow yoga", category: "yoga", trainer: "Priya Nair", date: dateOffset(0), startTime: "09:00", durationMinutes: 45, capacity: 10, memberIds: ["m-105", "m-111"] },
  { id: "c-503", title: "Ride & reset", category: "cycling", trainer: "Dev Malhotra", date: dateOffset(0), startTime: "18:00", durationMinutes: 45, capacity: 14, memberIds: ["m-102", "m-108", "m-110"] },
  { id: "c-504", title: "Mobility lab", category: "mobility", trainer: "Priya Nair", date: dateOffset(1), startTime: "08:00", durationMinutes: 40, capacity: 10, memberIds: ["m-103", "m-111"] },
  { id: "c-505", title: "Full-body circuit", category: "conditioning", trainer: "Arjun Mehta", date: dateOffset(1), startTime: "18:30", durationMinutes: 50, capacity: 12, memberIds: ["m-101", "m-107", "m-109"] },
  { id: "c-506", title: "Power hour", category: "strength", trainer: "Dev Malhotra", date: dateOffset(2), startTime: "07:30", durationMinutes: 60, capacity: 12, memberIds: ["m-102", "m-108"] },
  { id: "c-507", title: "Sunday stretch", category: "yoga", trainer: "Priya Nair", date: dateOffset(3), startTime: "09:30", durationMinutes: 50, capacity: 10, memberIds: ["m-105", "m-111", "m-103"] },
];

export const demoData: GymData = {
  members,
  leads,
  payments,
  attendance,
  classes,
  profile: {
    name: "Studio North",
    address: "14, Lake View Road, Bengaluru",
    phone: "+91 80 4567 8900",
    email: "hello@studionorth.fit",
    currency: "INR",
  },
};

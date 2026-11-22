const Joi = require("joi");

const phone = Joi.string().trim().pattern(/^\+?[0-9 ()-]{8,18}$/).messages({
  "string.pattern.base": "Enter a valid phone number.",
});

const memberFields = {
  name: Joi.string().trim().min(2).max(80),
  phone,
  email: Joi.string().trim().email({ tlds: { allow: false } }).allow(""),
  plan: Joi.string().valid("monthly", "quarterly", "yearly", "custom"),
  totalFees: Joi.number().min(0),
  paidAmount: Joi.number().min(0),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  trainer: Joi.string().trim().allow(""),
  goal: Joi.string().trim().allow(""),
};

const memberCreate = Joi.object({
  ...memberFields,
  name: memberFields.name.required(),
  phone: memberFields.phone.required(),
  plan: memberFields.plan.required(),
  totalFees: memberFields.totalFees.required(),
  paidAmount: memberFields.paidAmount.default(0),
  startDate: memberFields.startDate.required(),
  endDate: memberFields.endDate.required(),
}).custom((value, helpers) => {
  if (value.paidAmount > value.totalFees) return helpers.error("any.invalid");
  if (new Date(value.endDate) <= new Date(value.startDate)) return helpers.error("date.greater");
  return value;
}).messages({ "any.invalid": "Amount paid cannot exceed the membership fee.", "date.greater": "End date must be after the start date." });

const memberUpdate = Joi.object(memberFields).min(1).custom((value, helpers) => {
  if (value.paidAmount !== undefined && value.totalFees !== undefined && value.paidAmount > value.totalFees) return helpers.error("any.invalid");
  if (value.endDate && value.startDate && new Date(value.endDate) <= new Date(value.startDate)) return helpers.error("date.greater");
  return value;
}).messages({ "any.invalid": "Amount paid cannot exceed the membership fee.", "date.greater": "End date must be after the start date." });

const inquiryCreate = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  phone: phone.required(),
  email: Joi.string().trim().email({ tlds: { allow: false } }).allow(""),
  goal: Joi.string().trim().max(240).allow(""),
  source: Joi.string().valid("walk_in", "call", "instagram", "facebook", "referral", "other").default("walk_in"),
  status: Joi.string().valid("new", "follow_up", "converted", "closed").default("new"),
  followUpDate: Joi.date().iso().allow(null, ""),
  notes: Joi.string().trim().max(1000).allow(""),
});

const inquiryUpdate = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  phone,
  email: Joi.string().trim().email({ tlds: { allow: false } }).allow(""),
  goal: Joi.string().trim().max(240).allow(""),
  source: Joi.string().valid("walk_in", "call", "instagram", "facebook", "referral", "other"),
  status: Joi.string().valid("new", "follow_up", "converted", "closed"),
  followUpDate: Joi.date().iso().allow(null, ""),
  notes: Joi.string().trim().max(1000).allow(""),
}).min(1);

const paymentCreate = Joi.object({
  memberId: Joi.string().hex().length(24).required(),
  amount: Joi.number().positive().required(),
  paymentType: Joi.string().valid("cash", "online", "upi", "card", "bank_transfer").default("cash"),
  note: Joi.string().trim().max(300).allow(""),
});

const paymentUpdate = Joi.object({
  paymentType: Joi.string().valid("cash", "online", "upi", "card", "bank_transfer"),
  note: Joi.string().trim().max(300).allow(""),
}).min(1);

const attendanceCreate = Joi.object({
  date: Joi.date().iso().required(),
  checkInTime: Joi.date().iso().default(() => new Date()),
  status: Joi.string().valid("present", "absent", "late").default("present"),
});

const attendanceUpdate = Joi.object({
  checkOutTime: Joi.date().iso(),
  status: Joi.string().valid("present", "absent", "late"),
}).min(1);

const login = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(6).max(128).required(),
});

const register = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).max(128).required(),
  gymName: Joi.string().trim().min(2).max(100).required(),
});

const trainerCreate = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).max(128).required(),
});

const userUpdate = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }),
  password: Joi.string().min(8).max(128),
}).min(1);

const subscriptionCreate = Joi.object({
  plan: Joi.string().valid("basic", "pro", "premium").required(),
  status: Joi.string().valid("active", "inactive", "cancelled").default("inactive"),
  startDate: Joi.date().iso().allow(null),
  nextBillingDate: Joi.date().iso().allow(null),
});

const subscriptionUpdate = Joi.object({
  plan: Joi.string().valid("basic", "pro", "premium"),
  status: Joi.string().valid("active", "inactive", "cancelled"),
  startDate: Joi.date().iso().allow(null),
  nextBillingDate: Joi.date().iso().allow(null),
}).min(1);

const classCreate = Joi.object({
  title: Joi.string().trim().min(3).max(72).required(),
  category: Joi.string().valid("strength", "yoga", "conditioning", "cycling", "mobility").required(),
  trainer: Joi.string().trim().min(2).max(80).required(),
  date: Joi.date().iso().required(),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
  durationMinutes: Joi.number().integer().min(15).max(180).required(),
  capacity: Joi.number().integer().min(1).max(50).required(),
});

const classBooking = Joi.object({
  memberId: Joi.string().hex().length(24).required(),
});

module.exports = { memberCreate, memberUpdate, inquiryCreate, inquiryUpdate, paymentCreate, paymentUpdate, attendanceCreate, attendanceUpdate, login, register, trainerCreate, userUpdate, subscriptionCreate, subscriptionUpdate, classCreate, classBooking };

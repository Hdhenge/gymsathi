import Joi from "joi";

export const memberSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required().messages({
    "string.empty": "Enter the member’s full name.",
    "string.min": "Name must have at least 2 characters.",
  }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).allow("").messages({
    "string.email": "Enter a valid email address.",
  }),
  phone: Joi.string().trim().pattern(/^\+?[0-9 ()-]{8,18}$/).required().messages({
    "string.pattern.base": "Enter a valid phone number.",
    "string.empty": "Enter a phone number.",
  }),
  plan: Joi.string().valid("monthly", "quarterly", "yearly", "custom").required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  totalFees: Joi.number().min(0).required().messages({
    "number.min": "Membership fee cannot be negative.",
  }),
  paidAmount: Joi.number().min(0).required().messages({
    "number.min": "Paid amount cannot be negative.",
  }),
  trainer: Joi.string().trim().allow(""),
  goal: Joi.string().trim().allow(""),
}).custom((value, helpers) => {
  if (value.paidAmount > value.totalFees) {
    return helpers.error("any.custom", { message: "Amount paid cannot exceed the membership fee." });
  }
  if (new Date(value.endDate) <= new Date(value.startDate)) {
    return helpers.error("any.custom", { message: "End date must be after the start date." });
  }
  return value;
}).messages({ "any.custom": "Check the dates and payment amounts." });

export const leadSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required().messages({ "string.empty": "Enter the prospect’s name." }),
  phone: Joi.string().trim().pattern(/^\+?[0-9 ()-]{8,18}$/).required().messages({ "string.pattern.base": "Enter a valid phone number." }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).allow("").messages({ "string.email": "Enter a valid email address." }),
  goal: Joi.string().trim().allow(""),
  source: Joi.string().valid("walk_in", "call", "instagram", "facebook", "referral", "other").required(),
  followUpDate: Joi.string().allow(""),
  notes: Joi.string().trim().allow(""),
});

export const paymentSchema = Joi.object({
  memberId: Joi.string().required().messages({ "string.empty": "Choose a member for this payment." }),
  amount: Joi.number().min(1).required().messages({ "number.min": "Payment must be at least ₹1." }),
  method: Joi.string().valid("cash", "upi", "card", "bank_transfer").required(),
  note: Joi.string().trim().allow(""),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({ "string.empty": "Enter your email address.", "string.email": "Enter a valid email address." }),
  password: Joi.string().min(6).required().messages({ "string.empty": "Enter your password.", "string.min": "Use at least 6 characters." }),
});

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required().messages({ "string.empty": "Enter your name." }),
  gymName: Joi.string().trim().min(2).max(100).required().messages({ "string.empty": "Enter your gym’s name." }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({ "string.empty": "Enter your email address.", "string.email": "Enter a valid email address." }),
  password: Joi.string().min(8).required().messages({ "string.empty": "Create a password.", "string.min": "Use at least 8 characters." }),
});

export const profileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required().messages({ "string.empty": "Enter your gym’s name." }),
  address: Joi.string().trim().max(160).allow(""),
  phone: Joi.string().trim().pattern(/^\+?[0-9 ()-]{8,18}$/).allow("").messages({ "string.pattern.base": "Enter a valid phone number." }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({ "string.email": "Enter a valid email address." }),
  currency: Joi.string().valid("INR").required(),
});

export const classSchema = Joi.object({
  title: Joi.string().trim().min(3).max(72).required().messages({ "string.empty": "Give this class a name." }),
  category: Joi.string().valid("strength", "yoga", "conditioning", "cycling", "mobility").required(),
  trainer: Joi.string().trim().min(2).max(80).required().messages({ "string.empty": "Add a trainer." }),
  date: Joi.string().isoDate().required(),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
  durationMinutes: Joi.number().integer().min(15).max(180).required(),
  capacity: Joi.number().integer().min(1).max(50).required(),
});

export function joiErrors(error: Joi.ValidationError | undefined): Record<string, string> {
  if (!error) return {};
  return error.details.reduce<Record<string, string>>((acc, detail) => {
    const key = String(detail.path[0] ?? "form");
    acc[key] ??= detail.message;
    return acc;
  }, {});
}

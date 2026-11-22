import type { GymProfile, Member } from "../types";

export function paymentReminderMessage(member: Member, gym: GymProfile) {
  const balance = Math.max(member.totalFees - member.paidAmount, 0);
  const amount = new Intl.NumberFormat("en-IN", { style: "currency", currency: gym.currency, maximumFractionDigits: 0 }).format(balance);
  const firstName = member.name.trim().split(/\s+/)[0] || "there";
  return `Hi ${firstName}, a friendly reminder from ${gym.name}: your membership balance of ${amount} is pending. If you have already paid, please ignore this message. For help, contact us at ${gym.phone || gym.email}. Thank you!`;
}

export function paymentReminderLinks(member: Member, gym: GymProfile) {
  const digits = member.phone.replace(/\D/g, "");
  const whatsappNumber = digits.length === 10 ? `91${digits}` : digits;
  const message = encodeURIComponent(paymentReminderMessage(member, gym));
  return {
    whatsapp: `https://wa.me/${whatsappNumber}?text=${message}`,
    sms: `sms:${digits}?body=${message}`,
  };
}

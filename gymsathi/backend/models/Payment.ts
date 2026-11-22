const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true
  },

  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gym",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  paymentType: {
    type: String,
    enum: ["cash", "online", "upi", "card", "bank_transfer"],
    default: "cash"
  },

  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  note: String

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);

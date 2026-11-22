const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    goal: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      enum: ["walk_in", "call", "instagram", "facebook", "referral", "other"],
      default: "walk_in",
    },
    status: {
      type: String,
      enum: ["new", "follow_up", "converted", "closed"],
      default: "new",
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);

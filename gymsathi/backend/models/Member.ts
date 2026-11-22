const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ""
  },

  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gym",
    required: true
  },

  plan: {
    type: String,
    enum: ["monthly", "quarterly", "yearly", "custom"],
    required: true
  },

  trainer: {
    type: String,
    default: ""
  },

  goal: {
    type: String,
    default: ""
  },

  totalFees: {
    type: Number,
    required: true
  },

  paidAmount: {
    type: Number,
    default: 0
  },

  remainingAmount: {
    type: Number,
    default: 0
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active"
  },

  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  attendance: [{
    date: {
      type: Date,
      required: true
    },
    checkInTime: {
      type: Date
    },
    checkOutTime: {
      type: Date
    },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "present"
    }
  }]

}, { timestamps: true });

memberSchema.index({ gymId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model("Member", memberSchema);

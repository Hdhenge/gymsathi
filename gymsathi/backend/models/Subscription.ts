const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  plan: {
    type: String,
    enum: ["basic", "pro", "premium"]
  },

  status: {
    type: String,
    enum: ["active", "inactive", "cancelled"],
    default: "inactive"
  },

  razorpaySubId: String,

  startDate: Date,
  nextBillingDate: Date

}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
const mongoose = require("mongoose");

const gymSchema = new mongoose.Schema({
  gymName: {
    type: String,
    required: true
  },

  gymAddress: {
    type: String,
    trim: true,
    default: ""
  },

  gymPhone: {
    type: String,
    trim: true,
    default: ""
  },

  gymEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  gymPassword: {
    type: String,
    required: true
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  monthlyFee: {
    type: Number,
    default: 0
  },

  yearlyFee: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("Gym", gymSchema);

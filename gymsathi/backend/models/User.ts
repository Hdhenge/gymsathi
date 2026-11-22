const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "owner", "trainer"],
    default: "trainer"
  },

  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gym"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function() { return this.role === 'trainer'; }
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
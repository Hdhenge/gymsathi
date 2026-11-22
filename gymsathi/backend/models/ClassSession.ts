const mongoose = require("mongoose");

const classSessionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 72 },
  category: { type: String, enum: ["strength", "yoga", "conditioning", "cycling", "mobility"], required: true },
  trainer: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  durationMinutes: { type: Number, required: true, min: 15, max: 180 },
  capacity: { type: Number, required: true, min: 1, max: 50 },
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }],
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

classSessionSchema.index({ gymId: 1, date: 1, startTime: 1 });

module.exports = mongoose.model("ClassSession", classSessionSchema);

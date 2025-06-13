const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  title: { type: String, required: true },
  description: { type: String },
  targetDate: { type: Date },
  status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.model("Goal", GoalSchema);

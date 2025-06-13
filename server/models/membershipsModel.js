const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  type: { type: String, enum: ["monthly", "yearly", "weekly", "custom"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  paymentStatus: { type: String, enum: ["paid", "unpaid", "pending"], default: "pending" },
  price: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("Membership", MembershipSchema);

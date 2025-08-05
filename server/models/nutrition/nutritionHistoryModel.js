const mongoose = require("mongoose");

const NutritionHistorySchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  nutritionPlan: { type: Object, required: true },
  archivedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("NutritionHistory", NutritionHistorySchema);
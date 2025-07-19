const mongoose = require("mongoose");

const NutritionSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  macros: {
    kcal: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("NutritionPlan", NutritionSchema);

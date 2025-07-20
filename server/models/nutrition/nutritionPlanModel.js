const mongoose = require("mongoose");

const nutritionPlanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    date: { type: Date, required: true },

    dailyGoal: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      calories: { type: Number, default: 0 },
    },
    eatenSoFar: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      calories: { type: Number, default: 0 },
    },
    remaining: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      calories: { type: Number, default: 0 },
    },

    notes: { type: String },

    meals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meal" }],

    history: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        details: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

nutritionPlanSchema.index({ memberId: 1, date: 1 });

module.exports = mongoose.model("NutritionPlan", nutritionPlanSchema);
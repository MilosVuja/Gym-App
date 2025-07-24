const mongoose = require("mongoose");

const dailyMealPlanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    date: { type: Date, required: true },

    meals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meal",
      },
    ],

    totalEatenMacros: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      calories: { type: Number, default: 0 },
    },

    remainingMacros: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      calories: { type: Number, default: 0 },
    },

    macroAssignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MacroAssignment",
    },
  },
  { timestamps: true }
);

dailyMealPlanSchema.index({ memberId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyMealPlan", dailyMealPlanSchema);

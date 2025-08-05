const mongoose = require("mongoose");

const MacroSchema = new mongoose.Schema({
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  kcal: { type: Number, default: 0 },
});

const AdjustmentSchema = new mongoose.Schema({
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
});

const PerDayMacroSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: {
    type: String,
    enum: ["recommended", "customized", "adjusted"],
    required: true,
  },
  adjustments: { type: AdjustmentSchema, default: {} },
  finalMacros: { type: MacroSchema, required: true },
});

const PeriodMacroSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: {
    type: String,
    enum: ["recommended", "customized", "adjusted"],
    required: true,
  },
  adjustments: { type: AdjustmentSchema, default: {} },
  finalMacros: { type: MacroSchema, required: true },
});

const NutritionPlanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    gender: { type: String, enum: ["male", "female"], required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    age: { type: Number, required: true },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very active"],
      required: true,
    },
    goal: {
      type: String,
      enum: ["lose", "maintain", "gain"],
      required: true,
    },

    recommendedMacros: { type: MacroSchema, default: {} },
    customInput: {
      proteinPerKg: { type: Number, default: 0 },
      fatPerKg: { type: Number, default: 0 },
    },
    customizedMacros: { type: MacroSchema, default: {} },

    mode: { type: String, enum: ["perDay", "period"], required: true },
    perDayMacros: [PerDayMacroSchema],
    periodMacro: { type: PeriodMacroSchema },

    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("NutritionPlan", NutritionPlanSchema);

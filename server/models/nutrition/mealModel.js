const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    date: { type: String, required: true },
    name: { type: String, required: true },
    time: { type: String },
    order: { type: Number, default: 0 },
    foods: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        unit: { type: String, default: "g" },
        calories: { type: Number, default: 0, min: 0 },
        protein: { type: Number, default: 0, min: 0 },
        carbs: { type: Number, default: 0, min: 0 },
        fat: { type: Number, default: 0, min: 0 },
      },
    ],
    notes: { type: String },
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
  },
  { timestamps: true }
);

mealSchema.index({ memberId: 1, date: 1, order: 1 });

module.exports = mongoose.model("Meal", mealSchema);

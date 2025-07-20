const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
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
        protein: { type: Number, default: 0, min: 0 },
        carbs: { type: Number, default: 0, min: 0 },
        fat: { type: Number, default: 0, min: 0 },
        calories: { type: Number, default: 0, min: 0 },
      },
    ],
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    totalCalories: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);
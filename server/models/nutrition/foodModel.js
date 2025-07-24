const mongoose = require("mongoose");

const allowedTags = [
  "protein source",
  "carbohydrate source",
  "fat source",
  "low carb",
  "low fat",
  "low calorie",
  "high protein",
  "high fiber",
  "gluten-free",
  "dairy-free",
  "vegan",
  "vegetarian",
  "keto-friendly",
  "paleo",
  "whole30",
  "fruit",
  "vegetable",
  "legume",
  "grain",
  "nut",
  "seed",
  "meat",
  "poultry",
  "fish",
  "seafood",
  "egg",
  "dairy",
  "oil",
  "sauce",
  "herb/spice",
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "pre-workout",
  "post-workout",
  "beverage",
  "dessert",
  "condiment",
];

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantityUnit: { type: String, required: true },
  perQuantity: { type: Number, default: 100 },
  macros: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
  },
  tags: [
    {
      type: String,
      enum: allowedTags,
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
  },
});

foodSchema.index({ createdBy: 1 });

module.exports = mongoose.model("Food", foodSchema);

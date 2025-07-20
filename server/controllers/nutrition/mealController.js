const catchAsync = require("../../utilities/catchAsync");
const Meal = require("../../models/nutrition/mealModel");

exports.getAllMeals = catchAsync(async (req, res) => {
  const meals = await Meal.find();
  res
    .status(200)
    .json({ status: "success", results: meals.length, data: meals });
});

exports.getMealById = catchAsync(async (req, res) => {
  const meal = await Meal.findById(req.params.id);
  if (!meal) {
    return res.status(404).json({ status: "fail", message: "Meal not found" });
  }
  res.status(200).json({ status: "success", data: meal });
});

exports.createMeal = catchAsync(async (req, res) => {
  const newMeal = await Meal.create(req.body);
  res.status(201).json({ status: "success", data: newMeal });
});

exports.updateMeal = catchAsync(async (req, res) => {
  const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedMeal) {
    return res.status(404).json({ status: "fail", message: "Meal not found" });
  }
  res.status(200).json({ status: "success", data: updatedMeal });
});

exports.deleteMeal = catchAsync(async (req, res) => {
  const deleted = await Meal.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ status: "fail", message: "Meal not found" });
  }
  res.status(204).json({ status: "success", data: null });
});

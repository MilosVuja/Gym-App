const express = require("express");
const authController = require("../../controllers/authController");
const mealController = require("../../controllers/nutrition/mealController.js");

const router = express.Router();

// /meals
router.get("/", authController.protect, mealController.getAllMeals);
router.get("/:id", authController.protect, mealController.getMealById);
router.post("/save", authController.protect, mealController.createMeal);
router.patch("/:id", authController.protect, mealController.updateMeal);
router.delete("/:id", authController.protect, mealController.deleteMeal);

module.exports = router;
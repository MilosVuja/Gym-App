const express = require("express");
const authController = require("../../controllers/authController");
const nutritionPlanController = require("../../controllers/nutrition/nutritionPlanController");

const router = express.Router();

// /nutrition-plans
router.get(
  "/all",
  authController.protect,
  nutritionPlanController.getAllNutritionPlans
);

router.get(
  "/:id",
  authController.protect,
  nutritionPlanController.getNutritionPlanById
);

router.get(
  "/macros/:memberId/:date",
  authController.protect,
  nutritionPlanController.getMacrosByDate
);

router.post(
  "/save",
  authController.protect,
  nutritionPlanController.createOrUpdateNutritionPlan
);

router.patch(
  "/:id",
  authController.protect,
  nutritionPlanController.updateNutritionPlan
);

router.delete(
  "/:id",
  authController.protect,
  nutritionPlanController.deleteNutritionPlan
);

module.exports = router;

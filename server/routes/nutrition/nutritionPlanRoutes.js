const express = require("express");
const authController = require("../../controllers/authController");
const nutritionPlanController = require("../../controllers/nutrition/nutritionPlanController");

const router = express.Router();

router.use(authController.protect);

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
  "/plan/:memberId/:date",
  authController.protect,
  nutritionPlanController.getNutritionPlanByDate
);
router.post(
  "/save",
  authController.protect,
  nutritionPlanController.createNutritionPlan
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

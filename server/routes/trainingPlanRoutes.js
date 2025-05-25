const express = require("express");
const trainingPlanController = require("../controllers/trainingPlanController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

//training-plans
// router.get("/api/v1/admin/training-plans", trainingPlanController.getAllActiveTrainingPlans);

router.get("/active",authController.protect, trainingPlanController.getActiveMemberPlan);

router.post(
  "/add",
  authController.protect,
  trainingPlanController.saveTraining,
);

module.exports = router;
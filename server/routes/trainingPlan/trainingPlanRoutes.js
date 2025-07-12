const express = require("express");
const trainingPlanController = require("../../controllers/trainingPlan/trainingPlanController");
const authController = require("../../controllers/authController");

const router = express.Router();

router.use(authController.protect);

//training-plans
router.get("/all-active", trainingPlanController.getAllActiveTrainingPlans);

router.get("/active", trainingPlanController.getActiveTrainingPlan);

router.post("/add", trainingPlanController.saveTraining);

router.get("/member/history", trainingPlanController.getTrainingHistory);

module.exports = router;

const express = require("express");
const exerciseSessionController = require("../../controllers/trainingPlan/exerciseSessionController");
const authController = require("../../controllers/authController");

const router = express.Router();

router.use(authController.protect);


router.post("/:planId/days/:dayId/exercises", exerciseSessionController.addExercise);

module.exports = router;

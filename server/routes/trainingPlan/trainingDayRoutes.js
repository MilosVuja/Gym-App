const express = require("express");
const trainingDayController = require("../../controllers/trainingPlan/trainingDayController");
const authController = require("../../controllers/authController");

const router = express.Router();

router.use(authController.protect);


router.delete("/:planId/days/:dayId", trainingDayController.deleteTrainingDay);

module.exports = router;

const express = require("express");
const router = express.Router();

const trainingPlanRoutes = require("./trainingPlanRoutes");
const trainingDayRoutes = require("./trainingDayRoutes");
const exerciseSessionRoutes = require("./exerciseSessionRoutes");
const completedSessionRoutes = require("./completedSessionRoutes");

router.use("/", trainingPlanRoutes);
router.use("/", trainingDayRoutes);
router.use("/", exerciseSessionRoutes);
router.use("/", completedSessionRoutes);

module.exports = router;

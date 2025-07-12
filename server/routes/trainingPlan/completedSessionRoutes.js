const express = require("express");
const completedSessionController = require("../../controllers/trainingPlan/completedSessionController");
const authController = require("../../controllers/authController");

const router = express.Router();

router.use(authController.protect);


router.post("/completed", completedSessionController.addCompletedSession);

router.get("/completed/member", completedSessionController.getCompletedSessions);

module.exports = router;

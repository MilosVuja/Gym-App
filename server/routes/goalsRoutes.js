const express = require("express");
const goalsController = require("../controllers/goalsController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, goalsController.getGoals)
  .post(authController.protect, goalsController.addGoal);
router
  .route("/:id")
  .put(authController.protect, goalsController.updateGoal)
  .delete(authController.protect, goalsController.deleteGoal);

module.exports = router;

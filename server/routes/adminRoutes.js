const express = require("express");
const memberController = require("../controllers/memberController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect, authController.restrictTo("admin"));
router.get("/members/:id/training", memberController.getAdminMemberTraining);
router.patch(
  "/members/:id/assign-training-plan",
  memberController.assignTrainingPlan
);

module.exports = router;

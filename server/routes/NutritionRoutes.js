const express = require("express");
const authController = require("../controllers/authController");
const nutritionController = require("../controllers/nutritionController");

const router = express.Router();

// /nutrition
router.get("/active", authController.protect, nutritionController.getActivePlan);

module.exports = router;

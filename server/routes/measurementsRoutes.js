const express = require("express");
const measurementsController = require("../controllers/measurementsController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, measurementsController.getMeasurements);

router
  .route("/add")
  .post(authController.protect, measurementsController.addMeasurement);

router
  .route("/:type")
  .get(authController.protect, measurementsController.getMeasurementsByType);

module.exports = router;

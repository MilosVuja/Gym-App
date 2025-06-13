const express = require("express");
const exercisesController = require("../controllers/exercisesController");
const authController = require("../controllers/authController");

const router = express.Router();

//exercises
router.get("/",  exercisesController.getAllExercises);
router.get("/filter",  exercisesController.getFilteredExercises);

router.get("/:id",  exercisesController.getExercise);

router
  .route("/add")
  .post( exercisesController.addExercise);

module.exports = router;

//ovo sam izbrisao sa svake rute authController.protect,
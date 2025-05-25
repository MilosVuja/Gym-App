const express = require("express");
const musclesController = require("../controllers/musclesController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/").get(musclesController.getAllMuscles);

router.route("/add").post(authController.protect, musclesController.addMuscle);

router.get("/latin/:latinName", musclesController.getMuscleByLatinName);

module.exports = router;

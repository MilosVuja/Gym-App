const express = require("express");
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getMainPage);
router.get('/members/login', authController.isLoggedIn, viewController.getLoginPage);
router.get('/members/profile', authController.protect, viewController.getProfilePage);
router.get('/members/profile/your-training', authController.protect, viewController.getTrainingPage);
router.get('/members/groupClassBooking', viewController.getGroupClassPage);
router.get('/training-plans/add', viewController.getAddTrainingPlanPage);
router.get('/muscles/add', authController.protect, viewController.getAddMusclePage);
router.get('/exercises/add', authController.protect, viewController.getAddExercisePage);

module.exports = router;
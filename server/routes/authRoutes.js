const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// /api/v1/auth
router.post('/register', authController.signup);
router.post('/login', authController.login);
router.get('/me', authController.protect, authController.getMe);

module.exports = router;

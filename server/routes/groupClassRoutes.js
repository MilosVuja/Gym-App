const express = require('express');
const groupClassController = require('./../controllers/groupClassController')
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, groupClassController.getAllGroupClasses)
  .post(groupClassController.createGroupClass);

router
  .route('/:id')
  .get(groupClassController.getGroupClass)
  .patch(groupClassController.updateGroupClass)
  .delete(authController.protect, authController.restrictTo('admin'), groupClassController.deleteGroupClass);

module.exports = router;

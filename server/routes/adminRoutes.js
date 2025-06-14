const express = require("express");
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo("admin"));

//api/v1/admin/
router.patch("/approve/:memberId", adminController.approveMember);
router.get("/pending-members", adminController.getPendingMembers);
router.patch("/change-role/:memberId", adminController.changeMemberRole);
// router.delete("/delete/:memberId", adminController.deleteMember);

module.exports = router;

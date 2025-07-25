const express = require("express");
const memberController = require("../controllers/memberController");
const authController = require("../controllers/authController");

const router = express.Router();

// /members
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/me", authController.protect, memberController.getMe);

router.patch(
  "/update-me",
  authController.protect,
  memberController.uploadMemberPhoto,
  memberController.resizeMemberPhoto,
  memberController.updateMe
);
router.delete("/deleteMe", memberController.deleteMember);

router
  .route("/")
  .get(memberController.getAllMembers)
  .post(memberController.createMember);

router.get(
  "/profile/your-training",
  authController.protect,
  memberController.getTrainingProfile
);

router.get(
  "/personal-info",
  authController.protect,
  memberController.getPersonalInfo
);

module.exports = router;

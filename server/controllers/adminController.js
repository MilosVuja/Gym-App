const Member = require("../models/membersModel");
const { sendEmail } = require("../utilities/email");
const catchAsync = require("../utilities/catchAsync");
const AppError = require("../utilities/appError");

exports.approveMember = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;

  const member = await Member.findById(memberId);
  if (!member) return next(new AppError("Member not found", 404));

  if (member.status === "active") {
    return res.status(400).send("Member is already approved.");
  }

  member.status = "active";

  if (req.query.role && ["member", "trainer", "staff"].includes(req.query.role)) {
    member.role = req.query.role;
  }

  await member.save();

  await sendEmail({
    to: member.email,
    subject: "Your Gym Account Has Been Approved!",
    html: `<p>Hi ${member.firstName},</p>
           <p>🎉 Your account has been approved. You can now log in and access all features.</p>
           <p>See you at the gym!</p>`,
  });

  res.status(200).send("Member approved and notified via email.");
});

exports.getPendingMembers = catchAsync(async (req, res) => {
  const members = await Member.find({ status: "pending" });

  res.status(200).json({
    status: "Success",
    results: members.length,
    data: {
      members,
    },
  });
});

exports.changeMemberRole = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;
  const newRole = req.body.role;

  if (!["member", "trainer", "staff"].includes(newRole)) {
    return next(new AppError("Invalid role specified", 400));
  }

  const member = await Member.findById(memberId);
  if (!member) return next(new AppError("Member not found", 404));

  const oldRole = member.role;
  member.role = newRole;

  member.roleHistory.push({
    changedBy: req.member.id,
    oldRole,
    newRole,
    changedAt: Date.now(),
  });

  await member.save();

  res.status(200).json({
    status: "success",
    data: {
      member,
    },
  });
});


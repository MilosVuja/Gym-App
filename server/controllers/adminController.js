const Member = require("../models/membersModel");
const sendEmail = require("../utilities/email");
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

  if (
    req.query.role &&
    ["member", "trainer", "staff"].includes(req.query.role)
  ) {
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

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Member Approved</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .container {
          background-color: white;
          padding: 2rem 3rem;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          max-width: 400px;
          text-align: center;
        }
        h1 {
          color: #27ae60;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 1.5rem;
        }
        a {
          display: inline-block;
          padding: 0.5rem 1rem;
          background-color: #e74c3c;
          color: white;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          background-color: #c0392b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Member Approved!</h1>
        <p>Member <strong>${member.firstName} ${member.lastName}</strong> has been successfully approved.</p>
        <a href="${process.env.APP_URL}/admin/dashboard">Back to Admin Dashboard</a>
      </div>
    </body>
    </html>
  `;

  res.status(200).send(html);
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

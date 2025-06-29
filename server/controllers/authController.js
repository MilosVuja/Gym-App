require("dotenv").config();
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const Member = require("./../models/membersModel");
const catchAsync = require("./../utilities/catchAsync");
const AppError = require("./../utilities/appError");
const sendEmail = require("./../utilities/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

const createSendToken = (member, statusCode, res) => {
  const token = jwt.sign({ id: member._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  member.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      member,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newMember = await Member.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  await sendEmail({
    to: newMember.email,
    subject: "Welcome to Our Gym!",
    html: `<p>Hi ${newMember.firstName},</p>
           <p>Thank you for registering at our gym. Your account is currently pending approval.</p>
           <p>You’ll receive a confirmation email once approved.</p>
           <p>Best regards,</p>
           <p>Your Gym Team</p>`,
  });

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "New Member Registration",
    html: `<p>New member registered:</p>
           <ul>
             <li><strong>Name:</strong> ${newMember.firstName} ${newMember.lastName}</li>
             <li><strong>Email:</strong> ${newMember.email}</li>
             <li><strong>Phone:</strong> ${newMember.phoneNumber}</li>
           </ul>
           <p><a href="http://localhost:3000/api/v1/admin/approve/${newMember._id}">Approve this member</a></p>`,
  });

  createSendToken(newMember, 201, res);
});

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide email and password!", 400));
    }

    const member = await Member.findOne({ email }).select("+password");

    if (!member || !(await member.correctPassword(password))) {
      return next(new AppError("Incorrect email or password!", 401));
    }

    if (member.status !== "active") {
      return next(
        new AppError("Your account is not active. Awaiting approval.", 403)
      );
    }
    return createSendToken(member, 200, res);

  } catch (err) {
    next(err);
  }
};

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "Success!",
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentMember = await Member.findById(decoded.id);
  if (!currentMember) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  req.member = currentMember;
  res.locals.member = currentMember;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentMember = await Member.findById(decoded.id);
      if (!currentMember) {
        return next();
      }

      res.locals.member = currentMember;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.member.role)) {
      return next(
        new AppError("You dont have premission to perform this action", 403)
      );
    }
    next();
  };
};

exports.getMe = (req, res) => {
  const safeMember = {
    _id: req.member._id,
    firstName: req.member.firstName,
    lastName: req.member.lastName,
    email: req.member.email,
    role: req.member.role,
    gymId: req.member.gymId,
    status: req.member.status,
  };

  res.status(200).json({
    status: "success",
    data: {
      member: safeMember,
    },
  });
};
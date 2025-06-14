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
  const token = signToken(member._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  const safeMember = {
    _id: member._id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    role: member.role,
    gymId: member.gymId,
    status: member.status,
  };

  res.status(statusCode).json({
    status: "Success!",
    token,
    data: {
      member: safeMember,
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
           <p><a href="${process.env.APP_URL}/admin/approve/${newMember._id}">Approve this member</a></p>`,
  });

  createSendToken(newMember, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
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

  createSendToken(member, 200, res);

  res.status(200).json({
    status: "Success!",
    token,
    data: {
      member,
    },
  });
});

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

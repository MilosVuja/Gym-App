const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const Member = require("./../models/membersModel");
const catchAsync = require("./../utilities/catchAsync");
const AppError = require("./../utilities/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (member, statusCode, res) => {
  const token = signToken(member._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  member.pinCode = undefined;

  res.status(statusCode).json({
    status: "Success!",
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
    role: req.body.role,
    phoneNumber: req.body.phoneNumber,
  });

  createSendToken(newMember, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, pinCode } = req.body;

  if (!email || !pinCode) {
    return next(new AppError("Please provide email and pin code!", 400));
  }

  const member = await Member.findOne({ email }).select("+pinCode");

  if (!member || !(await member.correctPinCode(pinCode, member.pinCode))) {
    return next(new AppError("Incorrect email or pin code!", 401));
  }

  const token = jwt.sign({ id: member._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);

  member.pinCode = undefined;

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

const Member = require("./../models/membersModel");
const catchAsync = require("../utilities/catchAsync");
const AppError = require("../utilities/appError");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const util = require("util");
const TrainingPlan = require("../models/trainingPlanModel");

const unlink = util.promisify(fs.unlink);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.getAllMembers = catchAsync(async (req, res) => {
  const members = await Member.find();

  res.status(200).json({
    status: "Success",
    results: members.length,
    data: {
      members,
    },
  });
});

exports.getMember = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This route isnt yet defined",
  });
};

exports.createMember = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This route isnt yet defined",
  });
};

exports.updateMember = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email",
    "photo",
    "phoneNumber",
    "address",
    "sex",
    "goal",
    "program",
    "height",
    "weight",
    "bodyFat",
    "bmi",
    "waist",
    "arm",
    "thigh",
    "experience",
    "squat",
    "bench",
    "deadlift"
  );
  const updatedMember = await Member.findByIdAndUpdate(
    req.member.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "Success!",
    data: {
      member: updatedMember,
    },
  });
});

exports.deleteMember = catchAsync(async (req, res, next) => {
  await Member.findByIdAndUpdate(req.member.id, { active: false });

  res.status(204).json({
    status: "Success!",
  });
});

exports.uploadMemberPhoto = upload.single("photo");

exports.resizeMemberPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const uploadDir = "public/images/members";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const currentMember = await Member.findById(req.member.id);
  const oldPhotoPath = currentMember.photo;

  req.file.filename = `member-${req.member.id}-${Date.now()}.jpeg`;
  const filePath = path.join(uploadDir, req.file.filename);

  try {
    await sharp(req.file.buffer)
      .rotate()
      .resize(500, 500, {
        fit: "cover",
        position: "center",
      })
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(filePath);

    if (oldPhotoPath && !oldPhotoPath.includes("default")) {
      const oldFilePath = path.join("public", oldPhotoPath);
      try {
        await unlink(oldFilePath);
      } catch (err) {
        console.log("Error deleting old photo:", err);
      }
    }
  } catch (error) {
    return next(new AppError("Error uploading image. Please try again.", 500));
  }

  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "address",
    "sex",
    "goal",
    "program",
    "height",
    "weight",
    "bodyFat",
    "bmi",
    "waist",
    "arm",
    "thigh",
    "experience",
    "squat",
    "bench",
    "deadlift",
    "photo"
  );

  if (req.file) {
    filteredBody.photo = `images/members/${req.file.filename}`;
  }

  const updatedMember = await Member.findByIdAndUpdate(
    req.member.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "Success!",
    data: {
      member: updatedMember,
    },
  });
});

exports.getAdminMemberTraining = catchAsync(async (req, res, next) => {
  const member = await Member.findById(req.params.id)
    .populate({
      path: "activeTrainingPlan",
      select: "name description difficulty duration trainingDays",
    })
    .populate({
      path: "trainingHistory.plan",
      select: "name description difficulty duration",
    });

  if (!member) {
    return next(new AppError("No member found with that ID", 404));
  }

  const trainingProfile = {
    memberInfo: {
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      experience: member.experience,
      goal: member.goal,
      currentMeasurements: member.currentMeasurements,
      currentStrengthStats: member.currentStrengthStats,
      membershipStatus: member.membership.status,
    },
    activeTraining: member.activeTrainingPlan,
    trainingHistory: member.trainingHistory,
    measurementsProgress: member.measurementsHistory,
    strengthProgress: member.strengthStatsHistory,
    medicalInfo: {
      conditions: member.medicalConditions,
      injuries: member.injuries,
    },
  };

  res.status(200).json({
    status: "success",
    data: {
      trainingProfile,
    },
  });
});

exports.assignTrainingPlan = catchAsync(async (req, res, next) => {
  const { trainingPlanId } = req.body;

  const member = await Member.findById(req.params.id);
  if (!member) {
    return next(new AppError("No member found with that ID", 404));
  }

  const trainingPlan = await TrainingPlan.findById(trainingPlanId);
  if (!trainingPlan) {
    return next(new AppError("No training plan found with that ID", 404));
  }

  if (member.activeTrainingPlan) {
    member.trainingHistory.push({
      plan: member.activeTrainingPlan,
      startDate: new Date(),
      endDate: new Date(),
      completed: false,
    });
  }

  member.activeTrainingPlan = trainingPlanId;
  await member.save();

  res.status(200).json({
    status: "success",
    data: {
      member,
    },
  });
});

exports.getTrainingProfile = catchAsync(async (req, res, next) => {
  const member = await Member.findById(req.member.id)
    .populate("activeTrainingPlan");

  if (!member || !member.activeTrainingPlan) {
    return next(new AppError("No member found with that ID or there is no active training for this member!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      activeTrainingPlan: member.activeTrainingPlan,
    },
  });
});

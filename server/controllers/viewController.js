const catchAsync = require("../utilities/catchAsync");
const Muscles = require("../models/musclesModel");
const Exercises = require("../models/exercisesModel");

exports.getMainPage = (req, res) => {
  res.status(200).render("main", {
    title: "Heavy Bar Gym",
    member: res.locals.member,
  });
};

exports.getLoginPage = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

exports.getProfilePage = catchAsync(async (req, res, next) => {
  if (!req.member) {
    return res.redirect("/login");
  }

  res.status(200).render("profile", {
    title: "Your Profile",
    member: req.member,
  });
});

exports.getTrainingPage = (req, res) => {
  res.status(200).render("training", {
    title: "Your training plan",
  });
};

exports.getGroupClassPage = (req, res) => {
  res.status(200).render("groupClassBooking");
};

exports.getAddTrainingPlanPage = (req, res) => {
  res.status(200).render("addTrainingPlan", {
    title: "Add Training Plan",
    exercises: res.locals.exercises,
  });
};

exports.getAddMusclePage = (req, res) => {
  res.status(200).render("addMuscles", {
    title: "Add Muscle",
  });
};

exports.getAddExercisePage = catchAsync(async (req, res) => {
  const muscles = await Muscles.find();
  res.status(200).render("addExercises", {
    title: "Add Exercise",
    muscles: muscles,
  });
});

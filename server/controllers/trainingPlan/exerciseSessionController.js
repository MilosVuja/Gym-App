const mongoose = require("mongoose");
const catchAsync = require("../utilities/catchAsync");
const TrainingPlan = require("../models/trainingPlan/TrainingPlan");


exports.getExerciseSessions = catchAsync(async (req, res) => {
  const { planId, dayId } = req.params;

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({ status: "fail", message: "Training plan not found" });
  }

  const trainingDay = plan.trainingDays.id(dayId);
  if (!trainingDay) {
    return res.status(404).json({ status: "fail", message: "Training day not found" });
  }

  res.status(200).json({
    status: "success",
    data: {
      exercises: trainingDay.exercises,
    },
  });
});

exports.addExerciseSession = catchAsync(async (req, res) => {
  const { planId, dayId } = req.params;
  const { exerciseId, instructions, sets } = req.body;

  if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
    return res.status(400).json({ status: "fail", message: "Invalid exercise ID" });
  }

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({ status: "fail", message: "Training plan not found" });
  }

  const trainingDay = plan.trainingDays.id(dayId);
  if (!trainingDay) {
    return res.status(404).json({ status: "fail", message: "Training day not found" });
  }

  trainingDay.exercises.push({
    exercise: exerciseId,
    instructions: instructions || "",
    sets: sets || [],
  });

  await plan.save();

  res.status(201).json({
    status: "success",
    data: { exercises: trainingDay.exercises },
  });
});

exports.updateExerciseSession = catchAsync(async (req, res) => {
  const { planId, dayId, sessionId } = req.params;
  const { instructions, sets } = req.body;

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({ status: "fail", message: "Training plan not found" });
  }

  const trainingDay = plan.trainingDays.id(dayId);
  if (!trainingDay) {
    return res.status(404).json({ status: "fail", message: "Training day not found" });
  }

  const exerciseSession = trainingDay.exercises.id(sessionId);
  if (!exerciseSession) {
    return res.status(404).json({ status: "fail", message: "Exercise session not found" });
  }

  if (instructions !== undefined) exerciseSession.instructions = instructions;
  if (sets !== undefined) exerciseSession.sets = sets;

  await plan.save();

  res.status(200).json({
    status: "success",
    data: { exerciseSession },
  });
});

exports.deleteExerciseSession = catchAsync(async (req, res) => {
  const { planId, dayId, sessionId } = req.params;

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({ status: "fail", message: "Training plan not found" });
  }

  const trainingDay = plan.trainingDays.id(dayId);
  if (!trainingDay) {
    return res.status(404).json({ status: "fail", message: "Training day not found" });
  }

  const exerciseSession = trainingDay.exercises.id(sessionId);
  if (!exerciseSession) {
    return res.status(404).json({ status: "fail", message: "Exercise session not found" });
  }

  exerciseSession.remove();
  await plan.save();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
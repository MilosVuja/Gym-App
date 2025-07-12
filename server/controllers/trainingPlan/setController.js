const catchAsync = require("../utilities/catchAsync");
const TrainingPlan = require("../models/trainingPlan/TrainingPlan");

exports.addSet = catchAsync(async (req, res) => {
  const { planId, dayId, sessionId } = req.params;
  const { reps, weight, rest, duration, notes } = req.body;

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

  const newSet = {
    reps,
    weight,
    rest,
    duration,
    notes,
  };

  exerciseSession.sets.push(newSet);
  await plan.save();

  res.status(201).json({
    status: "success",
    data: { sets: exerciseSession.sets },
  });
});

exports.updateSet = catchAsync(async (req, res) => {
  const { planId, dayId, sessionId, setId } = req.params;
  const { reps, weight, rest, duration, notes } = req.body;

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

  const set = exerciseSession.sets.id(setId);
  if (!set) {
    return res.status(404).json({ status: "fail", message: "Set not found" });
  }

  if (reps !== undefined) set.reps = reps;
  if (weight !== undefined) set.weight = weight;
  if (rest !== undefined) set.rest = rest;
  if (duration !== undefined) set.duration = duration;
  if (notes !== undefined) set.notes = notes;

  await plan.save();

  res.status(200).json({
    status: "success",
    data: { set },
  });
});

exports.deleteSet = catchAsync(async (req, res) => {
  const { planId, dayId, sessionId, setId } = req.params;

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

  const set = exerciseSession.sets.id(setId);
  if (!set) {
    return res.status(404).json({ status: "fail", message: "Set not found" });
  }

  set.remove();
  await plan.save();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
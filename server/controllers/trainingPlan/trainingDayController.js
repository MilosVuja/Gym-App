const TrainingPlan = require("../../models/trainingPlan/TrainingPlan");
const catchAsync = require("../../utilities/catchAsync");


exports.getTrainingDays = catchAsync(async (req, res) => {
  const { planId } = req.params;

  const plan = await TrainingPlan.findById(planId).select("trainingDays");
  if (!plan) {
    return res.status(404).json({
      status: "fail",
      message: "Training plan not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: plan.trainingDays,
  });
});

exports.getTrainingDayById = catchAsync(async (req, res) => {
  const { planId, dayId } = req.params;

  const plan = await TrainingPlan.findById(planId).select("trainingDays");
  if (!plan) {
    return res.status(404).json({
      status: "fail",
      message: "Training plan not found",
    });
  }

  const day = plan.trainingDays.id(dayId);
  if (!day) {
    return res.status(404).json({
      status: "fail",
      message: "Training day not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: day,
  });
});

exports.addTrainingDay = catchAsync(async (req, res) => {
  const { planId } = req.params;
  const { day, trainingType, exercises } = req.body;

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({
      status: "fail",
      message: "Training plan not found",
    });
  }

  plan.trainingDays.push({
    day,
    trainingType,
    exercises: exercises || [],
  });

  await plan.save();

  res.status(201).json({
    status: "success",
    message: "Training day added",
    data: plan.trainingDays[plan.trainingDays.length - 1],
  });
});

exports.updateTrainingDay = catchAsync(async (req, res) => {
  const { planId, dayId } = req.params;
  const { day, trainingType, exercises } = req.body;

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({
      status: "fail",
      message: "Training plan not found",
    });
  }

  const trainingDay = plan.trainingDays.id(dayId);
  if (!trainingDay) {
    return res.status(404).json({
      status: "fail",
      message: "Training day not found",
    });
  }

  if (day) trainingDay.day = day;
  if (trainingType) trainingDay.trainingType = trainingType;
  if (exercises) trainingDay.exercises = exercises;

  await plan.save();

  res.status(200).json({
    status: "success",
    message: "Training day updated",
    data: trainingDay,
  });
});

exports.deleteTrainingDay = catchAsync(async (req, res) => {
  const { planId, dayId } = req.params;

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({
      status: "fail",
      message: "Training plan not found",
    });
  }

  const day = plan.trainingDays.id(dayId);
  if (!day) {
    return res.status(404).json({
      status: "fail",
      message: "Training day not found",
    });
  }

  day.remove();
  await plan.save();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

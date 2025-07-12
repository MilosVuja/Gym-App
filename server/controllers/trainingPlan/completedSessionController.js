const TrainingPlan = require("../../models/trainingPlan/TrainingPlanModel");

const catchAsync = require("../utilities/catchAsync");

exports.getCompletedSessions = catchAsync(async (req, res) => {
  const { planId } = req.params;

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res
      .status(404)
      .json({ status: "fail", message: "Training plan not found" });
  }

  res.status(200).json({
    status: "success",
    data: {
      completedSessions: plan.completedSessions,
    },
  });
});

exports.addCompletedSession = catchAsync(async (req, res) => {
  const { planId } = req.params;
  const { date, exercises } = req.body;

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res
      .status(404)
      .json({ status: "fail", message: "Training plan not found" });
  }

  plan.completedSessions.push({
    date: date || new Date(),
    exercises: exercises || [],
  });

  await plan.save();

  res.status(201).json({
    status: "success",
    data: {
      completedSessions: plan.completedSessions,
    },
  });
});

exports.updateCompletedSession = catchAsync(async (req, res) => {
  const { planId, sessionId } = req.params;
  const { date, exercises } = req.body;

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res
      .status(404)
      .json({ status: "fail", message: "Training plan not found" });
  }

  const session = plan.completedSessions.id(sessionId);
  if (!session) {
    return res
      .status(404)
      .json({ status: "fail", message: "Completed session not found" });
  }

  if (date !== undefined) session.date = date;
  if (exercises !== undefined) session.exercises = exercises;

  await plan.save();

  res.status(200).json({
    status: "success",
    data: { session },
  });
});

exports.deleteCompletedSession = catchAsync(async (req, res) => {
  const { planId, sessionId } = req.params;

  const plan = await TrainingPlan.findById(planId);
  if (!plan) {
    return res
      .status(404)
      .json({ status: "fail", message: "Training plan not found" });
  }

  const session = plan.completedSessions.id(sessionId);
  if (!session) {
    return res
      .status(404)
      .json({ status: "fail", message: "Completed session not found" });
  }

  session.remove();
  await plan.save();

  res.status(204).json({ status: "success", data: null });
});

const Goal = require("../models/GoalsModel");
const catchAsync = require("../utilities/catchAsync");

exports.getGoals = catchAsync(async (req, res) => {
  const goals = await Goal.find({ member: req.member.id });
  res.json(goals);
});

exports.addGoal = catchAsync(async (req, res) => {
  const { title, type, deadline } = req.body;

  const goal = await Goal.create({
    member: req.member.id,
    title,
    type,
    deadline,
    progress: 0,
  });

  res.status(201).json(goal);
});

exports.updateGoal = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, type, deadline, progress } = req.body;

  const goal = await Goal.findOneAndUpdate(
    { _id: id, member: req.member.id },
    { title, type, deadline, progress },
    { new: true }
  );

  if (!goal) {
    return res.status(404).json({ error: "Goal not found" });
  }

  res.json(goal);
});

exports.deleteGoal = catchAsync(async (req, res) => {
  const goal = await Goal.findOneAndDelete({
    _id: req.params.id,
    member: req.member.id,
  });

  if (!goal) {
    return res.status(404).json({ error: "Goal not found" });
  }

  res.json({ message: "Goal deleted" });
});

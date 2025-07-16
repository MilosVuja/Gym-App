const Goal = require("../models/GoalsModel");
const catchAsync = require("../utilities/catchAsync");

exports.getGoals = catchAsync(async (req, res) => {
  const goals = await Goal.find({ member: req.member.id });
  res.status(200).json({ success: true, data: goals });
});

exports.addGoal = catchAsync(async (req, res) => {
  const { name, type, deadline, goalValue, currentValue, note } = req.body;

  if (!name || !type || !deadline || goalValue === undefined) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, type, deadline, goalValue",
    });
  }

  const goal = await Goal.create({
    member: req.member.id,
    name,
    type,
    deadline,
    goalValue,
    currentValue: currentValue ?? null,
    note: note ?? "",
    progress: 0,
  });

  res.status(201).json({ success: true, data: goal });
});

exports.updateGoal = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, type, deadline, progress, goalValue, currentValue, note } =
    req.body;

  const updateFields = {
    name,
    type,
    deadline,
    progress,
    goalValue,
    currentValue,
    note,
  };

  Object.keys(updateFields).forEach(
    (key) => updateFields[key] === undefined && delete updateFields[key]
  );

  const goal = await Goal.findOneAndUpdate(
    { _id: id, member: req.member.id },
    updateFields,
    { new: true, runValidators: true }
  );

  if (!goal) {
    return res.status(404).json({ success: false, message: "Goal not found" });
  }

  res.status(200).json({ success: true, data: goal });
});

exports.deleteGoal = catchAsync(async (req, res) => {
  const goal = await Goal.findOneAndDelete({
    _id: req.params.id,
    member: req.member.id,
  });

  if (!goal) {
    return res.status(404).json({ success: false, message: "Goal not found" });
  }

  res.status(200).json({ success: true, message: "Goal deleted" });
});

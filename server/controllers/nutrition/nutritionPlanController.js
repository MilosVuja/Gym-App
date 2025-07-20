const catchAsync = require("../../utilities/catchAsync");
const NutritionPlan = require("../../models/nutrition/nutritionPlanModel");

const getDayRange = (dateString) => {
  const dayStart = new Date(dateString);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateString);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
};

exports.getAllNutritionPlans = catchAsync(async (req, res) => {
  const { memberId } = req.query;
  if (!memberId)
    return res
      .status(400)
      .json({ status: "fail", message: "memberId required" });

  const plans = await NutritionPlan.find({ memberId })
    .populate("meals")
    .sort({ date: -1 });
  res
    .status(200)
    .json({ status: "success", results: plans.length, data: plans });
});

exports.getNutritionPlanById = catchAsync(async (req, res) => {
  const plan = await NutritionPlan.findById(req.params.id).populate("meals");
  if (!plan)
    return res.status(404).json({ status: "fail", message: "Plan not found" });
  res.status(200).json({ status: "success", data: plan });
});

exports.getNutritionPlanByDate = catchAsync(async (req, res) => {
  const { memberId, date } = req.params;
  if (!memberId || !date)
    return res
      .status(400)
      .json({ status: "fail", message: "memberId and date required" });

  const { dayStart, dayEnd } = getDayRange(date);

  const plan = await NutritionPlan.findOne({
    memberId,
    date: { $gte: dayStart, $lte: dayEnd },
  }).populate("meals");

  if (!plan) {
    return res
      .status(404)
      .json({ status: "fail", message: "Plan not found for this date" });
  }

  res.status(200).json({ status: "success", data: plan });
});

exports.createNutritionPlan = catchAsync(async (req, res) => {
  const { memberId, date } = req.body;
  if (!memberId || !date)
    return res
      .status(400)
      .json({ status: "fail", message: "memberId and date required" });

  const { dayStart, dayEnd } = getDayRange(date);

  let plan = await NutritionPlan.findOne({
    memberId,
    date: { $gte: dayStart, $lte: dayEnd },
  });

  if (plan) {
    plan.set(req.body);
    await plan.save();
    plan = await plan.populate("meals").execPopulate();
    return res.status(200).json({ status: "success", data: plan });
  } else {
    plan = await NutritionPlan.create(req.body);
    plan = await plan.populate("meals").execPopulate();
    return res.status(201).json({ status: "success", data: plan });
  }
});

exports.updateNutritionPlan = catchAsync(async (req, res) => {
  const plan = await NutritionPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("meals");

  if (!plan)
    return res.status(404).json({ status: "fail", message: "Plan not found" });

  res.status(200).json({ status: "success", data: plan });
});

exports.deleteNutritionPlan = catchAsync(async (req, res) => {
  const plan = await NutritionPlan.findByIdAndDelete(req.params.id);
  if (!plan)
    return res.status(404).json({ status: "fail", message: "Plan not found" });
  res.status(204).json({ status: "success", data: null });
});

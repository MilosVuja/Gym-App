const catchAsync = require("../../utilities/catchAsync");
const NutritionPlan = require("../../models/nutrition/nutritionPlanModel");
const NutritionHistory = require("../../models/nutrition/nutritionHistoryModel");

const getDayRange = (dateString) => {
  const dayStart = new Date(dateString);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateString);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
};

const archivePlan = async (plan) => {
  await NutritionHistory.create({
    memberId: plan.memberId,
    nutritionPlan: plan.toObject(),
  });
  await plan.deleteOne();
};

const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  let current = new Date(startDate);
  while (current <= new Date(endDate)) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

exports.getAllNutritionPlans = catchAsync(async (req, res) => {
  const { memberId } = req.query;
  if (!memberId)
    return res
      .status(400)
      .json({ status: "fail", message: "memberId required" });

  const activePlans = await NutritionPlan.find({ memberId }).sort({ date: -1 });
  res.status(200).json({
    status: "success",
    results: activePlans.length,
    data: activePlans,
  });
});

exports.getNutritionPlanById = catchAsync(async (req, res) => {
  const plan = await NutritionPlan.findById(req.params.id);
  if (!plan)
    return res.status(404).json({ status: "fail", message: "Plan not found" });

  res.status(200).json({ status: "success", data: plan });
});

exports.getMacrosByDate = catchAsync(async (req, res, next) => {
  const memberId = req.member.id;
  const { date } = req.query;

  if (!date) {
    return res
      .status(400)
      .json({ status: "error", message: "Date is required" });
  }

  const plan = await NutritionPlan.findOne({ memberId });

  if (!plan) {
    return res.status(404).json({ status: "error", message: "Plan not found" });
  }

  const macrosForDate = plan.perDayMacros.find(
    (d) => new Date(d.date).toDateString() === new Date(date).toDateString()
  );

  if (!macrosForDate) {
    return res
      .status(404)
      .json({ status: "error", message: "Macros for this date not found" });
  }

  res.status(200).json({ status: "success", data: macrosForDate.finalMacros });
});

exports.createNutritionPlan = catchAsync(async (req, res) => {
  const memberId = req.member._id;
  const {
    date,
    mode,
    recommendedMacros,
    customizedMacros,
    customInput,
    perDayMacros,
    periodMacro,
    gender,
    height,
    weight,
    age,
    activityLevel,
    goal,
  } = req.body;

  if (!memberId || !date || !mode) {
    return res.status(400).json({
      status: "fail",
      message: "memberId, date, and mode are required",
    });
  }

  const { dayStart, dayEnd } = getDayRange(date);

  let newPerDayMacros = perDayMacros || [];
  if (mode === "period") {
    if (!periodMacro || !periodMacro.startDate || !periodMacro.endDate) {
      return res.status(400).json({
        status: "fail",
        message: "periodMacro with startDate and endDate required for period mode",
      });
    }

    const datesInPeriod = getDatesBetween(periodMacro.startDate, periodMacro.endDate);
    newPerDayMacros = datesInPeriod.map((d) => ({
      date: d,
      type: periodMacro.type || "customized",
      adjustments: periodMacro.adjustments || { protein: 0, carbs: 0, fat: 0 },
      finalMacros: periodMacro.finalMacros,
    }));
  }

  const activePlans = await NutritionPlan.find({ memberId, isActive: true });
  for (const plan of activePlans) {
    plan.isActive = false;
    await plan.save();
    await archivePlan(plan);
  }

  const newPlan = await NutritionPlan.create({
    memberId,
    date: new Date(date),
    mode,
    recommendedMacros,
    customizedMacros,
    customInput,
    perDayMacros: newPerDayMacros,
    periodMacro,
    gender,
    height,
    weight,
    age,
    activityLevel,
    goal,
    isActive: true,
    version: 1,
  });

  res.status(201).json({ status: "success", data: newPlan });
});


exports.updateNutritionPlan = catchAsync(async (req, res) => {
  const plan = await NutritionPlan.findById(req.params.id);
  if (!plan)
    return res.status(404).json({ status: "fail", message: "Plan not found" });

  if (plan.isActive) {
    plan.isActive = false;
    await plan.save();
    await archivePlan(plan);
  }

  const updatedPlan = await NutritionPlan.create({
    ...plan.toObject(),
    ...req.body,
    isActive: true,
    version: plan.version + 1,
  });

  res.status(200).json({ status: "success", data: updatedPlan });
});

exports.deleteNutritionPlan = catchAsync(async (req, res) => {
  const plan = await NutritionPlan.findById(req.params.id);
  if (!plan)
    return res.status(404).json({ status: "fail", message: "Plan not found" });

  await archivePlan(plan);

  res.status(204).json({ status: "success", data: null });
});

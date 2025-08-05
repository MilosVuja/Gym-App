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

async function archivePlan(plan) {
  await NutritionHistory.create({
    memberId: plan.memberId,
    nutritionPlan: plan.toObject(),
  });
  await plan.deleteOne();
}

exports.getAllNutritionPlans = catchAsync(async (req, res) => {
  const { memberId } = req.query;
  if (!memberId)
    return res
      .status(400)
      .json({ status: "fail", message: "memberId required" });

  const activePlans = await NutritionPlan.find({ memberId }).sort({ date: -1 });
  res
    .status(200)
    .json({
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

exports.getMacrosByDate = catchAsync(async (req, res) => {
  const { memberId, date } = req.params;
  if (!memberId || !date)
    return res
      .status(400)
      .json({ status: "fail", message: "memberId and date required" });

  const { dayStart, dayEnd } = getDayRange(date);

  const plan = await NutritionPlan.findOne({
    memberId,
    date: { $gte: dayStart, $lte: dayEnd },
    isActive: true,
  });

  if (!plan) {
    return res
      .status(404)
      .json({
        status: "fail",
        message:
          "No active nutrition plan found for this member on the given date",
      });
  }

  let macrosForDay;

  if (plan.mode === "perDay") {
    macrosForDay = plan.perDayMacros.find(
      (entry) =>
        entry.date.toISOString().slice(0, 10) ===
        dayStart.toISOString().slice(0, 10)
    );
    if (!macrosForDay) {
      return res.status(404).json({
        status: "fail",
        message: "No macros saved for the specified day in perDay mode",
      });
    }
  } else if (plan.mode === "period") {
    if (
      dayStart < new Date(plan.periodMacro.startDate) ||
      dayEnd > new Date(plan.periodMacro.endDate)
    ) {
      return res.status(404).json({
        status: "fail",
        message: "Date is outside the saved period range",
      });
    }
    macrosForDay = plan.periodMacro;
  } else {
    return res
      .status(400)
      .json({ status: "fail", message: "Invalid nutrition plan mode" });
  }

  res.status(200).json({
    status: "success",
    data: {
      type: macrosForDay.type,
      adjustments: macrosForDay.adjustments,
      finalMacros: macrosForDay.finalMacros,
    },
  });
});
exports.createOrUpdateNutritionPlan = catchAsync(async (req, res) => {
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

  if (mode === "perDay") {
    if (!perDayMacros || perDayMacros.length !== 7) {
      return res.status(400).json({
        status: "fail",
        message: "7 days of macros required for perDay mode",
      });
    }
  } else if (mode === "period") {
    if (!periodMacro) {
      return res.status(400).json({
        status: "fail",
        message: "periodMacro required for period mode",
      });
    }
  } else {
    return res
      .status(400)
      .json({ status: "fail", message: "Invalid mode specified" });
  }

  let existingPlan = await NutritionPlan.findOne({
    memberId,
    date: { $gte: dayStart, $lte: dayEnd },
    isActive: true,
  });

  if (existingPlan) {
    existingPlan.isActive = false;
    await existingPlan.save();
    await archivePlan(existingPlan);
  }

  const newPlan = await NutritionPlan.create({
    memberId,
    date: new Date(date),
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
    isActive: true,
    version: 1,
  });

  res.status(201).json({ status: "success", data: newPlan });
});

exports.updateNutritionPlan = catchAsync(async (req, res) => {
  const plan = await NutritionPlan.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ status: "fail", message: "Plan not found" });
  }

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
  if (!plan) {
    return res.status(404).json({ status: "fail", message: "Plan not found" });
  }

  await archivePlan(plan);

  res.status(204).json({ status: "success", data: null });
});

const Nutrition = require("../models/NutritionModel");
const catchAsync = require("../utilities/catchAsync");

exports.getActivePlan = catchAsync(async (req, res, next) => {
  const memberId = req.member.id;
  const today = new Date();

  const activePlan = await Nutrition.findOne({
    member: memberId,
    startDate: { $lte: today },
    endDate: { $gte: today },
    isActive: true,
  });

  if (!activePlan) {
    return res.status(404).json({ planExists: false });
  }

  res.json({ planExists: true, plan: activePlan });
});

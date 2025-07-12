const TrainingPlan = require("../../models/trainingPlan/TrainingPlanModel");
const Member = require("../../models/membersModel");
const catchAsync = require("../../utilities/catchAsync");

exports.getAllActiveTrainingPlans = catchAsync(async (req, res) => {
  if (req.member.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "Only admins can view active training plans.",
    });
  }

  const activePlans = await TrainingPlan.find({ isActive: true })
    .populate("member")
    .populate("trainingDays.exercises.exercise");

  res.status(200).json({
    status: "success",
    data: { activePlans },
  });
});

exports.getActiveTrainingPlan = catchAsync(async (req, res) => {
  const member = await Member.findById(req.member._id).populate({
    path: "activeTrainingPlan",
    populate: {
      path: "trainingDays.exercises.exercise",
      model: "Exercise",
    },
  });

  if (!member || !member.activeTrainingPlan) {
    return res.status(200).json({
      status: "success",
      data: { activePlan: null },
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      activePlan: member.activeTrainingPlan,
    },
  });
});

exports.saveTraining = catchAsync(async (req, res) => {
  const {
    name,
    description,
    duration,
    trainingsPerWeek,
    weekStart,
    amountOfTrainings,
    trainingDays,
  } = req.body;

  const memberId = req.member._id;

  const newTrainingPlan = new TrainingPlan({
    name,
    description,
    duration,
    trainingsPerWeek,
    weekStart,
    amountOfTrainings,
    trainingDays: trainingDays.map((day) => ({
      day: day.day,
      trainingType: day.trainingType,
      exercises: day.exercises.map((exercise) => ({
exercise: exercise.exercise || exercise._id,

        name: exercise.name,
        thumbnail: exercise.thumbnail,
        video: exercise.video,
        instructions: exercise.instructions,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        dropsets: exercise.dropsets || [],
        rest: exercise.rest,
      })),
    })),
    member: memberId,
  });

  await newTrainingPlan.save();

  const member = await Member.findById(memberId);
  if (!member) return res.status(404).json({ error: "Member not found" });

  if (member.activeTrainingPlan) {
    member.trainingHistory.push({
      plan: member.activeTrainingPlan,
      startDate: new Date(),
      endDate: new Date(),
      completed: true,
    });
  }

  member.activeTrainingPlan = newTrainingPlan._id;
  await member.save();

  res
    .status(201)
    .json({ message: "Training plan saved!", plan: newTrainingPlan });
});

exports.getTrainingHistory = catchAsync(async (req, res) => {
  const member = await Member.findById(req.member._id)
    .populate("activeTrainingPlan")
    .populate("trainingHistory.plan");

  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  res.status(200).json({
    status: "success",
    activeTrainingPlan: member.activeTrainingPlan,
    trainingHistory: member.trainingHistory,
  });
});

exports.deleteTrainingDay = catchAsync(async (req, res) => {
  const { planId, dayId } = req.params;

  await TrainingPlan.findByIdAndUpdate(planId, {
    $pull: { trainingDays: { _id: dayId } },
  });

  res.status(204).json({ status: "success", data: null });
});

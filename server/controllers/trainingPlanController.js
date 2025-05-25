const TrainingPlan = require("../models/trainingPlanModel");
const catchAsync = require("../utilities/catchAsync");
const Member = require("../models/membersModel");

exports.getAllActiveTrainingPlans = catchAsync(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "Access denied. Only admins can view active training plans.",
    });
  }

  const activePlans = await TrainingPlan.find({ isActive: true }).populate(
    "member exercises"
  );

  if (!activePlans) {
    return res.status(404).json({
      status: "fail",
      message: "No active training plans found.",
    });
  }

  res.status(200).json({
    status: "success",
    data: { activePlans },
  });
});

exports.getActiveMemberPlan = catchAsync(async (req, res) => {
  const memberId = req.member._id;

  const member = await Member.findById(memberId).select('activeTrainingPlan');
  if (!member) {
    return res.status(404).json({
      status: "fail",
      message: "No member found with that ID.",
    });
  }

  if (!member.activeTrainingPlan) {
    return res.status(404).json({
      status: "fail",
      message: "No active training plan found for this member.",
    });
  }

  const activePlan = await TrainingPlan.findById(member.activeTrainingPlan);

  if (!activePlan) {
    return res.status(404).json({
      status: "fail",
      message: "Active training plan not found.",
    });
  }

  res.status(200).json({
    status: "success",
    data: { activePlan },
  });
});

exports.addExercise = catchAsync(async (req, res) => {
  const { planId, dayId } = req.params;
  const newExercise = {
    name: req.body.name,
    sets: req.body.sets,
    reps: req.body.reps,
    weight: req.body.weight,
    duration: req.body.duration,
    notes: req.body.notes,
  };

  const plan = await TrainingPlan.findOneAndUpdate(
    {
      _id: planId,
      "trainingDays._id": dayId,
    },
    {
      $push: { "trainingDays.$.exercises": newExercise },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: { plan },
  });
});

exports.saveTraining = catchAsync(async (req, res, next) => {
  try {
    const {
      name,
      description,
      duration,
      trainingsPerWeek,
      weekStart,
      amountOfTrainings,
      trainingDays,
    } = req.body;
    const memberId = req.member.id;

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
          name: exercise.name,
          thumbnail: exercise.thumbnail,
          video: exercise.video,
          instructions: exercise.instructions,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
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

    res.status(201).json({ message: "Training plan saved!", plan: newTrainingPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save training plan", message: error.message });
  }
});

exports.getTrainingHistory = catchAsync(async (req, res, next) => {
  const member = await Member.findById(req.member.id)
    .populate("activeTrainingPlan")
    .populate("trainingHistory.plan");

  if (!member) return res.status(404).json({ error: "Member not found" });

  res.status(200).json({
    activeTrainingPlan: member.activeTrainingPlan,
    trainingHistory: member.trainingHistory,
  });
});

exports.deleteTrainingDay = catchAsync(async (req, res) => {
  const { planId, dayId } = req.params;

  await TrainingPlan.findByIdAndUpdate(planId, {
    $pull: { trainingDays: { _id: dayId } },
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

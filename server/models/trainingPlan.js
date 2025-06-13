const mongoose = require("mongoose");

const trainingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Training plan must have a name"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  duration: {
    type: Number,
    required: [true, "Training plan must have a duration"],
  },
  trainingsPerWeek: {
    type: Number,
    required: [true, "Trainings per week is required"],
  },
  weekStart: {
    type: Date,
    required: true,
  },
  amountOfTrainings: Number,
  trainingDay: [{ type: mongoose.Schema.Types.ObjectId, ref: "trainingDay" }],
  createdAt: { type: Date, default: Date.now },
});

const TrainingPlan = mongoose.model("TrainingPlan", trainingPlanSchema);

module.exports = TrainingPlan;

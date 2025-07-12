const mongoose = require("mongoose");
const TrainingDaySchema = require("./TrainingDayModel");
const CompletedSessionSchema = require("./CompletedSessionModel");

const TrainingPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Training plan must have a name"],
      trim: true,
    },
    description: { type: String, trim: true },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    duration: {
      type: Number,
      required: [true, "Training plan must have a duration (in weeks)"],
    },
    trainingsPerWeek: {
      type: Number,
      required: [
        true,
        "Training plan must have a number of trainings per week",
      ],
    },
    weekStart: { type: Date, required: true },
    amountOfTrainings: { type: Number },
    trainingDays: [TrainingDaySchema],
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    completedSessions: [CompletedSessionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingPlan", TrainingPlanSchema);

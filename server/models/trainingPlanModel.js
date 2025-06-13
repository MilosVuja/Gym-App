const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  thumbnail: { type: String },
  video: { type: String },
  instructions: { type: String },
  sets: { type: Number, default: null },
  reps: { type: Number, default: null },
  weight: { type: Number, default: null },
  rest: { type: Number, default: null },
  duration: { type: Number, default: null },
});

const TrainingDaySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  trainingType: { type: String },
  exercises: [ExerciseSchema],
});

const TrainingPlanSchema = new mongoose.Schema({
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
    required: [true, "Training plan must have a duration (in weeks)"],
  },
  trainingsPerWeek: {
    type: Number,
    required: [true, "Training plan must have a number of trainings per week"],
  },
  weekStart: {
    type: Date,
    required: true,
  },
  amountOfTrainings: {
    type: Number,
  },

  trainingDays: [TrainingDaySchema],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const CompletedSessionSchema = new mongoose.Schema({
  member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
  },
  date: {
      type: Date,
      default: Date.now,
  },
  exercises: [
      {
          name: { type: String, required: true },
          sets: { type: Number, default: null },
          reps: { type: Number, default: null },
          weight: { type: Number, default: null },
          duration: { type: Number, default: null },
          notes: String,
      },
  ],
});

TrainingPlanSchema.add({
  completedSessions: [CompletedSessionSchema],
});

module.exports = mongoose.model("TrainingPlan", TrainingPlanSchema);




// const mongoose = require("mongoose");

// const ExerciseSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   thumbnail: { type: String },
//   video: { type: String },
//   instructions: { type: String },
//   sets: { type: Number },
//   reps: { type: Number },
//   weight: { type: Number },
//   rest: { type: Number },
//   duration: { type: Number },
// }, { timestamps: true });

// const TrainingDaySchema = new mongoose.Schema({
//   day: {
//     type: String,
//     enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
//     required: true
//   },
//   trainingType: { type: String },
//   exercises: [ExerciseSchema],
// }, { timestamps: true });

// const TrainingPlanSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   description: { type: String },
//   member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
//   duration: { type: Number, required: true }, // in weeks
//   trainingsPerWeek: { type: Number, required: true },
//   weekStart: { type: Date, required: true },
//   amountOfTrainings: { type: Number },

//   trainingDays: [TrainingDaySchema],
//   status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
// }, { timestamps: true });

// module.exports = mongoose.model("TrainingPlan", TrainingPlanSchema);

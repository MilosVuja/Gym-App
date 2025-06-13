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
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  trainingType: String,
  exercises: [ExerciseSchema],
});

const TrainingDay = mongoose.model("TrainingDay", TrainingDaySchema);
module.exports = TrainingDay;
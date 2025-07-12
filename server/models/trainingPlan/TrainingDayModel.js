const mongoose = require("mongoose");
const ExerciseSessionSchema = require("./ExerciseSessionModel");

const TrainingDaySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    ],
    required: true,
  },
  trainingType: { type: String },
  exercises: [ExerciseSessionSchema],
});

module.exports = TrainingDaySchema;
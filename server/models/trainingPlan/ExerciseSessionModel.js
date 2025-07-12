const mongoose = require("mongoose");
const SetSchema = require("./SetModel");

const ExerciseSessionSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  instructions: { type: String },
  sets: [SetSchema],
});

module.exports = ExerciseSessionSchema;
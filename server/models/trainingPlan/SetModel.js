const mongoose = require("mongoose");

const DropSetSchema = new mongoose.Schema({
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
}, { _id: false });

const SetSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: true,
    min: [0, "Reps cannot be negative"],
  },
  weight: {
    type: Number,
    required: true,
    min: [0, "Weight cannot be negative"],
  },
  dropsets: {
    type: [DropSetSchema],
    default: [],
  },
  rest: {
    type: Number,
    default: 0,
    min: [0, "Rest time cannot be negative"],
  },
}, { _id: false });

module.exports = SetSchema;

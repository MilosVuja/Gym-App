const mongoose = require("mongoose");

const measurementsSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    weight: Number,
    height: Number,
    bmi: Number,
    fat: Number,
    waist: Number,
    arm: Number,
    thigh: Number,
  },
  { timestamps: true }
);

const Measurements = mongoose.model("Measurements", measurementsSchema);
module.exports = Measurements;

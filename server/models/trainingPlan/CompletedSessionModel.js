const mongoose = require("mongoose");

const CompletedSessionSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
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

module.exports = CompletedSessionSchema;

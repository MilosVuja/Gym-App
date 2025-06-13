const mongoose = require("mongoose");

const CompletedSessionSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  date: { type: Date, default: Date.now },
  exercises: [
    {
      name: { type: String, required: true },
      sets: Number,
      reps: Number,
      weight: Number,
      duration: Number,
      notes: String,
    },
  ],
});

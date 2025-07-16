const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Weight", "Cardio", "Strength"],
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

goalSchema.pre("save", function (next) {
  if (this.progress >= 100) {
    this.status = "completed";
  } else if (new Date(this.deadline) < new Date()) {
    this.status = "expired";
  } else {
    this.status = "active";
  }
  next();
});

module.exports = mongoose.model("Goal", goalSchema);

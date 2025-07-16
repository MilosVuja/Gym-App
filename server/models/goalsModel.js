const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "weight",
        "fat",
        "waist",
        "arm",
        "leg",
        "cardio",
        "strength",
        "height",
        "bmi",
      ],
      required: [true, "Goal type is required"],
      lowercase: true,
      trim: true,
    },
    currentValue: {
      type: Number,
      default: null,
    },
    goalValue: {
      type: Number,
      required: [true, "Goal value is required"],
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
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
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
      lowercase: true,
      trim: true,
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

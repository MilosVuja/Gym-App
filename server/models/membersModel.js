const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MemberSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female"] },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    gymId: { type: String, unique: true },
    measurements: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Measurement" },
    ],
    memberships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Membership" }],

    trainingPlans: [
      { type: mongoose.Schema.Types.ObjectId, ref: "TrainingPlan" },
    ],

    completedSessions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "CompletedSession" },
    ],

    healthIssues: [
      { type: mongoose.Schema.Types.ObjectId, ref: "HealthIssue" },
    ],

    goals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Goal" }],

    preferences: {
      weightUnit: { type: String, enum: ["kg", "lbs"], default: "kg" },
      heightUnit: { type: String, enum: ["cm", "inches"], default: "cm" },
    },

    role: {
      type: String,
      enum: ["admin", "manager", "trainer", "member", "infoDesk", "staff"],
      default: "member",
      required: true,
    },

    roleHistory: [
      {
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Member",
          required: true,
        },
        oldRole: { type: String, required: true },
        newRole: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    trainerHistory: [
      {
        trainer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Member",
          required: true,
        },
        assignedAt: { type: Date, default: Date.now },
        unassignedAt: { type: Date },
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive", "banned", "pending"],
      default: "pending",
    },

    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },

    notifications: {
      emailReminders: { type: Boolean, default: true },
      workoutTips: { type: Boolean, default: false },
      trainerMessages: { type: Boolean, default: true },
    },

    chatThreads: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatThread" }],

    lastLogin: { type: Date },
    lastTrainingCompleted: { type: Date },

    activeTrainingPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingPlan",
    },

    trainingHistory: [
      {
        plan: { type: mongoose.Schema.Types.ObjectId, ref: "TrainingPlan" },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

MemberSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

MemberSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Member", MemberSchema);

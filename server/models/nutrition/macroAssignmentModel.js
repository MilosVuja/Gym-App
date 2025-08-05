const mongoose = require("mongoose");

const macroAssignmentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    weight: { type: Number, required: true },
    age: { type: Number, required: true },

    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "athlete"],
      required: true,
    },

    goal: {
      type: String,
      enum: ["lose", "maintain", "gain"],
      required: true,
    },

    recommendedMacros: {
      protein: Number,
      carbs: Number,
      fat: Number,
      calories: Number,
    },

    customize: {
      type: Boolean,
      default: false,
    },

    customIntake: {
      proteinPerKg: { type: Number, default: 0 },
      fatPerKg: { type: Number, default: 0 },
    },

    customizedMacros: {
      protein: Number,
      carbs: Number,
      fat: Number,
      calories: Number,
    },

    type: {
      type: String,
      required: true,
      enum: ["standard", "custom", "adjusted"],
    },

    adjustedMacros: {
      protein: Number,
      carbs: Number,
      fat: Number,
      calories: Number,
    },

    macroAdjustments: {
      protein: {
        reduced: { type: Boolean, default: false },
        difference: { type: Number, default: 0 },
      },
      carbs: {
        reduced: { type: Boolean, default: false },
        difference: { type: Number, default: 0 },
      },
      fat: {
        reduced: { type: Boolean, default: false },
        difference: { type: Number, default: 0 },
      },
    },

    days: [
      {
        date: { type: Date, required: true },
        macros: {
          protein: { type: Number, required: true },
          carbs: { type: Number, required: true },
          fat: { type: Number, required: true },
          calories: { type: Number, required: true },
        },
        notes: String,
      },
    ],

    periodStart: Date,
    periodEnd: Date,

    notes: String,
  },
  { timestamps: true }
);

macroAssignmentSchema.index({ memberId: 1 });
macroAssignmentSchema.index({ "days.date": 1 });

module.exports = mongoose.model("MacroAssignment", macroAssignmentSchema);

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
      proteinPerKg: Number,
      fatPerKg: Number,
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
    },

    adjustedMacros: {
      protein: Number,
      carbs: Number,
      fat: Number,
      calories: Number,
    },

    macroAdjustments: {
      protein: {
        reduced: Boolean,
        difference: Number,
      },
      carbs: {
        reduced: Boolean,
        difference: Number,
      },
      fat: {
        reduced: Boolean,
        difference: Number,
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

module.exports = mongoose.model("MacroAssignment", macroAssignmentSchema);

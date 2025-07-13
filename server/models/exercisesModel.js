const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  thumbnail: { type: String, required: true },
  video: { type: String, required: true },
  instruction: { type: String, required: true },
  muscles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Muscle" }],
  equipment: [
    {
      type: String,
      required: true,
      enum: [
        "Bodyweight",
        "Dumbbell",
        "Barbell",
        "Kettlebell",
        "Resistance Band",
        "Cable",
        "Machine",
        "Smith Machine",
        "Medicine Ball",
        "Stability Ball",
        "TRX",
        "Step",
        "Bench",
        "Punching Bag",
        "Battle Rope",
        "Elliptical",
        "Treadmill",
        "Rowing Machine",
        "Exercise Bike",
        "Jump Rope",
        "Sandbag",
        "Sled",
        "Foam Roller",
        "Other",
      ],
    },
  ],

  movement: [
    {
      type: String,
      required: true,
      enum: [
        "Push",
        "Pull",
        "Squat",
        "Lunge",
        "Hinge",
        "Rotation",
        "Anti-Extension",
        "Anti-Rotation",
        "Carry",
        "Jump",
        "Plyometric",
        "Isometric",
        "Stability",
        "Flexion",
        "Extension",
        "Abduction",
        "Adduction",
        "Explosive",
        "Dynamic",
        "Static",
        "Running",
        "Rowing",
        "Walking",
        "Cycling",
      ],
    },
  ],

  trainingType: [
    {
      type: String,
      required: true,
      enum: [
        "Strength",
        "Cardio",
        "Flexibility",
        "Hypertrophy",
        "Balance",
        "HIIT",
        "Endurance",
        "Power",
      ],
    },
  ],

  duration: { type: Number, required: false },
  caloriesBurned: { type: Number, required: false },

  category: [
    {
      type: String,
      enum: [
        "Bodybuilding",
        "CrossFit",
        "Functional",
        "Powerlifting",
        "Yoga",
        "Rehabilitation",
      ],
      required: true,
    },
  ],

  repetitions: { type: Number, required: false },
  timePerSet: { type: Number, required: false },

  tags: [
    {
      type: String,
      enum: [
        "Fat Loss",
        "Muscle Gain",
        "Endurance",
        "Core Strength",
        "Powerlifting",
        "Athletic Training",
        "Strength",
        "Flexibility",
        "Rehab",
        "Mobility",
        "Explosiveness",
        "Grip Strength",
        "Isometric",
        "Plyometric",
        "Full Body",
        "Upper Body",
        "Lower Body",
        "Cardio",
        "Bodyweight Only",
        "Weightlifting",
      ],
    },
  ],
});

exerciseSchema.index({ name: "text", tags: "text" });

module.exports = mongoose.model("Exercise", exerciseSchema);

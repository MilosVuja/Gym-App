const mongoose = require("mongoose");

const muscleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      "Trapezius",
      "Front Deltoideus",
      "Middle Deltoideus",
      "Rear Deltoideus",
      "Upper Chest",
      "Middle Chest",
      "Lower Chest",
      "Upper Back",
      "Latissimus",
      "Lower Back",
      "Triceps",
      "Biceps",
      "Forearm",
      "Abdominals",
      "Side Abs",
      "Gluteus",
      "Quadriceps",
      "Hamstrings",
      "Calves",
      "Adductor",
      "Abductor",
      "Tibialis",
      "TEST"
    ],
  },

  latinName: {
    type: String,
    required: true,
    enum: [
      "Trapezius",
      "Anterior Deltoideus",
      "Lateral Deltoideus",
      "Posterior Deltoideus",
      "Pectoralis Minor",
      "Pectoralis Major",
      "Rhomboids",
      "Latissimus Dorsi",
      "Erector Spinae",
      "Triceps Brachii",
      "Biceps Brachii",
      "Brachialis",
      "Rectus Abdominis",
      "Obliques",
      "Gluteus Maximus",
      "Quadriceps Femoris",
      "Biceps Femoris",
      "Gastrocnemius",
      "Adductors",
      "Abductors",
      "Tibialis Anterior",
      "TESTIS",
    ],
  },

  bodyPart: {
    type: String,
    required: true,
    enum: ["Upper Body", "Lower Body", "Full Body"],
  },

  muscleGroup: {
    type: String,
    required: true,
    enum: ["Chest", "Back", "Shoulders", "Arms", "Legs", "Abs", "Glutes"],
  },

  information: { type: String, required: true },
  description: { type: String, required: true },
  movements: { type: String, required: true },
});

module.exports = mongoose.model("Muscle", muscleSchema);

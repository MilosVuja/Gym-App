const Muscles = require("../models/musclesModel");
const Exercises = require("../models/exercisesModel");
const catchAsync = require("../utilities/catchAsync");

const multer = require("multer");
const upload = multer();

exports.getAllExercises = catchAsync(async (req, res, next) => {
  const exercises = await Exercises.find();

  res.status(200).json({
    status: "Success",
    results: exercises.length,
    data: {
      exercises,
    },
  });
  next();
});

exports.getExercise = catchAsync(async (req, res, next) => {
  const exercise = await Exercises.findById(req.params.id);

  if (!exercise) {
    return res.status(404).json({
      status: "error",
      message: "No exercise found with that ID.",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      exercise,
    },
  });
  next();
});

exports.getFilteredExercises = catchAsync(async (req, res, next) => {
  let filter = {};

  const {
    search,
    muscles,
    trainingType,
    category,
    equipment,
    movement,
  } = req.query;

  if (search) {
    filter.$text = { $search: search };
  }

  if (trainingType) {
    filter.trainingType = trainingType;
  }

  if (category) {
    filter.category = category;
  }

  if (muscles) {
    const muscleNames = muscles.split(",");
    const muscleIds = await Muscles.find({ name: { $in: muscleNames } }).select("_id");
    filter.muscles = { $in: muscleIds.map((m) => m._id) };
  }

  if (equipment) {
    const equipmentValues = equipment.split(",");
    filter.equipment = { $in: equipmentValues.map(e => new RegExp(`^${e}$`, "i")) };
  }


  if (movement) {
    const movementValues = movement.split(",");
    filter.movement = { $in: movementValues.map(e => new RegExp(`^${e}$`, "i")) };
  }

  const exercises = await Exercises.find(filter);

  res.status(200).json({
    status: "success",
    results: exercises.length,
    data: exercises,
  });
});

exports.addExercise = [
  upload.none(),
  catchAsync(async (req, res) => {

    const {
      name,
      thumbnail,
      video,
      instruction,
      muscles,
      equipment,
      movement,
      trainingType,
      category,
      repetitions,
      timePerSet,
      tags,
    } = req.body;

    let musclesArray, equipmentArray, tagsArray;

    try {
      musclesArray = JSON.parse(muscles);
      equipmentArray = equipment ? JSON.parse(equipment) : [];
      tagsArray = tags ? JSON.parse(tags) : [];
    } catch (err) {
      console.error("Error parsing JSON arrays:", err);
      return res.status(400).json({
        message:
          "Invalid format for muscles, equipment, or tags. They should be valid JSON arrays.",
      });
    }

    if (!Array.isArray(musclesArray) || musclesArray.length === 0) {
      return res.status(400).json({
        message: "At least one muscle must be selected.",
      });
    }

    const existingExercise = await Exercises.findOne({ name });
    if (existingExercise) {
      return res.status(400).json({
        message: "An exercise with this name already exists.",
      });
    }

    const newExercise = new Exercises({
      name,
      thumbnail,
      video,
      instruction,
      muscles: musclesArray,
      equipment: equipmentArray,
      movement,
      trainingType,
      category,
      repetitions,
      timePerSet,
      tags: tagsArray,
    });

    try {
      await newExercise.save();
      res.status(201).json({
        status: "success",
        data: { newExercise },
      });
    } catch (err) {
      console.error("MongoDB Save Error:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to save exercise",
        error: err.message,
      });
    }
  }),
];

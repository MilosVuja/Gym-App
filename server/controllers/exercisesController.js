const Muscles = require("../models/musclesModel");
const Exercises = require("../models/exercisesModel");
const catchAsync = require("../utilities/catchAsync");
const multer = require("multer");
const upload = multer();

exports.getAllExercises = catchAsync(async (req, res, next) => {
  const exercises = await Exercises.find();
  return res.status(200).json({
    status: "success",
    results: exercises.length,
    data: { exercises },
  });
});

exports.getExercise = catchAsync(async (req, res, next) => {
  const exercise = await Exercises.findById(req.params.id);

  if (!exercise) {
    return res.status(404).json({
      status: "error",
      message: "No exercise found with that ID.",
    });
  }

  return res.status(200).json({
    status: "success",
    data: { exercise },
  });
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

  if (trainingType) filter.trainingType = trainingType;
  if (category) filter.category = category;

  if (muscles) {
    const muscleNames = muscles.split(",").map((name) => name.trim());

    const muscleDocs = await Muscles.find({
      name: { $in: muscleNames.map((name) => new RegExp(`^${name}$`, "i")) },
    }).select("_id");

    if (muscleDocs.length === 0) {
      return res.status(200).json({
        status: "success",
        results: 0,
        data: [],
        message: "No exercises found. No muscles matched.",
      });
    }

    filter.muscles = { $in: muscleDocs.map((m) => m._id) };
  }

  if (equipment) {
    const values = equipment.split(",").map((e) => e.trim());
    filter.equipment = { $in: values.map((v) => new RegExp(`^${v}$`, "i")) };
  }

  if (movement) {
    const values = movement.split(",").map((m) => m.trim());
    filter.movement = { $in: values.map((v) => new RegExp(`^${v}$`, "i")) };
  }

  const exercises = await Exercises.find(filter).populate("muscles");

  return res.status(200).json({
    status: "success",
    results: exercises.length,
    data: exercises,
  });
});

exports.addExercise = [
  upload.none(),
  catchAsync(async (req, res, next) => {
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

    const musclesArray = Array.isArray(muscles) ? muscles : [muscles].filter(Boolean);
    const equipmentArray = Array.isArray(equipment) ? equipment : [equipment].filter(Boolean);
    const tagsArray = Array.isArray(tags) ? tags : [tags].filter(Boolean);

    if (musclesArray.length === 0) {
      return res.status(400).json({
        message: "At least one muscle must be selected.",
      });
    }

    const existing = await Exercises.findOne({ name });
    if (existing) {
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

    await newExercise.save();

    return res.status(201).json({
      status: "success",
      data: { newExercise },
    });
  }),
];


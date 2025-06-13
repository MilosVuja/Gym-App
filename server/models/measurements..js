const { default: mongoose } = require("mongoose");

const pictureSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: String,
});

const measurementSchema = new mongoose.Schema({
  weight: { type: Number, min: 0 },
  bodyFat: { type: Number, min: 0, max: 100 },
  chest: { type: Number, min: 0 },
  waist: { type: Number, min: 0 },
  hips: { type: Number, min: 0 },
  arms: { type: Number, min: 0 },
  legs: { type: Number, min: 0 },
  measurementPictures: [pictureSchema],
  recordedAt: { type: Date, default: Date.now },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
});

const Measurements = mongoose.model("Measurement", measurementSchema);
module.exports = Measurements;

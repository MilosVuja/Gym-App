const Measurement = require("../models/MeasurementsModel.js");
const catchAsync = require("../utilities/catchAsync");

exports.addMeasurement = catchAsync(async (req, res) => {
  const memberId = req.member.id;
  const measurement = await Measurement.create({
    member: memberId,
    ...req.body,
  });
  res.status(201).json({ success: true, data: measurement });
});

exports.getMeasurements = catchAsync(async (req, res) => {
  const memberId = req.member.id;
  const measurements = await Measurement.find({ member: memberId }).sort(
    "date"
  );
  res.status(200).json({ success: true, data: measurements });
});

exports.getMeasurementsByType = catchAsync(async (req, res) => {
  const memberId = req.member.id;
  const type = req.params.type.toLowerCase();
  const measurements = await Measurement.find({
    member: memberId,
    [type]: { $ne: null },
  }).sort("date");

  if (!measurements.length) {
    return res.status(404).json({
      error: "No measurement found for this type",
    });
  }

  res.status(200).json({
    success: true,
    data: measurements.map((m) => ({
      date: m.date,
      value: m[type],
    })),
  });
});

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

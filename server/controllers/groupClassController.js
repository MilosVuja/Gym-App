const { query } = require('express');
const GroupClass = require('./../models/groupClassModel');
const ApiFeatures = require('../utilities/apiFeatures');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

exports.getAllGroupClasses = catchAsync (async (req, res, next) => {
  const features = new ApiFeatures(GroupClass.find(), req.query)
  .filter()
  .sort()
  .limitFields()
  .paginate();
  
  const groupClasses = await features.query;

  res.status(200).json({
    status: 'Success!',
    results: groupClasses.length,
    data:{
      groupClasses: groupClasses
    }
  })
})

exports.getGroupClass = catchAsync (async (req, res, next) => {
  const groupClass = await GroupClass.findById(req.params.id);

  if(!groupClass){
    return next(new AppError('No group class found with that ID!', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: {
      groupClass
    }
  })
})

exports.createGroupClass = catchAsync (async (req, res, next) => {
  const newGroupClass = await GroupClass.create(req.body);

  res.status(201).json({
    status: 'Success!',
    data:{
      groupClass: newGroupClass
    }
  })
})

exports.updateGroupClass = catchAsync (async (req, res, next) => {
  const groupClass = await GroupClass.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if(!groupClass){
    return next(new AppError('No group class found with that ID!', 404));
  }

  res.status(200).json({
    status: 'Success!',
    data:{
      groupClass
    }
  })
})

exports.deleteGroupClass = catchAsync (async (req, res, next) => {
  const groupClass = await GroupClass.findByIdAndDelete(req.params.id);

  if(!groupClass){
    return next(new AppError('No group class found with that ID!', 404));
  }

  res.status(204).json({
    status: 'Success!',
    data: null
  })
})
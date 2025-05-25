const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require('validator');

const groupClassSchema = new mongoose.Schema({
  className:{
    type: String,
    maxlength: [20, 'A group class name must have less or equal then 20 characters!'],
    minlength: [5, 'A group class name must have more or equal then 5 characters!'],
    required: [true, 'Please provide name of a class!']
  },
  trainerName:{
    type: String,
    required: [true, 'Please input name of a trainer!']
  },
  time: String,
  location: String,
  difficulty: {
    type: String,
    required: [true, 'A group class must have a difficulty!'],
    enum:{
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium or difficult!'
    }
  },  
  maxGroupSize: Number,
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating musst be above 1.0!'],
    max: [5, 'Rating must be below 5.0!']
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
})

const GroupClass = mongoose.model('GroupClass', groupClassSchema);
module.exports = GroupClass;
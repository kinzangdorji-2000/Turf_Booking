//jshint esversion:6

const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
  email: String,
  message: String,
});

module.exports = new mongoose.model("Feedback", feedbackSchema);

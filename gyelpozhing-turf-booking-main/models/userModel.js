//jshint esversion:6

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: String,
  phone: String,
  password: String,
  email: String,
  emailToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now()
  }
});


module.exports = new mongoose.model("User", userSchema);

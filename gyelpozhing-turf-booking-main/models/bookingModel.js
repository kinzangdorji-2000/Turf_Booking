 //jshint esversion:6

const mongoose = require("mongoose");
const bookingSchema = mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  date: String,
  time: String,
  day: String,
  emailToken: {
    type: String,
  },
  isConfirm: {
    type: Boolean,
  },
  payment: {
    type: Boolean,
  },
  img: String,
});

module.exports = new mongoose.model("Booking", bookingSchema);

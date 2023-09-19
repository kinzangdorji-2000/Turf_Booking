//jshint esversion:6

const {
  check,
  sanitizedBody,
} = require("express-validator");

const bookingValidation = [
  //Full Name validation
  check("name").trim().notEmpty().withMessage("Full Name is required!"),
  //Email || email validation
  check("email").notEmpty().withMessage("Email Address is required!").normalizeEmail().isEmail().withMessage("Email address must be valid"),
  //Phone number validation
  check("phone").notEmpty().withMessage("Phone Number is required!").isLength({min: 8}).withMessage("Phone number should be exactly 8 digits").isLength({max: 8}).withMessage("Phone number should be exactly 8 digits"),
  check("date").trim().notEmpty().withMessage("Date is required!"),
  check("time").trim().notEmpty().withMessage("Time is required!"),
];

module.exports = {bookingValidation};

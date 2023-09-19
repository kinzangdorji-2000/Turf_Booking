//jshint esversion:6

const {
  check,
  sanitizedBody,
} = require("express-validator");

const registerValidation = [
  //Full Name validation
  check("name").trim().notEmpty().withMessage("Full Name is required!"),
  //Email || email validation
  check("email").notEmpty().withMessage("Email Address is required!").normalizeEmail().isEmail().withMessage("Email address must be valid"),
  //Phone number validation
  check("phone").notEmpty().withMessage("Phone Number is required!"),
  //Password validation
  check("password").trim().notEmpty().withMessage("Password is required!").isLength({
    min: 6
  }).withMessage("Password must be minimum 6 characters long"),
  //Confirm password validation
  check("confirmPassword").custom((value, {
    req
  }) => {
    if (value !== req.body.confirmPassword) {
      throw new Error("Password confimation didn't match");
    }
    return true;
  })
];

const loginValidation = [
  //Email || email validation
  check("email").trim().notEmpty().withMessage("Email Address is required!").normalizeEmail().isEmail().withMessage("Email address must be valid"),
  //Password validation
  check("password").trim().notEmpty().withMessage("Password is required!").isLength({
    min: 5
  }).withMessage("Password must be minimum 5 characters long"),
];
const feedbackValidation = [
  //Email || email validation
  check("email").trim().notEmpty().withMessage("Email Address is required!").normalizeEmail().isEmail().withMessage("Email address must be valid"),
  //Password validation
  check("message").trim().notEmpty().withMessage("Message is required!").isLength({
    min: 5
  }).withMessage("Message must be minimum 5 characters long"),
];

const payValidation = [check("email").notEmpty().withMessage("Email Address is required!").normalizeEmail().isEmail().withMessage("Email address must be valid")];

module.exports = {registerValidation, loginValidation, feedbackValidation, payValidation};

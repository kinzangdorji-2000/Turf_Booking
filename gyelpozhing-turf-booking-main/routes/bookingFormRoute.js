//jshint esversion:6
const express = require("express");
const {
  matchedData,
  validationResult
} = require("express-validator");
const { bookingValidation } = require("../validator/bookingValidation");
const Booking = require("../models/bookingModel");
const crypto = require("crypto");
const router = express.Router();
const { transporter } = require("../config/email");
const app = express();

router.get("/bookingForm", function (req, res) {
  res.render("bookingForm");
});

router.post("/bookingForm", bookingValidation, function (req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errMsg = errors.mapped();
      var inputData = matchedData(req);
      res.render("bookingForm", { errors: errMsg, inputData: inputData });
    } else {
      Booking.findOne({ email: req.body.email }, function (err, foundUser) {
        if (err) {
          res.render("bookingForm", { errorMessage: err });
        }
        else if (foundUser) {
          res.render("bookingForm", { errorMessage: "This email is already used for booking. Please try with different email!" });
        } else {
          console.log("TIMEEEEE"+req.body.time.toString().substring(0 , 10));
          const booking = Booking({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            date: req.body.date,
            time: req.body.time,
            emailToken: crypto.randomBytes(64).toString("hex"),
            isConfirm: false,
            payment: false
          });
          booking.save(function (err) {
            if (err) {
              var errorMessage = err;
              res.render("bookingForm", { errorMessage: errorMessage });
            }
            else {
              var mailOptions = {
                from: req.body.email,
                to: process.env.auth_user,
                subject: "Gyelpozhing Turf Booking - Booking Requested",
                html: "<h4>Booking Requested</h4>Hello Admin,<br>I am " + req.body.name + " with email :"+req.body.email+" I want to booked your ground.<br>Thank you."
              };

              //sending mail
              var sendingMail = transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  res.render("bookingForm", { successMessage: error });
                } else {
                  res.render("bookingForm", { successMessage: "You have successfully submitted the form.Please wait for the confirmation.We will sent the confirmation link through your email. Thank you for using our service." });
                }
              });
            }
          });
        }
      });
    }
  } catch (err) {
    res.render("bookingForm", { errorMessage: err });
  }
});


module.exports = router;

//jshint esversion:6
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Booking = require("../models/bookingModel");
const {
  transporter
} = require("../config/email");
const {
  matchedData,
  validationResult
} = require("express-validator");
const {
  check,
  sanitizedBody,
} = require("express-validator");

// // SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString +(file.originalname));
  }
});
// const fileFilter = (req, file, cb) => {
//   if(file.minetype === 'image/png' || file.minetype === 'image/jpeg'){
//     cb(null, true);
//   }else{
//     cb(null, false);
//   }
// }

var upload = multer({
  storage: storage,
  // fileFilter: fileFilter,
});

router.get("/userPaymentForm", function (req, res) {
  res.render("userPaymentForm");
});

router.post("/userPaymentForm",  upload.single("image"), function (req, res) {
      Booking.findOne({
        email: req.body.email
      }, function (err, foundBooked) {
        if (foundBooked) {
          if (foundBooked.payment === false) {
            console.log("immmmmmmmm");
            if (foundBooked) {
              Booking.updateOne({
                _id: foundBooked._id
              }, {
                img: req.file.filename
              }, function (err) {
                if (err) {
                  console.log(err);
                } else {
                  var mailOptions = {
                    from: req.body.email,
                    to: process.env.auth_user,
                    subject: "Gyelpozhing Turf Booking - Payment made",
                    attachments: [{ // stream as an attachment
                      filename: req.file.filename,
                      path: path.join("public/uploads/" + req.file.filename)
                    }],
                    html: '<h3> From: ' + req.body.email + '</h3>Hello Admin, i am ' + foundBooked.name + ', i have payed ground fee la.<h4><br>Thank you la.'
                  };
    
                  //sending mail
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      res.render("userPaymentForm", {
                        errorMessage: error
                      });
                    } else {
                      res.render("userPaymentForm", {
                        successMessage: "Your Payment has been successful. Please wait for the confirmation message."
                      });
                    }
                  });
                }
              });
            } else {
              res.render("userPaymentForm", {
                errorMessage: "The current email was not used for ground booking. Please try with correct booked email!"
              });
            }
          } else {
            res.render("userPaymentForm", {
              successMessage: "You have already paid your ground fee. Thank you for using our service."
            });
          }
        } else {
          res.render("userPaymentForm", {
            errorMessage: "The current email was not used for ground booking. Please try with correct booked email!"
          });
        }
      });
    // }
});

module.exports = router;

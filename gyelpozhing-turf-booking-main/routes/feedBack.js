//jshint esversion:6
const express = require('express');
const router = express.Router();
const FeedBack = require("../models/feedBack");
const {transporter} = require("../config/email");
const {
  loginrequired,
  verifyEmail
} = require("../config/JWT");

router.get("/feedback", loginrequired, function (req, res) {
  FeedBack.find({ "feedbacks": { $ne: null } }, function (err, foundFeedbacks) {
    if (err) {
      res.render("feedback", { errorMessage: err });
    } else {
      res.render("feedback", { feedback: foundFeedbacks });
    }
  });
});

router.post("/feedback", function (req, res) {
  var submit = req.body.read;
  var result = submit.trim().split(" ");
  console.log("RRR"+result[0]);
  if (result[0] === "Reply") {
    FeedBack.findOne({ _id: result[1] }, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        res.render("feedBackReplyForm", { successMessage: foundUser.email });
      }
    });
  } else {
    FeedBack.deleteOne({ _id: result[1] }, function (err) {
      if (err) {
        FeedBack.find({ "feedbacks": { $ne: null } }, function (err, foundFeedbacks) {
          if (err) {
            res.render("feedback", { feedback: foundFeedbacks, errorMessage: err });
          } else {
            res.render("feedback", { feedback: foundFeedbacks });
          }
        });
      } else {
        FeedBack.find({ "feedbacks": { $ne: null } }, function (err, foundFeedbacks) {
          if (err) {
            res.render("feedback", { feedback: foundFeedbacks, errorMessage: err });
          } else {
            res.render("feedback", {
              feedback: foundFeedbacks,
              successMessage: "You have mark as read"
            });
          }
        });
      }
    });
  }
});

router.get("/feedBackReplyForm", loginrequired, function (req, res) {
  res.render("feedBackReplyForm");
});

router.post("/feedBackReplyForm", function (req, res) {
  var mailOptions = {
    from: "Gyelpozhing Turf Booking",
    to: req.body.email,
    subject: "Gyelpozhing Truf Booking - Feedback response",
    html: "<h2>Hello,</h2><p>" + req.body.message + "</p>"
  };

  //sending mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("email" + error);
    } else {
      FeedBack.find({ "feedbacks": { $ne: null } }, function (err, foundFeedbacks) {
        if (err) {
          res.render("feedback", { feedback: foundFeedbacks, errorMessage: err });
        } else {
          res.render("feedback", {feedback: foundFeedbacks,
            successMessage: "You have successfully sent the feedback response of email: " + req.body.email
          });
        }
      });
    }
  });
});

module.exports = router;
//jshint esversion:6
const express = require("express");
const router = express.Router();
const fs = require("fs");
const Booking = require("../models/bookingModel");
const {transporter} = require("../config/email");
const {
  loginrequired,
  verifyEmail
} = require("../config/JWT");
const { default: mongoose } = require("mongoose");

router.get("/dashboard",  loginrequired, function(req, res){
  Booking.find({"dashboard": {$ne: null}}, function(err, foundRecords){
    if(err){
      res.render("dashboard", {errorMessage: err});
    }else{
      res.render("dashboard", {bookedRecords: foundRecords});
    }
  });
});

router.get("/bookedUserList", loginrequired, function(req, res){
  Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
    if(err){
      res.render("bookedUserList", {errorMessage: err});
    }else{
      res.render("bookedUserList", {bookedRecords: foundRecords});
    }
  });
});

router.get("/verify-confirm-booking", function(req, res) {
  try {
    const token = req.query.token;
    const booking = Booking.findOne({
      emailToken: token
    });
    if (booking) {
      booking.updateOne({
        emailToken: token,
      }, function(err) {
        if (err) {
          res.render("userPaymentForm", {
            errorMessage: err
          });
        } else {
          res.render("userPaymentForm", {
            successMessage: "Please fill up the form for confirmation"
          });
        }
      });
    } else {
      res.render("bookingForm", {
        errorMessage: "Please try to fill up new form."
      });
    }
  } catch (err) {
    res.render("bookingForm", {
      errorMessage: err
    });
  }
});

//Confirm route
router.post("/bookedUserList", function(req, res){
  var submit = req.body.submit;
  var result = submit.trim().split(" ");
  console.log("CONFIRMMMMMMMMMMMM"+result[1]);
  if(result[0] === "Confirm"){
    console.log("CONFIRMMMMMMMMMMMM");
    console.log("CONFIRMMMMMMMMMMMM"+result[0]);
    Booking.findOne({_id: result[1]}, function(err, foundUser){
      if(err){
        console.log(err);
      }
      if(foundUser){
        Booking.updateOne({_id: result[1]},{isConfirm: true}, function(err){
          if(err){
            Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
              if(err){
                res.render("bookedUserList", {errorMessage: err});
              }else{
                res.render("bookedUserList", {bookedRecords: foundRecords, errorMessage: err});
              }
            });
          }else{
            Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
              if(err){
                res.render("bookedUserList", {errorMessage: err});
              }else{
                link = "http://" + req.headers.host + "/verify-confirm-booking?token=" +foundUser.emailToken;
                console.log("EMAILLLLL"+foundUser.email);
                var mailOptions = {
                  from: process.env.auth_user,
                  to: foundUser.email,
                  subject: "Gyelpozhing Truf Booking - Please verify your request by making payment.",
                  html: "<h2>Hello " + foundUser.name + ", Thanks for waiting for confirmation</h2><a href=" + link + ">Click Here to make pay</a>"
                };
                //sending mail
                transporter.sendMail(mailOptions, function(error, info) {
                  if (error) {
                    console.log("email" + error);
                  } else {
                    res.render("bookedUserList", {bookedRecords: foundRecords,
                      successMessage: "You have made confirmed by sending Confirmation link to " +foundUser.email
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }else if(result[0] === "Reject"){
    console.log("REJECTTTTTTTTTTTTTTTTTT "+result[0]);
    Booking.findOne({_id: result[1]}, function(err, foundUser){
      if(err){
        console.log(err);
      }
      if(foundUser){
        Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
          if(err){
            res.render("bookedUserList", {errorMessage: err});
          }else{
            res.render("bookedUserList", {bookedRecords: foundRecords,found: err});
          }
        });
        Booking.deleteOne({_id: result[1]},function(err){
          if(err){
            Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
              if(err){
                res.render("bookedUserList", {errorMessage: err});
              }else{
                res.render("bookedUserList", {bookedRecords: foundRecords, errorMessage: err});
              }
            });
          }else{
            Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
              if(err){
                res.render("bookedUserList", {errorMessage: err});
              }else{
                var mailOptions = {
                  from: process.env.auth_user,
                  to: foundUser.email,
                  subject: "Gyelpozhing Truf Booking - Rejected.",
                  html: "<h2>Hello " + foundUser.name + ",</h2><br>We are sorry to inform you but your request has been rejected."
                };
                //sending mail
                transporter.sendMail(mailOptions, function(error, info) {
                  if (error) {
                    console.log("email" + error);
                  } else {
                    res.render("bookedUserList", {bookedRecords: foundRecords,
                      successMessage: "You have made reject by sending rejected link to " +foundUser.email
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
  else{
    console.log("PAIDDDDDDDDDDDDDDDDDDDDDD "+result[0]);
    Booking.findOne({_id: result[1]}, function(err, foundUser){
      if(err){
        res.render("bookedUserList", {bookedRecords: foundRecords, errorMessage: err});
      }
      if(foundUser){
        Booking.updateOne({_id: result[1]},{payment: true}, function(err){
          if(err){
            Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
              if(err){
                res.render("bookedUserList", {errorMessage: err});
              }else{
                res.render("bookedUserList", {bookedRecords: foundRecords, errorMessage: err});
              }
            });
          }else{
            Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
              if(err){
                res.render("bookedUserList", {errorMessage: err});
              }else{
                var mailOptions = {
                  from: process.env.auth_user,
                  to: foundUser.email,
                  subject: "Gyelpozhing Truf Booking - Ground Booked Confirmed.",
                  html: "<h2>Hello " + foundUser.name + ",</h2><br><p>Thank you so much for being patient with us. You are confirmed to played at  "+ foundUser.time+","+ foundUser.date+"</p>"
                };
                //sending mail
                transporter.sendMail(mailOptions, function(error, info) {
                  if (error) {
                    console.log("email" + error);
                  } else {
                    res.render("bookedUserList", {bookedRecords: foundRecords,
                      successMessage: "You have made confirmed by sending Confirmation link to " +foundUser.email
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
});

//Confirm paid user list
router.get("/confirmBookedUserList",loginrequired, function(req, res){
  Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
    if(err){
      res.render("confirmBookedUserList", {errorMessage: err});
    }else{
      foundRecords.forEach(function(records){
        console.log("IIIIIII"+records.img);
      });
      res.render("confirmBookedUserList", {bookedRecords: foundRecords});
    }
  });
});

router.post("/confirmBookedUserList", function(req, res){
  Booking.findOne({_id: req.body.done}, function(err, foundUser){
    if(err){
      res.render("confirmBookedUserList", {errorMessage: err});
    }
    else{
      if(foundUser){
        Booking.deleteOne({_id: req.body.done},function(err){
          if(err){
            Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
              if(err){
                res.render("confirmBookedUserList", {errorMessage: err});
              }else{
                res.render("confirmBookedUserList", {bookedRecords: foundRecords});
              }
            });
          }else{
            Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
              if(err){
                res.render("confirmBookedUserList", {errorMessage: err});
              }else{
                const path = "public/uploads/" + foundUser.img;
                fs.unlink(path, (err) => {
                  if(err){
                    console.log(err);
                  }else{
                    console.log("file remove");
                  }
                })
                res.render("confirmBookedUserList", {bookedRecords: foundRecords,
                  successMessage: "You have mark done to " +foundUser.email
                });
              }
            });
          }
        });
      }
    }
  });
});

//show Booked user book List
router.get("/showBookedUserList",function(req, res){
  Booking.find({"bookings": {$ne: null}}, function(err, foundRecords){
    if(err){
      res.render("showBookedUserList", {errorMessage: err});
    }else if(foundRecords){
      res.render("showBookedUserList", {bookedRecords: foundRecords});
    }else{
      res.render("showBookedUserList", {bookedRecords: foundRecords, errorMessage: err});
    }
  });
});


module.exports = router;

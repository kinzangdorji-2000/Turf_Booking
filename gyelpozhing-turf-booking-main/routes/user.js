//jshint esversion:6

const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require("../models/userModel");
const cookieParser = require("cookie-parser");
const app = express();
const {
  loginrequired,
  verifyEmail
} = require("../config/JWT");
const {
  registerValidation,
  loginValidation, feedbackValidation
} = require("../validator/validation");
const { check,
  sanitizedBody,
  matchedData,
  validationResult
} = require("express-validator");
const Booking = require("../models/bookingModel");
const FeedBack = require("../models/feedBack");

app.use(cookieParser());
app.use(express.json());

router.get("/", function (req, res) {
  res.render("splash");
});
router.get("/home", function (req, res) {
  res.render("home");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.get("/register", function (req, res) {
  res.render("register");
});


router.get("/resetPasswordForm", function (req, res) {
  res.render("resetPasswordForm");
});

router.get("/forgotPassword", function (req, res) {
  res.render("forgotPassword");
});

router.post("/home", feedbackValidation, function (req, res) {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
      var errMsg = errors.mapped();
      var inputData = matchedData(req);
      res.render("home", {errors: errMsg, inputData: inputData});
  }else{
    const feedback = FeedBack({
      email: req.body.email,
      message: req.body.message
    });
    feedback.save(function (err) {
      if (err) {
        res.render("home", {errorMessage: err });
      } else {
        res.render("home", {successMessage: "Thank you so much for your feedback."});
      }
    })
  }
});

// mail sender details
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.auth_user,
    pass: process.env.auth_pass
  },
  tls: {
    rejectUnauthorized: false
  }
});

router.get("/logout", function (req, res, next) {
  res.cookie("access_token", "", {
    maxAge: 0
  });
  res.redirect("/login");
});

const createToken = (id) => {
  return jwt.sign({
    id
  }, process.env.JWT_SECRET);
};
router.get("/verify-email", function (req, res) {
  try {
    const token = req.query.token;
    const user = User.findOne({
      emailToken: token
    });
    if (user) {
      user.updateOne({
        isVerified: true
      }, function (err) {
        if (err) {
          res.render("login", {
            errorMessage: err
          });
        } else {
          res.render("login", {
            successMessage: "Your Email has been successfully verified, Please login to continue..."
          });
        }
      });
    } else {
      res.render("resgister", {
        errorMessage: "Something went wrong, Please try with valid email."
      });
    }
  } catch (err) {
    console.log("Verification Failed here " + err);
    res.render("login", {
      errorMessage: err
    });
  }
});
var token1;
router.get("/verify-password", function (req, res) {
  const token = req.query.token;
  token1 = token;
  const user = User.findOne({
    emailToken: token
  });
  if (user) {
    res.render("resetPasswordForm");
  }
});

router.post("/resetPasswordForm", [//Password validation
  check("password").trim().notEmpty().withMessage("Password is required!").isLength({
    min: 5
  }).withMessage("Password must be minimum 5 characters long"),
  //Confirm password validation
  check("confirmPassword").trim().custom((value, {
    req
  }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation didn't match");
    }
    return true;
  })], function (req, res) {
    try {
      var errors = validationResult(req);
      if (!errors.isEmpty()) {
        var errMsg = errors.mapped();
        var inputData = matchedData(req);
        res.render("resetPasswordForm", {
          errors: errMsg,
          inputData: inputData
        });
      } else {
        console.log("TOKKEEEEN " + token1);
        const user = User.findOne({
          emailToken: token1
        });
        console.log("USERNAME " + user);
        if (user) {
          bcrypt.hash(req.body.password, 10, function (err, hash) {
            user.updateOne({ password: hash }, function (err) {
              if (err) {
                res.render("resetPasswordForm", {
                  errorMessage: err
                });
              } else {
                res.render("login", {
                  successMessage: "Password reset successful, Please login to continue."
                });
              }
            });
          });
        }
      }
    } catch (err) {
      console.log("Verification Failed here " + err);
      res.render("login", {
        errorMessage: err
      });
    }
  });

router.post("/register", registerValidation, function (req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errMsg = errors.mapped();
      var inputData = matchedData(req);
      res.render("register", {
        errors: errMsg,
        inputData: inputData
      });
    } else {
      User.findOne({
        email: req.body.email
      }, function (err, foundUser) {
        if (err) {
          res.render("resgister", {
            errorMessage: err
          });
        } else if (foundUser) {
          res.render("resgister", {
            errorMessage: "This email is already registered. Please try with different email."
          });
        } else {
          bcrypt.hash(req.body.password, 10, function (err, hash) {
            const user = new User({
              name: req.body.name,
              email: req.body.email,
              phone: req.body.phone,
              password: hash,
              emailToken: crypto.randomBytes(64).toString("hex"),
              isVerified: false,
            });
            user.save(function (err) {
              if (err) {
                console.log(err);
              } else {
                link = "http://" + req.headers.host + "/verify-email?token=" + user.emailToken;
                var mailOptions = {
                  from: "Gyelpozhing Turf Booking",
                  to: user.email,
                  subject: "Gyelpozhing Truf Booking - verify your email",
                  html: "<h2>Hello " + req.body.name + ", Thanks for registering on our Website</h2><h4> Please verify your email to continue...</h4><a href=" + link + ">Verify your Email</a>"
                };

                //sending mail
                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log("email" + error);
                  } else {
                    console.log("Verification link is sent to your gmail account");
                    res.render("login", {
                      successMessage: "Verification link is sent to your gmail account"
                    });
                  }
                });
              }
            });
          });
        }
      });
    }
  } catch (err) {
    console.log("Verification Invalid" + err);
    res.render("register", {
      errorMessage: "Something went wrong, Please try again!"
    });
  }
});

router.post("/login", loginValidation, function(req, res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errMsg = errors.mapped();
      var inputData = matchedData(req);
      res.render("login", {
        errors: errMsg,
        inputData: inputData
      });
    }else{
      const email = req.body.email;
      const password = req.body.password;
      User.findOne({
        email: email
      }, function (err, foundUser) {
        if (err) {
          console.log(err);
          res.render("login", {
            errorMessage: err
          });
        } else if (foundUser) {
          bcrypt.compare(password, foundUser.password, function (err, result) {
            if (result === true) {
              const token = createToken(foundUser._id);
              //store token in cookies
              res.cookie("access_token", token,{
                httpOnly: true
              });
              Booking.find({ "bookings": { $ne: null } }, function (err, foundRecords) {
                if (err) {
                  res.render("dashboard");
                } else {
                  res.render("dashboard", { bookedRecords: foundRecords });
                  // res.render("dashboard");
                }
              });
            } else {
              res.render("login", {
                errorMessage: "Your password is incorrect!"
              });
            }
          });
        } else {
          res.render("login", {
            errorMessage: "No such User found!"
          });
        }
      });
    }
});

router.post("/forgotPassword", [check("email").notEmpty().withMessage("Email Address is required!").normalizeEmail().isEmail().withMessage("Email address must be valid")],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errMsg = errors.mapped();
      var inputData = matchedData(req);
      res.render("forgotPassword", {
        errors: errMsg,
        inputData: inputData
      });
    } else {
      User.findOne({
        email: req.body.email
      }, function (err, foundUser) {
        if (err) {
          console.log(err);
          res.render("forgotPassword", {
            errorMessage: err
          });
        } else if (foundUser) {
          link = "http://" + req.headers.host + "/verify-password?token=" + foundUser.emailToken;
          var mailOptions = {
            from: "Gyelpozhing Turf Booking",
            to: req.body.email,
            subject: "Gyelpozhing Turf Booking - Reset Password",
            html: "<h3>Hello " + foundUser.name + ",</h3><h4>Please click on the given link to reset your password.</h4><a href=" + link + ">Click here</a>"
          };

          //sending mail
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              res.render("forgotPassword", {
                errorMessage: error + " No such User found!"
              });
            } else {
              console.log("Verification link is sent to your gmail account");
              res.render("forgotPassword", {
                successMessage: "Reset Verification link has been sent to your registered email."
              });
            }
          });
        } else {
          res.render("forgotPassword", {
            errorMessage: "No such User found!"
          });
        }
      });
    }
  });

module.exports = router;

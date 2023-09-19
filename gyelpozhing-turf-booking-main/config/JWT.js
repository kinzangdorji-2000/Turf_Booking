//jshint esversion:6

const cookie = require("cookie-parser");
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");

const loginrequired = (req, res, next) => {
  const token = req.cookies['access_token'];
  console.log("Token: "+token);
  if(token){
    const validatetoken = jwt.verify(token, process.env.JWT_SECRET);
    if(validatetoken){
      res.user = validatetoken._id;
      next();
    }else{
      console.log("token expires");
      res.render("login", {errorMessage: "You are logout"});
    }
  }else{
    console.log("token not found!");
    res.render("login", {errorMessage: "Please login"});
  }
};

const verifyEmail = (req, res, next) => {
  try{
    User.find(function(err, users){
      if(err){
        console.log(err);
        res.render("login", {errorMessage: "Something went wrong, Please try to click your verification link again..."});
      }
      else{
        users.forEach(function(user){
          if(user.email === req.body.email){
            if(user.isVerified === true){
              next();
            }
            else{
              console.log("Your email is not verified");
              res.render("login", {errorMessage: "Your email is not verified"});
            }
          }
        });
      }
    });
  }catch (err){
    console.log(err);
    res.render("login", {errorMessage: "Something went wrong, Please try to click your verification link again..."});
  }
};

module.exports = {loginrequired, verifyEmail};

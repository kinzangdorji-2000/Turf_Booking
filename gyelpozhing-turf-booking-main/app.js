//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const userRoute = require("./routes/user");
const bookingFormRoute = require("./routes/bookingFormRoute");
const bookedUserListRoute = require("./routes/bookedUserListRoute");
const payedUserListRoute = require("./routes/payedUserListRoute");
const feedback = require("./routes/feedBack");

app.use(cookieParser());
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//set up mongoDB connection
mongoose.connect(process.env.MONGO_ATLAS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to mongo.");
  })
  .catch((err) => {
    console.log("Error connecting to mongo.", err);
  });

app.use("/", userRoute);
app.use("/", bookingFormRoute);
app.use("/", bookedUserListRoute);
app.use("/", payedUserListRoute);
app.use("/", feedback);

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000.");
});

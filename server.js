const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Product = require("./models/product");
const User = require("./models/user");

require("dotenv").config();

mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch(() => {
    console.error("MongoDB connection error!");
  });

//------------- FOR DEV PURPOSES----
//require('./seed');
//----------------------------------

app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.urlencoded({extended:false}));

app.get("/", async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("index", { products });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/register", (req, res, next) => {
  res.render("register");
});

app.post("/register", async (req, res, next) => {

  const username = req.body.username;
  const password = req.body.password;
  
  const encryptedPassword = await bcrypt.hash(password,10);

  await new User({username,password:encryptedPassword}).save();
  
  res.send("ok");

});

app.get("/login", (req, res, next) => {
  res.render("login");
});

app.post("/login", (req, res, next) => {
  res.send("ok");
});

app.listen(process.env.PORT, () => {
  console.log("listening");
});

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
  
  if (!username || !password){
    res.render("register",{status:"fail",failMessage:"You are missing some information"});
    return;
  }

  try {

  const existingUser = await User.findOne({username});

  if (existingUser){
    res.render("register",{status:'fail',failMessage:'User already exists'});
    return;
  }

  const encryptedPassword = await bcrypt.hash(password,10);

  await new User({username,password:encryptedPassword}).save();

  res.render("register",{status:'success',successMessage:'You registered successfully'});

  }

catch(err){
  console.error(err.message);
  res.render('register','something went wrong from our side');
}
  
});

app.get("/login", (req, res, next) => {
  res.render("login");
});

app.post("/login", async (req, res, next) => {

  const username = req.body.username;
  const password = req.body.password;
  
  if (!username || !password){
    res.render("login",{status:'fail',failMessage:'please enter all information'});
    return;
  }

  try{
  const existingUser = await User.findOne({username});

  if (existingUser && await bcrypt.compare(password,existingUser.password)){
    res.redirect('/');
    return;
  }
  else{
    res.render("login",{status:'fail',failMessage:'incorrect user or password'});
  }
  }

catch(err){
  console.error(err.message);
  res.render("login",{status:'fail',failMessage:'server error'});

}

//if the password was wrong or there was an error


}
  

);

app.listen(process.env.PORT, () => {
  console.log("listening");
});

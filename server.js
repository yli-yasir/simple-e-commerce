const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
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
app.use(cookieParser());

app.get("/", async (req, res, next) => {
  try {
    const products = await Product.find();

    const userToken = req.cookies.tkn;

    let user; 
    if (userToken){
    user = jwt.verify(userToken,process.env.SECRET);
    }

    res.render("index", { products,user});
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
    res.render("register",{status:"fail",message:"You are missing some information"});
    return;
  }

  try {

  const existingUser = await User.findOne({username});

  if (existingUser){
    res.render("register",{status:'fail',message:'User already exists'});
    return;
  }

  const encryptedPassword = await bcrypt.hash(password,10);

  await new User({username,password:encryptedPassword}).save();

  res.render("register",{status:'success',message:'You registered successfully'});

  }

catch(err){
  console.error(err.message);
  res.render('register',{status:"fail", message: 'something went wrong from our side'});
}
  
});

app.get("/login", (req, res, next) => {
  res.render("login");
});

app.post("/login", async (req, res, next) => {

  const username = req.body.username;
  const password = req.body.password;
  
  if (!username || !password){
    res.render("login",{status:'fail',message:'Please enter all information'});
    return;
  }

  try{

  const existingUser = await User.findOne({username});

  if (existingUser && await bcrypt.compare(password,existingUser.password)){
    const token = jwt.sign({username: existingUser.username },process.env.SECRET);
    res.cookie('tkn',token).redirect('/');
    return;
  }

  //redundant else
  else{
  res.render("login",{status:'fail',message:'Incorrect user or password'});
  }
  
  }

catch(err){
  console.error(err.message);
  res.render("login",{status:'fail',message:'Something went wrong from our side'});
}


});
  
app.get("/logout",(req,res,next)=>{
  res.clearCookie('tkn').redirect('/');
})


app.listen(process.env.PORT, () => {
  console.log("listening");
});

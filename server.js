const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Product = require("./models/product");
const User = require("./models/user");
const {checkToken,isLoggedInRedirect,isLoggedOutRedirect} = require('./middleware');

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
app.use(checkToken);



app.get("/", async (req, res, next) => {
  try {
    const products = await Product.find();

    res.render("index", { products,user:req.user});
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/register",isLoggedInRedirect,(req, res, next) => {
  res.render("register");
});

app.post("/register",isLoggedInRedirect, async (req, res, next) => {

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

app.get("/login",isLoggedInRedirect, (req, res, next) => {
  res.render("login");
});

app.post("/login",isLoggedInRedirect, async (req, res, next) => {

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
  
app.get("/logout",isLoggedOutRedirect,(req,res,next)=>{
  res.clearCookie('tkn').redirect('/');
})

app.post("/addtocart/:productId",isLoggedOutRedirect, async (req,res,next)=>{
  console.log('user is adding to cart')
  try{
  const userDocument = await User.findOne({username:req.username});
  
  const productId = req.params.productId;

  userDocument.cart.push(productId);

  await userDocument.save();

  console.log(userDocument.cart);
  res.redirect('/');
  }
  catch(err){
    console.log(err.message);

  }

});

app.listen(process.env.PORT, () => {
  console.log("listening");
});

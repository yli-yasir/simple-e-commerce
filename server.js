//Module imports
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
var methodOverride = require('method-override')

//Mongoose models
const Product = require("./models/product");
const User = require("./models/user");

//Custom middleware
const {
  renderRoot,
  checkUser,
  isLoggedInRedirect,
  isLoggedOutRedirect,
  addToCart
} = require("./middleware");

//Used for environment variables
require("dotenv").config();

//Required for mongoose
mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);

//Connect to the database
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB!");
    //------------- FOR DEV PURPOSES----
    //require('./seed');
    //----------------------------------
  })
  .catch(() => {
    console.error("MongoDB connection error!");
  });


app.set("view engine", "pug");
app.use(express.static("public"));
app.use(methodOverride('_method'))
//Parses url encoded bodies, and populates req.body
app.use(express.urlencoded({ extended: false }));
//Parses cookies, and populates req.cookies
app.use(cookieParser());
//Checks JWT, and populates req.user if user has a token
app.use(checkUser);


//Render the index
app.get("/", renderRoot );

//Add a product to cart
app.post("/", isLoggedOutRedirect,addToCart,renderRoot);

//Render the register form
app.get("/register", isLoggedInRedirect, (req, res, next) => {
  res.render("register");
});

//Handle register form submission
app.post("/register", isLoggedInRedirect, async (req, res, next) => {

  let username = req.body.username;
  let password = req.body.password;

  //If either the username or password were not supplied
  if (!username || !password) {
    return res.render("register", {
      status: "fail",
      message: "You are missing some information",
    });
  }
  //If they were supplied then we trim them
  else{
    username = username.trim();
    password = password.trim();
  }

  //--- THERE SHOULD BE MORE VALIDATION HERE 


  //Assuming that we finished validating / CONSIDER USING MONGOOSE VALIDATION


  //Check if there is already a user with that name
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render("register", {
        status: "fail",
        message: "User already exists",
      });
    }

    //Now that we are sure, that the username and password are valid, and the username isn't already taken...
    //We start to actually register the user


    //Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Save the user to the database
    await new User({ username, password: hashedPassword }).save();


    //Render the success page to the user
    res.render("register", {
      status: "success",
      message: "You registered successfully",
    });
  } 
  catch (err) {
    console.error(err.message);
    console.error(err);
    res.render("register", {
      status: "fail",
      message: "something went wrong from our side",
    });
  }
});

//Render the login form
app.get("/login", isLoggedInRedirect, (req, res, next) => {
  res.render("login");
});

//Handle the login form submission
app.post("/login", isLoggedInRedirect, async (req, res, next) => {
  
  //Get the username and passwrd from the request body
  let username = req.body.username;
  let password = req.body.password;


  //If one of them is missing then we render the form with failure alert
  if (!username || !password) {
    return res.render("login", {
      status: "fail",
      message: "Please enter all information",
    });
  }
  //If they are both supplied then we trim them 
  else{
    username = username.trim();
    password = password.trim();
  }

  //Do some extra validation here - or consider switching to mongoose based validation

  //Assuming that we validated
  try {
    const existingUser = await User.findOne({ username });


    //If the user exists and the password matches
    if ( existingUser && (await bcrypt.compare(password, existingUser.password))) {

      const token = jwt.sign({ username: existingUser.username },process.env.SECRET);

      //Store the token in cookies, and redirect to the root
      res.cookie("tkn", token).redirect("/");
      return;
    }

    //else , if the username was not found, or the password didn't match
    else {
      res.render("login", {
        status: "fail",
        message: "Incorrect user or password",
      });
    }

  } 
  //If something went wrong from the server side
  catch (err) {
    console.error(err.message);
    res.render("login", {
      status: "fail",
      message: "Something went wrong from our side",
    });
  }
});

//Log the user out
app.get("/logout", isLoggedOutRedirect, (req, res, next) => {
  res.clearCookie("tkn").redirect("/");
});

//Render the cart page
app.get("/cart",isLoggedOutRedirect,async (req,res,next)=>{
  try{
    //Find the user document and populate the user cart with full cart objects since it only contained Ids of products
    const user = await User.findOne({username: req.user.username}).populate('cart');

    res.render('cart',{user:req.user,cart:user.cart});
  }
  catch(err){
    console.log(err);
    res.sendStatus(500);
  }
});

//Delete an item from cart
app.delete("/cart",isLoggedOutRedirect,async(req,res,next)=>{
  try {
    const userDocument = await User.findOne({ username: req.user.username });
    //The id of the product that we want to delete
    const targetId = req.body.productId;
    const targetIdIndex = userDocument.cart.indexOf(targetId);
    userDocument.cart.splice(targetIdIndex,1);
    await userDocument.save();
    res.redirect("/cart");
  } 
  catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
 }
);

//Buy items in the cart - THIS DOESN'T REALLY WORK BECAUSE THIS IS A DEMO
app.post("/cart",async (req,res,next)=>{
  try{

  const name = req.body.name;
  const cardNumber = req.body.cardNumber;
  const CVC = req.body.CVC;
  const expiryDate = req.body.expiryDate;

  //REFACTOR CODE MAKE IT MORE DRY 
  if (!name || !cardNumber || !CVC || !expiryDate){
    res.render('cart',{user:req.user, cart:user.cart,status: 'fail',message: 'You are missing some information!'})

  }
  const user = await User.findOne({username:req.user.username});
  user.cart = [];
  await user.save()
  res.render('cart',{ user: req.user, cart:user.cart,status: 'success',message: 'You just bought everything!'})
  }
  catch(err){
  console.error(err)
  res.render('cart',{user: req.user ,cart:user.cart,status: 'fail',message: 'Something went wrong!'})
}
 })
app.listen(process.env.PORT, () => {
  console.log("listening");
});

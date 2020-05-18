const jwt = require("jsonwebtoken");
const Product = require("./models/product");
const User = require("./models/user");

const checkUser = (req, res, next) => {

  //Check if the request has come with a token.
  const userToken = req.cookies.tkn;

  //If there is a token, it means that the user is logged in.
  if (userToken) {
    //populate the user field in the request object to indicate that there is a logged in user.
    req.user = jwt.verify(userToken, process.env.SECRET);
  }
  next();
};

const renderRoot = async (req, res, next) => {

  try {

    //Find all products in the database
    const products = await Product.find();

    const viewParams= { products, user: req.user };


    //Build view params
    //If the user was just redirected after adding an item to the cart
    if (req.justAddedStatus){
      //Add the status to the viewParams Object
      viewParams.status = req.justAddedStatus;
      //If the item was added succsfully
      if (viewParams.status==="success"){
        viewParams.message = `${req.justAddedName} was added successfully!`;
      }
      else{
        viewParams.message = 'Something went wrong while adding that item!';
      }
    }

    return res.render("index", viewParams);
  }
  
  //If something went wrong
   catch (err) {
    console.error(err.message);
    console.error(err);
    res.sendStatus(500);
  }

};


// Redirect you to the root if you are logged in
const isLoggedInRedirect = (req, res, next) => {
  if (req.user) {
    return res.redirect("/");
    
  }
  next();
};

// Redirects you to the login page if you are not logged in 
const isLoggedOutRedirect = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};

const addToCart = async (req, res, next) => {

  try {

    const userDocument = await User.findOne({ username: req.user.username });

    const productId = req.body.productId;

    //Confirm a product with that Id is indeed in our database
    const product = await Product.findById(productId);

    //If there is then we push it to the user cart
    if (product) {
      userDocument.cart.push(productId);
      await userDocument.save();
      req.justAddedStatus = 'success';
      req.justAddedName = product.name;
      return next();
    } 
    else {
      req.justAddedStatus = 'fail';
      return next();
    }
  } catch (err) {
    console.log(err);
    req.justAddedStatus=  'fail';
    return next();
  }
}


module.exports = {
  renderRoot,
  checkUser,
  isLoggedInRedirect,
  isLoggedOutRedirect,
  addToCart
};

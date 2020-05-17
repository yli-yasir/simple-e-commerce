const jwt = require("jsonwebtoken");
const Product = require("./models/product");
const User = require("./models/user");


const checkUser = (req, res, next) => {
  const userToken = req.cookies.tkn;

  if (userToken) {
    req.user = jwt.verify(userToken, process.env.SECRET);
  }
  next();
};

const isLoggedInRedirect = (req, res, next) => {
  if (req.user) {
    return res.redirect("/");
    
  }
  next();
};

const isLoggedOutRedirect = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};


module.exports = {
  checkUser,
  isLoggedInRedirect,
  isLoggedOutRedirect,
};

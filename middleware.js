const jwt = require('jsonwebtoken');

const checkToken = (req,res,next)=>{
    const userToken = req.cookies.tkn;
    
    if (userToken){
    req.user = jwt.verify(userToken,process.env.SECRET);
    }
    next();
  
  };

const isLoggedInRedirect = (req,res,next)=>{
    if (req.user){
        res.redirect('/');
    }
    next();
}

const isLoggedOutRedirect = (req,res,next)=>{
    if (!req.user){
        res.redirect('/login');
    }
    next();
}

module.exports = {checkToken,isLoggedInRedirect,isLoggedOutRedirect};
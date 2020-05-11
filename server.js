const express = require("express");
const app = express();
const mongoose = require("mongoose");
const productModel = require("./models/product");

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

app.get("/", async (req, res, next) => {
  try {
    const products = await productModel.find();
    res.render("index",{products}); 
  } 
  catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT, () => {
  console.log("listening");
});

"use strict";

var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;
var productSchema = new mongoose.Schema({
  name: String,
  description: String,
  img: String,
  price: Number
});
module.exports = mongoose.model('product', productSchema);
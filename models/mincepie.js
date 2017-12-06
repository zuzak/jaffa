var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  purchaseLocation: String,
  name: String,
  numberInPack: Number,
  priceForPack: Number,
  sampleIdentifier: {type: String, index: {unique: true}},
  description: String,
  image: String,
  vegetarian: Boolean,
  containsAlcohol: Boolean
})

module.exports = mongoose.model('Sample', schema)
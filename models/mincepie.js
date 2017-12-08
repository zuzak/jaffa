var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  purchaseLocation: String,
  brand: String,
  description: String,
  flavourText: String,
  numberPerPack: Number,
  pricePerPack: Number,
  isVegetarian: Boolean,
  isVegan: Boolean,
  hasAlcohol: Boolean,
  isStandard: Boolean,
  sampleIdentifier: String
})

module.exports = mongoose.model('MincePie', schema)

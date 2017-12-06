var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  purchaseLocation: String,
  brand: String,
  description: String,
    numberPerPack: Number,
    pricePerPack: Number,
    isVegetarian: Boolean,
    hasAlcohol: Boolean,
    isStandard: Boolean
})

module.exports = mongoose.model('MincePie', schema)
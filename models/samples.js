var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  brand: String,
  price: Number,
  pricePer: Number,
  sampleIdentifier: {type: String, index: {unique: true}},
  allergens: Array,
  mayContain: Array,
  description: String,
  image: String,
  vegetarian: Boolean
})

module.exports = mongoose.model('Sample', schema)

var mongoose = require('mongoose')
var shuffle = require('array-shuffle')

var schema = new mongoose.Schema({
  sampleIdentifier: String,
  user: String,

  orange: Number,
  chocolate: Number,
  sponge: Number,
  overall: Number,

  price: Number,
  isMcvities: Boolean,
  wouldBuy: Boolean
})

module.exports = mongoose.model('Score', schema)

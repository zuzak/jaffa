var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  sampleIdentifier: String,
  orange: Number,
  chocolate: Number,
  sponge: Number,
  overall: Number,
  price: Number,
  mcVities: Boolean,
  wouldBuy: Boolean
})

module.exports = mongoose.Model('Review', schema)

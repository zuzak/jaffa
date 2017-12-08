var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  sampleIdentifier: String,
  user: String,

  pastry: Number,
  filling: Number,
  overall: Number,

  price: Number,
  comment: String,
  wouldBuy: Boolean
})

module.exports = mongoose.model('PieScore', schema)

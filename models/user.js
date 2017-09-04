var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  user: String,
  promised: Boolean,
  lockedOut: Boolean
})

module.exports = mongoose.model('User', schema)

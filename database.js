var mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/jaffa', {server: {auto_reconnect: true}})

var db = module.exports = mongoose.connection

db.on('error', function (err) {
  throw err
})

db.once('open', function () {
  require('./models/samples.js')
})
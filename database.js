var mongoose = require('mongoose')
var app = require('./server.js')

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/jaffa', {server: {auto_reconnect: true}})

var db = module.exports = mongoose.connection

db.on('error', function (err) {
  throw err
})

db.once('open', function () {
  require('./models/samples.js')
  require('./models/user.js')
})

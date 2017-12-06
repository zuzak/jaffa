var app = require('..')
var exec = require('child_process').exec
var fs = require('fs')

// load a fortune :)
app.get('/add-a-pie', function (req, res, next) {
  return res.render('mc-addnew.pug')
})

app.post('/add-a-pie', function (req, res, next) {

})
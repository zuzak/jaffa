var app = require('../server.js')
var Sample = require('../models/samples')
var exec = require('child_process').exec
var fs = require('fs')

app.get('/sample/:sample', function (req, res, next) {
  Sample.find({sampleIdentifier: req.params.sample}, function (err, sample) {
    if (err) return next(err)
    res.render('sample.pug', {sample: sample[0]})
  })
})
app.get('/sample/:sample/info', function (req, res, next) {
  Sample.find({sampleIdentifier: req.params.sample}, function (err, sample) {
    if (err) return next(err)
    res.render('sample-info.pug', {sample: sample[0]})
  })
})
app.get('/results', function (req, res) {
  res.status(501).render('placeholder.pug')
})

app.get('/', function (req, res) {
  Sample.find({}, function (err, samples) {
    if (err) return next(err)
    try {
      res.render('home.pug', {samples})
    } catch (e) {
      if (e.code === 'ENOENT') {
        return res.render('home.pug', {req})
      }
      throw e
    }
  })
})

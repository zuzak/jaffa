var app = require('../server.js')
var Sample = require('../models/samples')
var Score = require('../models/score')
var exec = require('child_process').exec
var fs = require('fs')

app.get('/sample/:sample', function (req, res, next) {
  Sample.find({sampleIdentifier: req.params.sample}, function (err, sample) {
    if (err) return next(err)
    Score.find({sampleIdentifier: req.params.sample, user: req.sessionID}, function (err, prevAns) {
      if (err) return next(err)
      if (prevAns.length > 0) {
        res.render('sample.pug', {sample: sample[0], prev: prevAns[0]})
      } else {
        res.render('sample.pug', {sample: sample[0], prev: {}})
      }
    })
  })
})

app.post('/sample/:sample', function (req, res, next) {
  Score.update({
    sampleIdentifier: req.params.sample,
    user: req.sessionID
  }, req.body, {upsert: true}, function (err, update) {
    if (err) return next(err)
    res.json(update)
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

app.get('/', function (req, res, next) {
  console.log('a', req.sessionID)
  Score.count({}, function (err, count) {
    if (err) return next(err)
    Score.find({user: req.sessionID}, function (err, rawScores) {
      if (err) next(err)
      console.log('b', rawScores)
      var scores = {}
      for (var i = 0; i < rawScores.length; i++) {
        console.log('c', i)
        var curr = rawScores[i]
        console.log(curr)
        scores[curr.sampleIdentifier] = curr
      }
      Sample.find({}, function (err, samples) {
        if (err) return next(err)
        res.render('home.pug', {samples, scores, count})
      })
    })
  })
})

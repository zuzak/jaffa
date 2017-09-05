var app = require('../server.js')
var Sample = require('../models/samples')
var Score = require('../models/score')
var User = require('../models/user')
var exec = require('child_process').exec
var fs = require('fs')
var json2csv = require('json2csv')

app.get('/count.json', function (req, res) {
  Score.count({}, function (err, count) {
    res.json(count)
  })
})

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
  User.find({user: req.sessionID, lockedOut: true}, function (err, response) {
    if (err) return next(err)
    if (response.length > 0) return res.status(403).render('403.pug')
    Score.update({
      sampleIdentifier: req.params.sample.toUpperCase(),
      user: req.sessionID
    }, req.body, {upsert: true}, function (err, update) {
      if (err) return next(err)
      res.redirect('/')
    })
  })
})
app.get('/sample/:sample/info', function (req, res, next) {
  User.find({user: req.sessionID, lockedOut: true}, function (err, response) {
    if (err) return next(err)
    if (response.length === 0) return res.status(403).render('403.pug')
    Sample.find({sampleIdentifier: req.params.sample.toUpperCase()}, function (err, sample) {
      if (err) return next(err)
      Score.find({sampleIdentifier: req.params.sample.toUpperCase()}, function (err, scores) {
        if (err) return next(err)
        res.render('sample-info.pug', {sample: sample[0], scores})
      })
    })
  })
})
app.get('/sample/:sample/votes.json', function (req, res, next) {
  User.find({user: req.sessionID, lockedOut: true}, function (err, response) {
    if (err) return next(err)
    if (response.length === 0) return res.status(403).render('403.pug')
    Score.find({sampleIdentifier: req.params.sample.toUpperCase()}, function (err, scores) {
      if (err) return next(err)
      for (var i = 0; i < scores.length; i++) {
        scores[i]._id = null
        scores[i].user = null

        // these don't work?
        delete scores[i]._id
        delete scores[i].user
      }
      return res.json(scores)
    })
  })
})
// app.get('/results', function (req, res) {
//   res.status(501).render('placeholder.pug')
// })

app.post('/', function (req, res, next) {
  if (req.body.promise) {
    User.update({user: req.sessionID}, {promised: req.body.promise === 'promise'}, {upsert: true}, function (err, result) {
      console.log(err, result)
      if (err) {
        next(err)
      } else {
        res.redirect('/')
      }
    })
  } else {
    res.redirect('/')
  }
})
app.get('/', function (req, res, next) {
  User.find({user: req.sessionID}, function (err, result) {
    if (err) return next(err)
    if (result.length > 0 && result[0].promised === true) return next()
    res.render('promise.pug')
  })
})
app.get('/', function (req, res, next) {
  User.find({user: req.sessionID, lockedOut: true}, function (err, response) {
    if (err) return next(err)
    if (response.length > 0) return res.redirect('/results')
    return next()
  })
})


app.get('/', function (req, res, next) {
  Score.count({}, function (err, count) {
    if (err) return next(err)
    Score.find({user: req.sessionID}, function (err, rawScores) {
      if (err) next(err)
      var scores = {}
      for (var i = 0; i < rawScores.length; i++) {
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
app.post('/lockout', function (req, res, next) {
  User.update({user: req.sessionID}, {lockedOut: true}, function (err, response) {
    if (err) return next(err)
    res.redirect('/results')
  })
})
app.get('/results', function (req, res, next) {
  User.find({user: req.sessionID, lockedOut: true}, function (err, response) {
    if (err) return next(err)
    if (response.length === 0) return res.redirect('/')
    Sample.find(function (err, samples) {
      if (err) return next(err)
      Score.aggregate([{
        $group: {
          _id: '$sampleIdentifier',
          orange: { $avg: '$orange' },
          chocolate: { $avg: '$chocolate' },
          sponge: { $avg: '$sponge' },
          overall: { $avg: '$overall' },
          price: { $avg: '$price' }
        }
      }], function (err, scores) {
        if (err) return next(err)
        var aggrScores = {}
        for (var i = 0; i < scores.length; i++) {
          aggrScores[scores[i]._id] = scores[i]
        }

        Score.find({user: req.sessionID}, function (err, userScores1) {
          console.log(err, userScores1)
          if (err) return next(err)
          var userScores = {}
          for (var i = 0; i < userScores1.length; i++) {
            userScores[userScores1[i].sampleIdentifier] = userScores1[i]
          }
          res.render('results.pug', {samples, aggrScores, userScores})
        })
      })
    })
  })
})
app.get('/results.csv', function (req, res, next) {
  User.find({user: req.sessionID, lockedOut: true}, function (err, response) {
    if (err) return next(err)
    if (response.length === 0) return res.status(403).render('403.pug')
    Score.find(function (err, scores) {
      if (err) return next(err)
      var csv = []
      csv.push(['sample', 'orange', 'chocolate', 'sponge', 'overall', 'perceivedPrice', 'isMcvities', 'wouldBuy'].join(','))
      for (var i = 0; i < scores.length; i++) {
        var c = scores[i]
        csv.push([
          c.sampleIdentifier,
          c.orange,
          c.chocolate,
          c.overall,
          c.price,
          c.isMcvities,
          c.wouldBuy
        ].join(','))
      }
      res.type('text/csv')
      return res.send(csv.join('\n'))
    })
  })
})

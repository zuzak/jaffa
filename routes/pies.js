var app = require('..')
var MincePie = require('../models/mincepie.js')
var Score = require('../models/piescore')
var shuffle = require('array-shuffle')
var User = require('../models/user')
var sortKeys = require('sort-keys')

app.all('*', function (req, res, next) {
  MincePie.find({sampleIdentifier: {$exists: true}}, function (err, samples) {
    if (err) return next(err)
    res.locals.votingOpen = samples.length > 0
    next()
  })
})

// load a fortune :)
app.get('/add-a-pie', function (req, res, next) {
  if (res.locals.votingOpen) {
    res.status(403).render('403.pug')
  }
  return res.render('mc-addnew.pug')
})

app.post('/add-a-pie', function (req, res, next) {
  if (res.locals.votingOpen) {
    res.status(403).render('403.pug')
  }
  console.log('aa', req.body)
  if (req.body.isVegetarian === 'null') req.body.isVegetarian = null
  if (req.body.isVegetarian === 'vegan') {
    req.body.isVegan = true
    req.body.isVegetarian = true
  } else {
    req.body.isVegan = false
  }
  MincePie.update({
    brand: req.body.brand,
    purchaseLocation: req.body.purchaseLocation
  }, {
    brand: req.body.brand,
    purchaseLocation: req.body.purchaseLocation,
    flavourText: req.body.flavourText,
    description: req.body.description,
    numberPerPack: req.body.numberPerPack,
    pricePerPack: req.body.pricePerPack,
    isVegan: req.body.isVegan,
    isVegetarian: req.body.isVegetarian,
    hasAlcohol: req.body.hasAlcohol,
    isStandard: req.body.isStandard
  },
    {
      upsert: true
    },
    function (err, samples) {
      console.log(err, samples)
      if (err) return next(err)
      return res.render('mc-sample-submitted.pug', {duplicate: false})
    })
})

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
    var insults = [
      'plonker',
      'spoilsport',
      'twit',
      'scrub',
      'spoilsport',
      'prat',
      'numpty',
      'muppet',
      ''
    ]
    res.locals.insult = insults[Math.floor(Math.random() * insults.length)]
    res.render('promise.pug')
  })
})
app.get('/', function (req, res, next) {
  if (!res.locals.votingOpen) {
    return next()
  }
  User.find({user: req.sessionID, lockedOut: true}, function (err, response) {
    if (err) return next(err)
    if (response.length > 0) return res.redirect('/results')
    return next()
  })
})

app.get('/', function (req, res, next) {
  if (!res.locals.votingOpen) {
    return next()
  }
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
      MincePie.find({}, function (err, samples) {
        samples.sort(function (a, b) {
          if (a.sampleIdentifier < b.sampleIdentifier) {
            return -1
          }
          return 1
        })
        res.render('mc-voting.pug', {samples, scores, count})
      })
    })
  })
})

app.get('/', function (req, res, next) {
    // submission
  if (res.locals.votingOpen) {
    next()
  }
  MincePie.find({}, function (err, samples) {
    console.log(err, samples)
    if (err) return next(err)
    res.render('sample-entrysplash.pug', {samples})
  })
})

app.post('/lockout', function (req, res, next) {
  User.update({user: req.sessionID}, {lockedOut: true}, {upsert: true}, function (err, response) {
    if (err) return next(err)
    res.redirect('/results')
  })
})

app.post('/check-for-duplicate', function (req, res, next) {
  if (res.locals.votingOpen) {
    res.status(403).render('403.pug')
  }
  if (req.body.duplicate === 'true') {
    return res.render('mc-sample-submitted.pug', {duplicate: true})
  } else if (req.body.duplicate === 'false') {
    return res.redirect('/add-a-pie')
  }
  return res.redirect('/check-for-duplicate')
})
app.get('/check-for-duplicate', function (req, res, next) {
  if (res.locals.votingOpen) {
    res.status(403).render('403.pug')
  }
  MincePie.find({}, function (err, samples) {
    if (err) return next(err)
    if (samples.length === 0) return res.redirect('/add-a-pie')
    res.render('mc-interstitial.pug', {samples})
  })
})

app.post('/close-submissions', function (req, res, next) {
  if (res.locals.votingOpen) {
    res.status(403).render('403.pug')
  }
  MincePie.find({isStandard: true}, function (err, pies) {
    if (err) return next(err)
    if (pies.length > 26) throw new RangeError('help i ran out of letters')
    pies = shuffle(pies)
    for (var i = 0; i < pies.length; i++) {
      var pie = pies[i]
      delete pie.sampleIdentifier
      MincePie.update(pie, {
        sampleIdentifier: String.fromCharCode(65 + i) // 64 == 'A'
      }, {upsert: true},
            function (err) {
              if (err) return next(err)
              console.log('b')
            })
    }
    return res.redirect('/sample-admin')
  })
  MincePie.find({isStandard: false}, function (err, pies) {
    if (err) return next(err)
    if (pies.length > 26) throw new RangeError('help i ran out of letters again')
    pies = shuffle(pies)
    for (var i = 0; i < pies.length; i++) {
      var pie = pies[i]
      delete pie.sampleIdentifier
      console.log('c')
      MincePie.update(pie, {
        sampleIdentifier: String.fromCharCode(945 + i) // 945 == 'α'
      }, {upsert: true},
                function (err) {
                  if (err) return next(err)
                })
    }
  })
})

app.get('/close-submissions', function (req, res, next) {
  res.render('close-submissions.pug')
})

app.get('/sample-admin', function (req, res, next) {
  MincePie.find({}, function (err, samples) {
    if (err) return next(err)
    res.render('sample-admin.pug', {samples})
  })
})

app.get('/sample-admin/:id', function (req, res, next) {
  MincePie.find({_id: req.params.id}, function (err, response) {
    console.log(err, response)
    if (response === undefined) return next()
    if (response.count > 1) throw new Error('duplicates')
    res.render('sample-admin-detail.pug', {sample: response[0]})
  })
})

app.get('/vote/:sample', function (req, res, next) {
  MincePie.find({sampleIdentifier: req.params.sample}, function (err, sample) {
    if (err) return next(err)
    Score.find({sampleIdentifier: req.params.sample, user: req.sessionID}, function (err, prevAns) {
      if (err) return next(err)
      if (prevAns.length > 0) {
        res.render('mc-votingpage.pug', {sample: sample[0], prev: prevAns[0]})
      } else {
        res.render('mc-votingpage.pug', {sample: sample[0], prev: {}})
      }
    })
  })
})

app.post('/vote/:sample', function (req, res, next) {
  User.find({user: req.sessionID, lockedOut: true}, function (err, response) {
    if (err) return next(err)
    if (response.length > 0) return res.status(403).render('403.pug')
    Score.update({
      sampleIdentifier: req.params.sample,
      user: req.sessionID
    }, req.body, {upsert: true}, function (err, update) {
      if (err) return next(err)
      res.redirect('/')
    })
  })
})

app.get('/results', function (req, res, next) {
  User.find({user: req.sessionID, lockedOut: true}, function (err, response) {
    if (err) return next(err)
        // if (response.length === 0) return res.redirect('/')
    MincePie.find(function (err, samples) {
      samples = sortKeys(samples)
      if (err) return next(err)
      Score.aggregate([{
        $group: {
          _id: '$sampleIdentifier',
          pastry: { $avg: '$pastry' },
          filling: { $avg: '$filling' },
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
          res.render('mc-results.pug', {samples, aggrScores, userScores})
        })
      })
    })
  })
})

app.get('/sample/:sample', function (req, res, next) {
  User.find({user: req.sessionID, lockedOut: true}, function (err, response) {
    if (err) return next(err)
    if (response.length === 0) return res.status(403).render('403.pug')
    MincePie.find({sampleIdentifier: req.params.sample}, function (err, sample) {
      if (sample.length !== 1) return next()
      sample = sample[0]
      if (err) return next(err)
      Score.find({sampleIdentifier: sample.sampleIdentifier}, function (err, scores) {
        if (err) return next(err)
        Score.aggregate([{
          $group: {
            _id: '$sampleIdentifier',
            pastry: { $avg: '$pastry' },
            filling: { $avg: '$filling' },
            overall: { $avg: '$overall' },
            price: { $avg: '$price' }
          }
        }], function (err, avgscores) {
          if (err) return next(err)
          console.log(avgscores)
          var avgscore // FIXME
          for (var i = 0; i < avgscores.length; i++) {
            if (avgscores[i]._id === sample.sampleIdentifier) {
              avgscore = avgscores[i]
              break
            }
          }
          if (err) return next(err)
          Score.find({user: req.sessionID, sampleIdentifier: req.params.sample}, function (err, userScore) {
            if (err) return next(err)
            res.render('mc-results-info.pug', {sample, avgscore, userScore, scores})
          })
        })
      })
    })
  })
})

/***
 * Bigboard stats aggregation :)
 */
app.get('/bigboard', function (req, res, next) {
  Score.count({}, function (err, count) {
    if (err) return next(err)
    res.locals.voteCount = count
    next()
  })
})

app.get('/bigboard', function (req, res, next) {
  User.count({}, function (err, count) {
    if (err) return next(err)
    res.locals.userCount = count
    next()
  })
})

app.get('/bigboard', function (req, res, next) {
  User.count({lockedOut: true}, function (err, count) {
    if (err) return next(err)
    res.locals.lockedOutCount = count
    next()
  })
})

app.get('/bigboard', function (req, res, next) {
  MincePie.find({}, function (err, samples) {
    if (err) return next(err)
    var pies = {}
    for (var i = 0; i < samples.length; i++) {
      pies[samples[i].sampleIdentifier] = samples[i]
    }
    res.locals.samples = pies
    next()
  })
})

app.get('/bigboard', function (req, res, next) {
  Score.aggregate([{
    $group: {
      _id: '$sampleIdentifier',
      pastry: { $avg: '$pastry' },
      filling: { $avg: '$filling' },
      overall: { $avg: '$overall' },
      price: { $avg: '$price' }
    }
  }], function (err, scores) {
    var maxPastry = 0
    var maxFilling = 0
    var maxOverall = 0
    var maxAll = 0
    var minAll = Infinity
    for (var i = 0; i < scores.length; i++) {
      var curr = scores[i]
      if (maxPastry < curr.pastry) {
        maxPastry = curr.pastry
        res.locals.secondBestPastry = res.locals.bestPastry
        res.locals.bestPastry = curr._id
      }
      if (maxFilling < curr.filling) {
        maxFilling = curr.filling
        res.locals.secondBestBilling = res.locals.bestFilling
        res.locals.bestFilling = curr._id
      }
      if (maxOverall < curr.overall) {
        maxOverall = curr.overall
        res.locals.secondBestOverall = res.locals.bestOverall
        res.locals.bestOverall = curr._id
      }
      var currMax = curr.overall + curr.filling + curr.pastry
      if (maxAll < currMax) {
        maxAll = currMax
        res.locals.secondBestInShow = res.locals.bestInShow
        res.locals.bestInShow = curr._id
      }
      if (minAll > currMax) {
        minAll = currMax
        res.locals.secondWorstInShow = res.locals.worstInShow
        res.locals.worstInShow = curr._id
      }
    }
    // res.locals.json = count
    next()
  })
})

app.get('/bigboard', function (req, res, next) {
  res.render('bigboard.pug')
})

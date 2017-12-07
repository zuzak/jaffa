var app = require('..')
var MincePie = require('../models/mincepie.js')
var shuffle = require('array-shuffle')

app.all('*', function (req, res, next) {
    MincePie.find({sampleIdentifier: {$exists: true}}, function (err, samples) {
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


app.get('/', function (req, res, next) {
    if (!res.locals.votingOpen) {
        return next()
    }
  MincePie.find({}, function (err, samples) {
      console.log(err, samples)
      if (err) return next(err)
      res.render('mc-voting.pug', {samples})
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
        if (pies.length > 26) throw new RangeError("help i ran out of letters")
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
        if (pies.length > 26) throw new RangeError("help i ran out of letters again")
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
        //Score.find({sampleIdentifier: req.params.sample, user: req.sessionID}, function (err, prevAns) {
        //    if (err) return next(err)
        //    if (prevAns.length > 0) {
        //        res.render('mc-votingpage.pug', {sample: sample[0], prev: prevAns[0]})
        //    } else {
                res.render('mc-votingpage.pug', {sample: sample[0], prev: {}})
        //    }
        //})
    })
})

app.post('/vote/:sample', function (req, res, next) {
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
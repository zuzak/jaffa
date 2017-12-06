var app = require('..')
var MincePie = require('../models/mincepie.js')

// load a fortune :)
app.get('/add-a-pie', function (req, res, next) {
  return res.render('mc-addnew.pug')
})


app.post('/add-a-pie', function (req, res, next) {
  console.log('aa', req.body)
    MincePie.update({
        brand: req.body.brand,
        purchaseLocation: req.body.purchaseLocation
    }, {
      brand: req.body.brand,
        purchaseLocation: req.body.purchaseLocation,
        description: req.body.description,
        numberPerPack: req.body.numberPerPack,
        pricePerPack: req.body.pricePerPack,
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
  MincePie.find({}, function (err, samples) {
      console.log(err, samples)
      if (err) return next(err)
      res.render('sample-entrysplash.pug', {samples})
  })
})

app.post('/check-for-duplicate', function (req, res, next) {
    if (req.body.duplicate === 'true') {
        return res.render('mc-sample-submitted.pug', {duplicate: true})
    } else if (req.body.duplicate === 'false') {
        return res.redirect('/add-a-pie')
    }
    return res.redirect('/check-for-duplicate')

})
app.get('/check-for-duplicate', function (req, res, next) {
    MincePie.find({}, function (err, samples) {
        if (err) return next(err)
        res.render('mc-interstitial.pug', {samples})
    })
})
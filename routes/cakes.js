var app = require('../server.js')
var Sample = require('../models/samples')
app.get('/sample/:sample', function (req, res, next) {
  Sample.find({sampleIdentifier: req.params.sample}, function (err, sample) {
    if (err) return next(err)
    res.render('sample.pug', {sample: sample[0]})
  })

})
app.get('/results', function (req, res) {
  res.status(501).render('placeholder.pug')
})
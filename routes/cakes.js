var app = require('../server.js')
app.get('/sample/:sample', function (req, res) {
  res.render('sample.pug', {sample: req.params.sample})
})
app.get('/results', function (req, res) {
  res.status(501).render('placeholder.pug')
})
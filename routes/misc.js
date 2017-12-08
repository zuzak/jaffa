var app = require('..')
var exec = require('child_process').exec
var fs = require('fs')

app.use(function (req, res, next) {
    res.locals.dnt = req.get('DNT')
    res.locals.user = req.user
    next()
})

// load a fortune :)
app.get('/', function (req, res, next) {
  exec('fortune -s -n60', function (err, stdout, stderr) {
    if (err) {
      console.log(err)
      stdout = 'Helo'
    }
    try {
      res.locals.fortune = stdout
      next()
    } catch (e) {
      if (e.code === 'ENOENT') {
        fs.mkdirSync('data')
      }
    }
  })
})



var app = require('..')
var exec = require('child_process').exec
var fs = require('fs')


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

var express = require('express')
var path = require('path') // core
var sass = require('node-sass-middleware')
var app = module.exports = express()

var session = require('express-session')

app.set('view engine', 'pug')
app.set('json spaces', 2)
app.locals.pretty = true

/* Static & SCSS setup */
app.use(sass({
  src: path.join(__dirname, 'public'),
  includePaths: [
    path.join(__dirname, 'node_modules', 'govuk_frontend_toolkit', 'stylesheets'),
    path.join(__dirname, 'node_modules', 'govuk-elements-sass', 'public', 'sass')
  ]
}))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', express.static(path.join(__dirname, 'node_modules', 'govuk_frontend_toolkit', 'images')))

app.use(require('body-parser')())

var sessionOptions = {
  cookie: {
    expires: new Date().setDate(new Date().getFullYear() +1),
    name: 'jaffa.sid'
  }
}
sessionOptions.secret = process.env.SECRET || 'SY7cWepPeY8Bvbtz'
if (process.env.NODE_ENV === 'production') {
  sessionOptions.cookie.secure = true
  if (sessionOptions.secret === 'SY7cWepPeY8Bvbtz') {
    throw new Error("Set SECRET environment variable in production!")
  }
}

app.use(session(sessionOptions))
require('./routes')
require('./database')

app.listen(process.env.PORT || 3000)

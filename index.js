let express = require('express')
let morgan = require('morgan')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let passport = require('passport')
let nodeifyit = require('nodeifyit')
let flash = require('connect-flash')
let mongoose = require('mongoose')
let passportMiddleware = require('./middleware/passport')
let routes = require('./routes')
require('songbird')

const PORT = process.env.PORT || 8000

let app = express()
app.passport = passport

app.use(cookieParser('ilovethenodejs'))            
// Get POST/PUT body information (e.g., from html forms like login)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash())

app.use(session({
  secret: 'ilovethenodejs',
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge : 10000}
}))

app.use(passport.initialize())

app.use(passport.session())

app.set('view engine', 'ejs')

passportMiddleware(app)
routes(app)

mongoose.connect('mongodb://127.0.0.1:27017/blogger')

app.listen(PORT, ()=> console.log(`Listening @ http://127.0.0.1:${PORT}`))


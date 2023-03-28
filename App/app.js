const express = require('express')
const path = require('path')
require('dotenv').config() // we will be using config variables to hide our keys and secrets
const app = express()
const bodyParser = require('body-parser')
// this is the logger that we will be using in our app
const MONGO_URI = process.env.MONGO_URI


const logger = require('./logs/logger')

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  const flash = require('connect-flash');
  app.use(flash())


  // creating session
const session = require('express-session')
const mongoSession = require('connect-mongodb-session')(session)
const Store = new mongoSession({
    uri: MONGO_URI,
    collection: 'session'
})
app.use(session({
    secret: process.env.SESSION_SECRET, // always make sure this key is a good and strong string
    resave: false, // this is to prevent the session from being saved in the database everytime we reload the page 
    saveUninitialized: false,
    store: Store,

}))

//make sure that you use the csrf middleware after the session middleware
const csrf = require('csurf')
const csrfProtection = csrf()

app.use(csrfProtection)

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken(); //this is a global middleware which will add a csrf token to all the response
  next();
  //now for every req rendered these two field will be included
})

//adding the bootstrap middlewares will be building new UI using entirely bootstrap
app.use('/css', express.static(path.join('_dirname', 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join('_dirname', 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join('_dirname', 'node_modules/jquery/dist')))
app.set('view engine', 'ejs');
app.set('views', 'views');

const mongoose = require('mongoose')

const user_route = require('./router/user_routes')
const general_route = require('./router/general_routes')
app.use(user_route)
app.use(general_route)
mongoose.set({strictQuery:false})
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(user => {
        logger.log({level:'info',message:'connnected to the mongodb server sucessfully! and listening on port:4000'})
        app.listen(4000)
    })
    .catch(err => logger.log({level:'error',message:err}))




  
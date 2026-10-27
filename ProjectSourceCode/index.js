// ************************************************
// Dependencies
// ************************************************
const express = require('express');
const session = require('express-session');
const handlebars = require('express-handlebars');
const pgPromise = require('pg-promise')();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set');
}

// ************************************************
// Express instance configuration
// ************************************************
const app = express();

app.use(session({
  secret : process.env.SESSION_SECRET,
  saveUninitialized : false,
  resave : false,
  cookie : {
    httpOnly : true,
    sameSite : 'lax',
    secure : process.env.NODE_ENVJ === 'production',
    maxAge : 1000 * 60 * 60 * 24
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

const hbs = handlebars.create({
  extname : 'hbs',
  layoutsDir : __dirname + '/views/layouts',
  partialsDir : __dirname + '/views/partials',
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use('/resources', express.static(path.join(__dirname, 'resources')));

app.use((req, res) ==.{
  res.locals.currentUser = req.session.user || null;
  next();
});

// ************************************************
// Database configuration
// ************************************************
const dbConfig = {
  host : 'db',
  port : 5432,
  database : process.env.POSTGRES_DB,
  user : process.env.POSTGRES_USER,
  password : process.env.POSTGRES_PASSWORD
};

const db = pgPromise(dbConfig);

db.connect()
    .then(obj => {
      console.log('Database connection success');
      obj.done();
    })
    .catch(error => { console.log('ERROR:', error.message || error); });

// ************************************************
// Helpers
// ************************************************
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function sendError(res, message, error) {
  if (error instanceof HttpError) {
    res.status(error.status).json({message : error.message});
    return;
  }
  console.error(error);
  res.status(500).json({message, error : error.message});
}

const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

function redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user)
    return res.redirect('/home');
  next();
};

// ************************************************
// Static routes serving user-facing content
// ************************************************
app.get('/', (req, res) => { res.redirect('/home'); });

app.get('/login', redirectIfAuthenticated,
        (req, res) => { res.render('pages/login'); });

app.get('/register', redirectIfAuthenticated,
        (req, res) => { res.render('pages/register'); });

// ************************************************
// Functional routes handling user interaction, etc.
// ************************************************
app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  try {
  } catch (error) {
    sendError(res, 'Error logging in', error);
  }
});

app.post('/register', async (req, res) => {
  const {username, password} = req.body;
  try {
  } catch (error) {
    sendError(res, 'Error registering', error);
  }
});

app.get('/home', async (req, res) => { res.render('pages/home'); });

// ************************************************
// Fallback handlers
// ************************************************
app.use((req, res) => {
  res.status(404).render('pages/404', {tab_name : 'Not Found'});
});

// ************************************************
// Run application
// ************************************************
app.listen(3000);
console.log('Application listening on port 3000');

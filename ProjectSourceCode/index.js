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

const DbUtils = require('./dbUtils');
const booksApi = require('./booksApi');

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
    secure : process.env.NODE_ENV === 'production',
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

app.use((req, res, next) => {
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

// Use a valid bcrypt hash used to keep failed unknown-user logins take roughly
// as long as failed known-user logins.
const DUMMY_PASSWORD_HASH =
    '$2b$12$h.u/94uDQMrUqdhp03GU8O6Zf0aHTAwWLDH/5wqp8tFVZsCkB8NCq';

function sendError(res, error, options = {}) {
  if (res.headersSent) {
    console.error(error);
    return;
  }
  const {
    fallbackMessage = 'Something went wrong',
    view = 'pages/error',
    tabName = 'Error'
  } = options;
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof HttpError ? error.message : fallbackMessage;
  if (!(error instanceof HttpError))
    console.error(error);
  res.status(status).render(
      view, {status : status, error : message, tab_name : tabName});
}

const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user)
    return res.redirect('/home');
  next();
};

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate(error => (error ? reject(error) : resolve()));
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save(error => (error ? reject(error) : resolve()));
  });
}

const dbUtils = new DbUtils(db);

// ************************************************
// Static routes serving user-facing content
// ************************************************
app.get('/', (req, res) => { res.redirect('/home'); });

app.get('/login', redirectIfAuthenticated,
        (req, res) => { res.render('pages/login', {tab_name : 'Login'}); });

app.get(
    '/register', redirectIfAuthenticated,
    (req, res) => { res.render('pages/register', {tab_name : 'Register'}); });

// ************************************************
// Functional routes handling user interaction, etc.
// ************************************************
app.post('/login', async (req, res, next) => {
  try {
    const {username, password} = req.body ?? {};

    if (typeof username !== 'string' || typeof password !== 'string')
      throw new HttpError(400, 'Username and password are required.');

    const normalisedUsername = username.trim();

    if (!normalisedUsername || !password || normalisedUsername.length > 32 ||
        Buffer.byteLength(password, 'utf8') > 72)
      throw new HttpError(400, 'Invalid username or password.');

    const user = await dbUtils.getUserByUsername(normalisedUsername);

    const passwordHash = user ? user.passwordhash : DUMMY_PASSWORD_HASH;
    const passwordMatch = await bcrypt.compare(password, passwordHash);

    if (!user || !passwordMatch)
      throw new HttpError(401, 'Invalid username or password.');

    await regenerateSession(req);
    req.session.user = {userId : user.userid, username : user.username};
    await saveSession(req);

    res.redirect('/home');
  } catch (error) {
    if (error instanceof HttpError)
      return sendError(res, error, {view : 'pages/login', tabName : 'Login'});
    next(error);
  }
});

app.post('/register', async (req, res, next) => {});

app.post('/logout', auth, (req, res, next) => {
  req.session.destroy((error) => {
    if (error)
      return next(error);
    res.clearCookie('connect.sid');
    res.locals.currentUser = null;
    res.render('pages/logout', {tab_name : 'Logged out'});
  });
});

app.get('/home', async (req, res) => { res.render('pages/home'); });

app.get('/search', async (req, res, next) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if(!query)
      return res.render('pages/search', {tab_name : 'Search'});

    const {books, totalItems} = await booksApi.searchBooks(query);
    res.render('pages/search',
      {tab_name : 'Search', query : query, books : books, totalItems : totalItems});
  } catch (error) {
    next(error);
  }
});

app.get('/books/:id', async (req, res, next) => {
  try {
    const bookId = req.params.id;
    if (!/^[A-Za-z0-9_-]{1,20}$/.test(bookId))
      throw new HttpError(404, 'Book not found.');

    const book = await booksApi.getBookById(bookId);
    if (!book)
      throw new HttpError(404, 'Book not found.');

    if (book.publishYear)
      await dbUtils.saveBook(book);

    res.render('pages/book', {tab_name : book.title, book : book});
  } catch (error) {
    next(error);
  }
})

// ************************************************
// Fallback handlers
// ************************************************
app.use((req, res) => {
  res.status(404).render('pages/404', {tab_name : 'Not Found'});
});

app.use((error, req, res, next) => {
  if (res.headersSent)
    return next(error);
  sendError(res, error);
});

// ************************************************
// Run application
// ************************************************
app.listen(3000);
console.log('Application listening on port 3000');

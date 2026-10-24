// Pull in dependencies
const express = require('express');
const session = require('express-session');
const handlebars = require('express-handlebars');
const pgPromise = require('pg-promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

// Setup Express instance
const app = express();

app.use(session({
  secret : process.env.SESSION_SECRET,
  saveUninitialized : false,
  resave : false
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

// Setup database instance
const dbConfig = {
  host : 'db',
  port : 5432,
  database : process.env.POSTGRES_DB,
  user : process.env.POSTGRES_USER,
  password : process.env.POSTGRES_PASSWORD
};

const db = pgp(dbConfig);

db.connect()
    .then(obj => {
      console.log('Database connection success');
      obj.done();
    })
    .catch(error => { console.log('ERROR:', error.message || error); });

// Set application to listen (run indefinitely)
app.listen(3000);
console.log('Application listening on port 3000');

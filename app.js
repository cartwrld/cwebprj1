const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs');
const passport = require('passport');
const session = require('express-session');
const SQLite = require('better-sqlite3');
const SQLiteStore = require('better-sqlite3-session-store')(session);
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv').config();
const sessOptions = {
  secret: 'gotta catch em all',
  name: 'session-id',
  resave: false,
  saveUninitialized: false,
  cookie: {httpOnly: false, maxAge: 1000 * 60 * 60},
  unset: 'destroy',
  store: new SQLiteStore({
    client: new SQLite('poke.db', {verbose: console.log}),
    expired: {clear: true, intervals: 1000 * 60 * 15},
  }),
};

const homeRouter = require('./routes');
const usersRouter = require('./routes/users');
const pokeBuilderRouter = require('./routes/pokebuilder');
const teamBuilderRouter = require('./routes/teambuilder');
const loginRouter = require('./routes/login');
const recentActivityRouter = require('./routes/recentactivity');

const app = express();

app.set('utils', path.join(__dirname, 'utils'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
hbs.registerHelper('equals', (opt1, opt2) => opt1 === opt2);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.use(session(sessOptions));
app.use(passport.initialize({userProperty: 'currentUser'}));

app.use('/home', homeRouter);
app.use('/users', usersRouter);
app.use('/teambuilder', teamBuilderRouter);
app.use('/pokebuilder', pokeBuilderRouter);
app.use('/', loginRouter);
app.use('/recentactivity', recentActivityRouter);

app.use('/bw', express.static(__dirname + '/node_modules/bootswatch/dist'));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  done(null, id);
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/google/callback', // Change this callback URL to match your setup
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  scope: ['profile'],
},
function(accessToken, refreshToken, profile, cb) {
  if (profile.id) {
    return cb(null, profile);
  }
  return cb();
},
));

app.get('/auth', passport.authenticate('google', {scope: ['profile']}));

app.get('/google/callback', // Change this route to match your setup
    passport.authenticate('google', {failureRedirect: '/login'}),
    function(req, res) {
    // Successful authentication, redirect to success.
      res.redirect('/home');
    });

app.get('/login', (req, res) => {
  res.render('login'); // Create a login view for this route
});

// app.get('/success', (req, res) => {
//   res.render('success'); // Create a success view for this route
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

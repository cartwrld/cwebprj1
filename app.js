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

const dotenv = require('dotenv').config();

const GoogleStrategy = require('passport-google-oidc');


const sessOptions = {
  secret: 'gotta catch em all',
  name: 'google-session-id',
  resave: false,
  saveUninitialized: false,
  cookie: {httpOnly: false, maxAge: 1000 * 60 * 60},
  unset: 'destroy',
  store: new SQLiteStore({
    client: new SQLite('poke.db', {verbose: console.log}),
    expired: {clear: true, intervals: 1000 * 60 * 15},
  }),
};

const homeRouter = require('./routes/');
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

// Serialization
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  done(null, id);
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/powerpoke/signin', // Change this callback URL to match your setup
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  scope: ['profile', 'email'],
},
(accessToken, refreshToken, profile, cb) => {
  if (profile.id) {
    return cb(null, profile);
  }
  return cb();
}));

// Middleware to ensure authentication
function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.session.redirectTo = req.originalUrl; // Store the original URL before the login process
    res.redirect('/auth'); // Redirect to the login process (which is the start of the Google authentication in your setup)
  }
}

// Protected Routes (just a few examples, apply as needed)
app.use('/home', checkAuthentication, homeRouter);
app.use('/users', checkAuthentication, usersRouter);
app.use('/teambuilder', checkAuthentication, teamBuilderRouter);
app.use('/pokebuilder', checkAuthentication, pokeBuilderRouter);
app.use('/recentactivity', checkAuthentication, recentActivityRouter);

// Unprotected Routes
app.use('/', loginRouter);

// Google Auth Routes
app.get('/auth', passport.authenticate('google', {scope: ['profile', 'email']}));
app.get('/powerpoke/signin',
    passport.authenticate('google', {failureRedirect: '/'}),
    function(req, res) {
      const redirectURL = req.session.redirectTo || '/home'; // Use the stored URL or default to home
      delete req.session.redirectTo; // Clear the stored URL
      res.redirect(redirectURL);
    },
);
// app.get('/login', (req, res) => {
//   res.render('login');
// });

// Static Routes
app.use('/bw', express.static(__dirname + '/node_modules/bootswatch/dist'));

// Error Handling
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

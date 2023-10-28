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


// const bodyParser = require('body-parser');
// const ejs = require('ejs');
const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const dotenv = require('dotenv').config();


const sessOptions = {
  secret: 'gotta catch em all', // must be the same secret that cookieParser is using
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


const homeRouter = require('./routes/home');
const usersRouter = require('./routes/users');
const pokeBuilderRouter = require('./routes/pokebuilder');
const teamBuilderRouter = require('./routes/teambuilder');
const loginRouter = require('./routes/login');
const recentActivityRouter = require('./routes/recentactivity');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// registering the views/partials folder to keep track of components (navbar, pokecard, etc)
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
// registering a helper to use with the select > option element
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
app.use('/teambuilder', teamBuilderRouter); // This is what determines the path name
app.use('/pokebuilder', pokeBuilderRouter); // This is what determines the path name
app.use('/', loginRouter); // This is what determines the path name
app.use('/recentactivity', recentActivityRouter); // This is what determines the path name

app.use('/bw', express.static(__dirname + '/node_modules/bootswatch/dist'));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

const userSchema = new mongoose.Schema({
  googleId: String,
});

userSchema.plugin(findOrCreate);

// eslint-disable-next-line new-cap
const User = new mongoose.model('User', userSchema);
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/home',
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  User.findOrCreate({googleId: profile.id}, function(err, user) {
    return cb(err, user);
  });
},
));

app.get('/auth', passport.authenticate('google', {scope: ['profile']}));

app.get('/callback/url/',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function(req, res) {
    // Successful authentication, redirect to success.
      res.redirect('/success');
    });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

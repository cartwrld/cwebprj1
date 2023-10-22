
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs');

const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
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

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/teambuilder', teamBuilderRouter); // This is what determines the path name
app.use('/pokebuilder', pokeBuilderRouter); // This is what determines the path name
app.use('/login', loginRouter); // This is what determines the path name
app.use('/recentactivity', recentActivityRouter); // This is what determines the path name

app.use('/bw', express.static(__dirname + '/node_modules/bootswatch/dist'));


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

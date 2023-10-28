const express = require('express');
const router = express.Router();
const PowerPoke = require('../public/javascripts/PowerPoke.js');
const pp = new PowerPoke();

const fs = require('fs');

const jwt = require('jsonwebtoken');

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromUrlQueryParameter('access_token'),
    ExtractJwt.fromBodyField('access_token'),
  ]),
  secretOrKey: fs.readFileSync('es256public.pem'),
  algorithm: 'ES256',
},
(payload, done) => {
  if (!['pokeuser'].includes(payload.role)) {
    return done(null, false, {message: 'Specified role is not allowed'});
  }

  if (!['dashboard', 'profile', 'booking'].includes(payload.scope)) {
    return done(null, false, {message: 'Specified scope is not allowed'});
  }
  return done(null, payload);
}));


/**
 * Handles GET requests for the '/' (root) endpoint.
 * This function fetches 8 random Pokémon and prepares them for display,
 * then renders them on the homepage.
 *
 * @route GET /
 * @returns {void} Renders the 'index' view with 8 random Pokémon.
 */
router.get('/', async function(req, res, next) {
  const err = {};
  if (req.query.err) {
    err.auth = req.query.err;
  }
  res.render('login', {
    title: 'Sign In',
  });
});

router.post('/', (req, res, next) => {
  if (req.body.teambuilder) {

  }
  const payload = determineAccess(req);
  if (payload.scope) {
    const token = encodeJWT(payload);
    res.redirect(`/home`);
  } else {
    res.render('secure-login', {
      title: 'POST LOGIN FORM',
      isSubmitted: true,
      err: {email: 'Email is not recognized', pwd: 'Password is not recognized'},
      submittedEmail: req.body.email, // actual posted value
      submittedPassword: req.body.pwd, // actual posted value
    });
  }
});

const myHandler = (req, res, next) => {
  const scope = req.path.replace(/^\/+|\/+$/g, '');
  let title;
  title = scope.toUpperCase();
  let action;
  let token;
  if (req.body['access_token']) {
    token = req.body['access_token'];
    title = 'POST ' + scope.toUpperCase();
  } else if (req.query['access_token']) {
    token = req.query['access_token'];
    action = req.baseUrl + req.path;
  }

  const decodedPayload = checkJWT(token, scope);
  if (decodedPayload.redirect) {
    res.redirect(decodedPayload.redirect);
  } else {
    res.render('secure-generic', {
      title,
      payload: decodedPayload,
      token,
      action,
    });
  }
};

router.get(['/home', '/pokebuilder', '/teambuilder'], myHandler);
router.post(['/home', '/pokebuilder', '/teambuilder'], myHandler);

// GET PASSPORT Handler for http://localhost:3000/secure/passport
router.get('/passport', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/?err=jwt+not+verified',
}),
(req, res, next) => {
  // exclude clients from accessing this page
  if (!['admin', 'employee'].includes(req.currentUser.role)) {
    res.redirect('/secure/?err=insufficient+permissions');
  } else {
    res.render('secure-generic', {
      title: 'GET - PASSPORT',
      token: req.query['access_token'],
      payload: req.currentUser,
      action: req.baseUrl + req.path,
    });
  }
});

router.post('/passport', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/secure/?err=jwt+not+verified',
}),
(req, res, next) => {
  // exclude clients from accessing this page
  if (!['admin', 'employee'].includes(req.currentUser.role)) {
    res.redirect('/secure/?err=insufficient+permissions');
  } else {
    res.render('secure-generic', {
      title: 'POST - PASSPORT',
      token: req.body['access_token'],
      payload: req.currentUser,
    });
  }
});


const encodeJWT = (payload) => {
  // const token = jwt.sign(payload, secret, {algorithm: 'HS256'});
  const privateKey = fs.readFileSync('es256private.key');
  const token = jwt.sign(payload, privateKey, {algorithm: 'ES256', expiresIn: '30s'});
  return token;
};

const checkJWT = (token, scope) => {
  let decoded;
  try {
    // decoded = jwt.verify(token, secret, {algorithm: 'HS256'});
    const cert = fs.readFileSync('es256public.pem');
    decoded = jwt.verify(token, cert, {algorithm: 'ES256'});

    if (!decoded.role || decoded.role != 'admin') {
      if (!decoded.scope || decoded.scope != scope) {
        throw new Error('You do not have access to the page you requested - Log in again');
      }
    }
  } catch (err) {
    console.log(`JWT Error:\n ${err}`);
    // use this time to make an error URL to redirect the user back to login page with error
    decoded = {redirect: '/secure/?err=' + err.message};
  }
  return decoded;
};

// normally we would check a database but we don't have one so we are just hard coding
const determineAccess = (req) => {
  const payload = {role: null, scope: null};
  if (req.body.password === 'p!K4ch0o') {
    switch (req.body.username.toLowerCase()) {
      case 'AshKetchum':
        payload.role = 'pokeuser';
        payload.scope = 'dashboard';
        break;
      default:
            // do nothing
    }
  }
  return payload;
};


module.exports = router;


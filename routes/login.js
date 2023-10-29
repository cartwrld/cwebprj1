const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback',
  passReqToCallback: true,
},
function(accessToken, refreshToken, profile, cb) {
  if (profile.id) {
    return cb(null, profile);
  }
  return cb();
},
));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  done(null, id);
});


// const express = require('express');
// const router = express.Router();
// const PowerPoke = require('../public/javascripts/PowerPoke.js');
// const pp = new PowerPoke();
// const passport = require('passport');
//
// /**
//  * Handles GET requests for the '/' (root) endpoint.
//  * This function fetches 8 random Pokémon and prepares them for display,
//  * then renders them on the homepage.
//  *
//  * @route GET /
//  * @returns {void} Renders the 'index' view with 8 random Pokémon.
//  */
// router.get('/', async function(req, res, next) {
//   const err = {};
//   if (req.query.err) {
//     err.auth = req.query.err;
//   }
//   res.render('login', {
//     title: 'Sign In',
//   });
// });
//
// router.get('/teambuilder', passport.authenticate('google', {
//   session: false,
//   failureRedirect: '/?err=jwt+not+verified',
// },
// (req, res, next) => {
//   // exclude clients from accessing this page
//   if (!['pokeuser'].includes(req.currentUser.role)) {
//     res.redirect('/secure/?err=insufficient+permissions');
//   } else {
//     res.render('secure-generic', {
//       title: 'POST - PASSPORT',
//       token: req.body['access_token'],
//       payload: req.currentUser,
//     });
//   }
// }));
//
//
// module.exports = router;
//

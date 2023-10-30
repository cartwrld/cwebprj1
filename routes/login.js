const express = require('express');
const router = express.Router();
const PowerPoke = require('../utils/PowerPoke.js');
const pp = new PowerPoke();
const passport = require('passport');

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


// router.get(['/home', '/pokebuilder', '/teambuilder'], myHandler);
// router.post(['/home', '/pokebuilder', '/teambuilder'], myHandler);


module.exports = router;


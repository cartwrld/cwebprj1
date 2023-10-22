const express = require('express');
const router = express.Router();
const PowerPoke = require('../public/javascripts/PowerPoke.js');
const pp = new PowerPoke();


/**
 * Handles GET requests for the '/' (root) endpoint.
 * This function fetches 8 random Pokémon and prepares them for display,
 * then renders them on the homepage.
 *
 * @route GET /
 * @returns {void} Renders the 'index' view with 8 random Pokémon.
 */
router.get('/', async function(req, res, next) {
  res.render('recentactivity', {

  });
});

module.exports = router;


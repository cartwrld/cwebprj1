const express = require('express');
const router = express.Router();
const PowerPoke = require('../utils/PowerPoke.js');
const pp = new PowerPoke();

let displayPokes;

/**
 * Generates a list of 8 random Pokémon to be displayed on the homepage.
 *
 * This function first retrieves base data about Pokémon from a random generation.
 * Then, it creates an array of 8 random Pokémon from that generation to display
 * on the homepage.
 *
 * @return {Promise<Array>} An array of 8 random Pokémon from a random generation.
 */
async function generate8RandomHomePagePokemon() {
  // get base data about Pokemon from a random gen
  const randGenData = await pp.getPokemonByGeneration(null);
  let randPokeList;

  const randomHomePokes = async () => {
    // create an array of 8 random Pokemon to display on the homepage
    randPokeList = await pp.get8RandomPokeURLFromInitialFetch(randGenData);
    return randPokeList;
  };

  return randomHomePokes();
}


/**
 * Handles GET requests for the '/' (root) endpoint.
 * This function fetches 8 random Pokémon and prepares them for display,
 * then renders them on the homepage.
 *
 * @route GET /
 * @returns {void} Renders the 'homepage' view with 8 random Pokémon.
 */
router.get('/', async function(req, res, next) {
  const rand8Pokes = await generate8RandomHomePagePokemon();
  displayPokes = await pp.outputFilteredPokes(rand8Pokes);

  res.render('home', {
    cards: displayPokes,
    homepage: true,
  });
});

module.exports = router;


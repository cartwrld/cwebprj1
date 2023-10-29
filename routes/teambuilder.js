const express = require('express');
const router = express.Router();
const PowerPoke = require('../utils/PowerPoke');
const passport = require('passport');
const pp = new PowerPoke();

const POKE_TYPES = ['', 'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
const BANNED_CHARS = [[':', ';', '*', '/', '\\', '?', '"', '<', '>', '|', '&', '%', '$', '@', '`', '^', '[', ']', '{', '}', '(', ')', '_', '=', '+', '~']];

const onlyMsgErrorFormatter = ({location, msg, param, value, nestedErrors}) => {
  return msg; // just return the string - this is not an object
};

const {body, validationResult, query} = require('express-validator');

let displayPokes;
let pokeTeam = []; // Used to track the pokemon added to a team
let pokeTeamIDs = []; // Used to track the ids of pokemon in a team
let sessActions = [];


/**
 * Fetches and returns the first 20 Pokemon sorted by ID from the first generation.
 *
 * @return {Promise<Pokemon[]>} - A promise that resolves to an array of the first 20 Pokemon from the first generation.
 */
async function genFirst20PokeForTeamOptions() {
  const genList = await pp.getPokemonByGeneration(1);

  let first20;
  const gen20PokesForTeamOptions = async () => {
    first20 = await pp.getFirst20PokeObjFromGenFetch(genList);
    return first20;
  };
  return gen20PokesForTeamOptions();
}


/**
 * Fetches and returns a Pokemon based on the provided ID.
 *
 * @param {string} id - The ID of the Pokemon to fetch.
 * @return {Promise<Pokemon>} - A promise that resolves to the Pokemon with the matching ID.
 */
async function whosThatPokemon(id) {
  const ID = id;

  let nextPokemon;

  const genNextPokemon = async () => {
    nextPokemon = await pp.fetchByNameOrID(ID);
    return nextPokemon;
  };
  return genNextPokemon();
}


/**
 * Handles the GET requests for the '/teambuilder/' endpoint.
 * The function fetches a list of Pokémon based on optional query parameters
 * for type and generation and then renders them on the teambuilder page.
 *
 * @route GET /teambuilder/
 * @returns {void} Renders the 'teambuilder' view with the list of filtered Pokémon.
 */
// router.get('/', passport.authenticate('google', {
//   // Options and callback function (if needed) go here
//
// }), [
//   query('searchType1')
//       .if(query('searchType1').exists())
//       .isIn(POKE_TYPES)
//       .withMessage('Invalid PokeType - Nice try!'),
//   query('searchType2')
//       .if(query('searchType2').exists())
//       .isIn(POKE_TYPES)
//       .withMessage('Invalid PokeType - Nice try!'),
//   query('searchGen')
//       .if(query('searchGen').exists())
//       .isIn(['', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
//       .withMessage('Invalid Generation - Nice try!'),
// ], async function(req, res, next) {
//   if (!['pokeuser'].includes(req.currentUser.role)) {
//     res.redirect('/?err=insufficient+permissions');
//   } else {
//     const violations = validationResult(req);
//     const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();
//
//     if (violations.isEmpty()) {
//       const poke20List = await genFirst20PokeForTeamOptions();
//       displayPokes = await pp.outputFilteredPokes(poke20List);
//     }
//
//     res.render('teambuilder', {
//       sbmtNameID: req.query.searchNameID,
//       sbmtType1: req.query.searchType1,
//       sbmtType2: req.query.searchType2,
//       sbmtGen: req.query.searchGen,
//
//       teambuilder: true,
//       cards: displayPokes,
//       pokeTeam: pokeTeam,
//       err: errorMessages,
//     });
//   }
// });


/**
 * Handles POST requests for the '/team' endpoint.
 * This function manages the addition of Pokémon to the team based on the Pokémon's ID passed in the request body.
 * It ensures that a team doesn't exceed 6 Pokémon and renders the updated team on the 'teambuilder' page.
 *
 * @route POST /teambuilder/team
 * @returns {void} Renders the 'teambuilder' view with the updated Pokémon team.
 */
router.post('/team', async function(req, res, next) {
  // Reset the pokeTeam array to be empty, it will be rebuilt later
  pokeTeam = [];
  // Only add to a team if there are fewer than 6 Pokemon already in there
  if (pokeTeamIDs.length <= 5) {
    pokeTeamIDs.push({
      // Getting the value of the button that was pressed, each button's value is equal to the associated Pokemon's ID
      id: req.body.addToTeam,
    });
  }
  // For each ID collected, we're going to make a pokemon
  for (const pokeid of pokeTeamIDs) {
    const newPokemon = await whosThatPokemon(parseInt(pokeid.id, 10));
    pokeTeam.push(newPokemon); // Then we add each pokemon to the team
  }

  // Before we can render the Pokemon, they have to be formatted correctly first
  pokeTeam = await pp.outputFilteredPokes(pokeTeam);

  sessActions = req.session.Actions;
  const JSONAction = createSessionAction('User added a pokemon to their team', 'Team Builder');
  sessActions.unshift(JSONAction);
  sessActions = sessActions.slice(0, 4);
  req.session.Actions = sessActions;

  res.render('teambuilder', {
    cards: displayPokes,
    pokeTeam: pokeTeam,
  });
});


/**
 * Handles POST requests for the '/clear' endpoint.
 * This function resets the Pokémon team, clearing all previously added Pokémon,
 * and then renders the empty team on the 'teambuilder' page.
 *
 * @route POST /teambuilder/clear
 * @returns {void} Renders the 'teambuilder' view with an empty Pokémon team.
 */
router.post('/clear', async function(req, res, next) {
  pokeTeam = []; // Setting the pokeTeam to be null
  pokeTeamIDs = []; // And the ID array as well

  sessActions = req.session.Actions;
  const JSONAction = createSessionAction('User cleared their team', 'Team Builder');
  sessActions.unshift(JSONAction);
  sessActions = sessActions.slice(0, 4);
  req.session.Actions = sessActions;

  console.log(req.session.Actions);

  res.render('teambuilder', {
    cards: displayPokes,
    pokeTeam: pokeTeam,
  });
});

/**
 * Handles POST requests for the '/filters' endpoint.
 * Validates the filters (Pokémon type and generation) provided in the request body
 * and applies them to fetch and display a filtered list of Pokémon.
 * Renders the 'teambuilder' page with the results, handling cases with validation errors
 * or when no Pokémon match the filters.
 *
 * @returns {void} Renders the 'teambuilder' view with Pokémon filtered based on provided criteria.
 */
router.post('/filters',
    [
      body('searchType1')
          .isIn(POKE_TYPES)
          .withMessage('Invalid PokeType - Nice try!'),
      body('searchType2')
          .isIn(POKE_TYPES)
          .withMessage('Invalid PokeType - Nice try!'),
      body('searchGen')
          .isIn(['', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
          .withMessage('Invalid Generation - Nice try!'),
    ],
    async (req, res, next) => {
    // console.log(`name: ${req.body.searchNameID}\ntype1: ${req.body.searchType1}\ntype2: ${req.body.searchType2}\ngen:${req.body.searchGen}`);
      const violations = validationResult(req);
      const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();
      let filteredPokes = [];

      console.log('POST - violations:');
      console.log(violations);

      if (violations.isEmpty()) {
        filteredPokes = await pp.handleFiltersApply(
            req.body.searchNameID, req.body.searchType1, req.body.searchType2, req.body.searchGen);
        displayPokes = await pp.outputFilteredPokes(filteredPokes);
      }

      sessActions = req.session.Actions;
      const JSONAction = createSessionAction('User searched for Pokemon', 'Team Builder');
      sessActions.unshift(JSONAction);
      sessActions = sessActions.slice(0, 4);
      req.session.Actions = sessActions;

      console.log(req.session.Actions);

      res.render('teambuilder', {
        sbmtNameID: req.body.searchNameID,
        sbmtType1: req.body.searchType1,
        sbmtType2: req.body.searchType2,
        sbmtGen: req.body.searchGen,

        filtersSubmitted: true,

        cards: displayPokes,
        empty: filteredPokes.length < 1,
        pokeTeam: pokeTeam, // In each post, the team has to be rendered again
        filterSuccess: Object.keys(errorMessages).length <= 0,
        err: errorMessages,
      });
    });

function createSessionAction(sessionAction, page) {
  const currentDateTime = new Date();

  const hours = currentDateTime.getHours() % 12;
  const minutes = currentDateTime.getMinutes();
  const seconds = currentDateTime.getSeconds();
  const amPM = currentDateTime.getHours() < 12 ? 'AM' : 'PM';

  const year = currentDateTime.getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[currentDateTime.getMonth()];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[currentDateTime.getDay()];
  const day = currentDateTime.getDate();

  JSONAction = {
    action: sessionAction,
    page: page,
    time: hours + ':' + minutes + ':' + seconds + ' ' + amPM,
    date: dayOfWeek + ', ' + month + ', ' + day + ', ' + year,
  };

  return JSONAction;
}

module.exports = router;



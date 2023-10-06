const express = require('express');
const router = express.Router();
const PowerPoke = require('../public/javascripts/PowerPoke');
const pp = new PowerPoke();

let displayPokes;
let pokeTeam = []; // Used to track the pokemon added to a team
let pokeTeamIDs = []; // Used to track the ids of pokemon in a team

/**
 * Returns the first 20 Pokemon, sorted by ID
 * @return {Promise<Awaited<Pokemon>[]|*[]>}
 */
async function genFirst20PokeForTeamOptions() {
  const genList = await pp.getPokemonByGeneration(1);

  let first20;
  const gen20PokesForTeamOptions = async () => {
    first20 = await pp.getFirst20PokeURLFromGenFetch(genList);
    return first20;
  };
  return gen20PokesForTeamOptions();
}

/**
 * Returns a single Pokemon when passed in an ID value. The
 * Pokemon who's ID matches the passed in values will be the one returned
 * @param id
 * @return {Promise<Pokemon>}
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

async function addNext20PokesToList() {
  const next20List = await pp.getNext20Pokes(displayPokes.length);

  let next20;
  const gen20PokesForTeamOptions = async () => {
    next20 = await pp.getFirst20PokeURLFromGenFetch(next20List);
    return next20;
  };
  return gen20PokesForTeamOptions();
}

/**
 * Outputs a json object that is formatted only to contain relevant
 * information to this project.
 * @param pokeList
 * @return {Promise<*[]>}
 */
const outputFilteredPokes = async (pokeList) => {
  const pokeInfoList = [];
  for (const [, poke] of Object.entries(pokeList)) {
    pokeInfoList.push({
      pokename: pp.formatPokeName(poke.name),
      pokeid: poke.id,
      pokesprite: poke.sprite,
      poketype1: pp.capitalizeFirstLetterOfType(poke.type1),
      poketype2: pp.capitalizeFirstLetterOfType(poke?.type2),
      multitype: poke.type2 !== undefined,
    });
  }
  return pokeInfoList;
};

// http://localhost:3000/pokedex/
/* GET home page. */
router.get('/', async function(req, res, next) {
  const poke20List = await genFirst20PokeForTeamOptions();
  displayPokes = await pp.outputFilteredPokes(poke20List);
  console.log('++++++++++++');
  // console.log(displayPokes);
  console.log('++++++++++++');
  res.render('teambuilder', {
    sbmtNameID: req.query.searchNameID, // submitted searchNameID from post
    sbmtType1: req.query.searchType1, // submitted searchType1 from post
    sbmtType2: req.query.searchType2, // submitted searchType2 from post
    sbmtGen: req.query.searchGen, // submitted searchGen from post

    teambuilder: true,
    cards: displayPokes,

    pokeTeam: pokeTeam,
  });
});


router.get('/more', async (req, res, next) => {
  const next20Pokes = await addNext20PokesToList();

  const next20Info = await pp.outputFilteredPokes(next20Pokes);
  displayPokes += next20Info;


  console.log('=============');
  // console.log(next20Info);
  // console.log(next20Pokes);
  console.log(displayPokes);
  console.log('=============');

  // for ((let prop in obj)
  // displayPokes.push(next20Info);

  await res.render('teambuilder', {
    teambuilder: true,
    cards: displayPokes,
    pokeTeam: pokeTeam,
  });
});

router.post('/team', async function(req, res, next) {
  pokeTeam = []; // Reset the pokeTeam array to be empty, it will be rebuilt later. It had to be done this way, don't ask me why
  if (pokeTeamIDs.length <= 5) { // Only add to a team if there are fewer than 6 Pokemon already in there
    pokeTeamIDs.push({
      id: req.body.addToTeam, // Getting the value of the button that was pressed, each button's value is equal to the associated Pokemon's ID
    },
    );
  }

  for (const pokeid of pokeTeamIDs) { // For each ID collected, we're going to make a pokemon
    const newPokemon = await whosThatPokemon(parseInt(pokeid.id, 10));
    pokeTeam.push(newPokemon); // Then we add each pokemon to the team
  }

  pokeTeam = await outputFilteredPokes(pokeTeam); // Before we can render the Pokemon, they have to be formatted correctly first

  res.render('teambuilder', {
    cards: displayPokes,
    pokeTeam: pokeTeam,
  });
});

router.post('/clear', async function(req, res, next) {
  pokeTeam = []; // Setting the pokeTeam to be null
  pokeTeamIDs = []; // And the ID array as well
  res.render('teambuilder', {
    cards: displayPokes,
    pokeTeam: pokeTeam,
  });
});

router.post('/filters', async (req, res, next) => {
  console.log(req.body.searchNameID, req.body.searchType1, req.body.searchType2, req.body.searchGen);

  const filteredPokes = await pp.handleFiltersApply(
      req.body.searchNameID, req.body.searchType1, req.body.searchType2, req.body.searchGen);
  displayPokes = await pp.outputFilteredPokes(filteredPokes);

  await res.render('teambuilder', {
    sbmtNameID: req.body.searchNameID, // submitted searchNameID from post
    sbmtType1: req.body.searchType1, // submitted searchType1 from post
    sbmtType2: req.body.searchType2, // submitted searchType2 from post
    sbmtGen: req.body.searchGen, // submitted searchGen from post

    filtersSubmitted: true,

    cards: displayPokes,
    empty: filteredPokes.length < 1,
    pokeTeam: pokeTeam, // In each post, the team has to be rendered again
  });
});

module.exports = router;



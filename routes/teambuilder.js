const express = require('express');
const router = express.Router();
const PowerPoke = require('../public/javascripts/PowerPoke');

const pp = new PowerPoke();
let displayPokes;


async function genFirst20PokeForTeamOptions() {
  const genList = await pp.getPokemonByGeneration(1);

  let first20;
  const gen20PokesForTeamOptions = async () => {
    first20 = await pp.getFirst20PokeURLFromGenFetch(genList);
    return first20;
  };
  return gen20PokesForTeamOptions();
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
  displayPokes = await outputFilteredPokes(poke20List);
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

  });
});


router.get('/more', async (req, res, next) => {
  const next20Pokes = await addNext20PokesToList();

  const next20Info = await outputFilteredPokes(next20Pokes);
  displayPokes += next20Info;


  console.log('=============');
  // console.log(next20Info);
  // console.log(next20Pokes);
  console.log(displayPokes);
  console.log('=============');

  for ((let prop in obj)
  // displayPokes.push(next20Info);

  await res.render('teambuilder', {
    teambuilder: true,
    cards: displayPokes,

  });
});


router.post('/filters', async (req, res, next) => {
  console.log(req.body.searchNameID, req.body.searchType1, req.body.searchType2, req.body.searchGen);

  const filteredPokes = await pp.handleFiltersApply(
      req.body.searchNameID, req.body.searchType1, req.body.searchType2, req.body.searchGen);
  displayPokes = await outputFilteredPokes(filteredPokes);

  await res.render('teambuilder', {
    sbmtNameID: req.body.searchNameID, // submitted searchNameID from post
    sbmtType1: req.body.searchType1, // submitted searchType1 from post
    sbmtType2: req.body.searchType2, // submitted searchType2 from post
    sbmtGen: req.body.searchGen, // submitted searchGen from post

    filtersSubmitted: true,

    cards: displayPokes,
    empty: filteredPokes.length < 1,
  });
});

module.exports = router;



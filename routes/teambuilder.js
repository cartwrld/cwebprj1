const express = require('express');
const router = express.Router();
const PowerPoke = require('../public/javascripts/PowerPoke');

const pp = new PowerPoke();

let displayPokes;
let output20PokeInfo;

// const createPokeObjCollection = async () => {
//   return await pp.genPokeObjCollection();
// };
// const pokeCollection = createPokeObjCollection();
async function genFirst20PokeForTeamOptions() {
  const initList = await pp.getPokemonByGeneration(1);
  let first20;
  const gen20PokesForTeamOptions = async () => {
    first20 = await pp.getFirst20PokeURLFromInitFetch(initList);
    return first20;
  };
  return gen20PokesForTeamOptions();
}

// routername = pokedex, line 9 in app.js
// http://localhost:3000/pokedex/
/* GET home page. */
router.get('/', async function(req, res, next) {
  const poke20List = await genFirst20PokeForTeamOptions();
  displayPokes = [];
  output20PokeInfo = async () => {
    for (const [, poke] of Object.entries(poke20List)) {
      displayPokes.push({
        pokename: pp.formatPokeName(poke.name),
        pokeid: poke.id,
        pokesprite: poke.sprite,
        poketype1: pp.capitalizeFirstLetterOfNameOrType(poke.type1),
        poketype2: pp.capitalizeFirstLetterOfNameOrType(poke?.type2),
        multitype: poke.type2 !== undefined,
      });
    }
  };

  await output20PokeInfo();
  // console.log(poke20List);

  res.render('teambuilder', {
    sbmtNameID: req.query.searchNameID, // submitted searchNameID from post
    sbmtType1: req.query.searchType1, // submitted searchType1 from post
    sbmtType2: req.query.searchType2, // submitted searchType2 from post
    sbmtGen: req.query.searchGen, // submitted searchGen from post

    teambuilder: true,
    cards: displayPokes,
  });
});

router.post('/filters', async (req, res, next) => {
  console.log(req.body.searchNameID, req.body.searchType1, req.body.searchType2, req.body.searchGen);

  const filteredPokes = await pp.handleFiltersApply(
      req.body.searchNameID, req.body.searchType1, req.body.searchType2, req.body.searchGen);
  displayPokes = [];
  console.log(displayPokes);

  outputFilteredPokes = async () => {
    for (const [, poke] of Object.entries(filteredPokes)) {
      displayPokes.push({
        pokename: pp.formatPokeName(poke.name),
        pokeid: poke.id,
        pokesprite: poke.sprite,
        poketype1: pp.capitalizeFirstLetterOfNameOrType(poke.type1),
        poketype2: pp.capitalizeFirstLetterOfNameOrType(poke?.type2),
        multitype: poke.type2 !== undefined,
      });
    }
  };

  await outputFilteredPokes();

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


// router.get('/browse', function(req, res, next) {
//   res.render('');
// });


module.exports = router;



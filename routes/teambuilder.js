const express = require('express');
const router = express.Router();
const PowerPoke = require('../public/javascripts/PowerPoke');

const pp = new PowerPoke();


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
  const display20Pokes = [];
  const output20PokeInfo = async () => {
    for (const [, poke] of Object.entries(poke20List)) {
      display20Pokes.push({
        pokename: pp.formatPokeName(poke.name),
        pokeid: poke.id,
        pokesprite: poke.sprite,
        poketype1: pp.capitalizeFirstLetterOfValue(poke.type1),
        poketype2: pp.capitalizeFirstLetterOfValue(poke?.type2),
        multitype: poke.type2 !== undefined,
      });
    }
  };

  await output20PokeInfo();
  // console.log(poke20List);

  res.render('teambuilder', {
    poke20Display: display20Pokes,
    teambuilder: true,

  });
});

router.post('/', (req, res, next) => {

});


// router.get('/browse', function(req, res, next) {
//   res.render('');
// });

module.exports = router;



const express = require('express');
const router = express.Router();
const PowerPoke = require('../public/javascripts/PowerPoke.js');
const pp = new PowerPoke();

let displayPokes;

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


/* GET home page. */
router.get('/', async function(req, res, next) {
  const rand8Pokes = await generate8RandomHomePagePokemon();
  displayPokes = await pp.outputFilteredPokes(rand8Pokes);

  // const outputInfo = async () => {
  //   for (const [, poke] of Object.entries(rand8Pokes)) {
  //     displayPokes.push({
  //       pokename: pp.formatPokeName(poke.name),
  //       pokeid: poke.id,
  //       pokesprite: poke.sprite,
  //       pokegen: poke.gen,
  //       poketype1: pp.capitalizeFirstLetterOfType(poke.type1),
  //       poketype2: pp.capitalizeFirstLetterOfType(poke?.type2),
  //       pokestats: {
  //         pokeHP: poke.hp,
  //         pokeATK: poke.attack,
  //         pokeDEF: poke.defense,
  //         pokeSPATK: poke.specAtk,
  //         pokeSPDEF: poke.specDef,
  //         pokeSPD: poke.speed,
  //       },
  //       multitype: poke.type2 !== undefined,
  //     });
  //   }
  // };

  // await outputInfo();

  res.render('index', {
    cards: displayPokes,
    homepage: true,
  });
});

module.exports = router;


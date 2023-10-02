const express = require('express');
const router = express.Router();

const Pokemon = require('../public/javascripts/Pokemon.js');
const PowerPoke = require('../public/javascripts/PowerPoke.js');
const pp = new PowerPoke();


async function generate10RandomHomePagePokemon() {
  const initList = await pp.getPokemonByGeneration();
  let x;
  const randomHomePokes = async () => {
    x = await pp.get8RandomPokeURLFromInitialFetch(initList);
    return x;
  };
  return randomHomePokes();
}


/* GET home page. */
router.get('/', async function(req, res, next) {
  const displayPokes = [];
  const rand10Pokes = await generate10RandomHomePagePokemon();
  const outputInfo = async () => {
    for (const [, poke] of Object.entries(rand10Pokes)) {
      displayPokes.push({
        pokename: pp.formatPokeName(poke.name),
        pokeid: poke.id,
        pokesprite: poke.sprite,
        pokegen: poke.gen,
        poketype1: pp.capitalizeFirstLetterOfValue(poke.type1),
        poketype2: pp.capitalizeFirstLetterOfValue(poke?.type2),
        pokestats: {
          pokeHP: poke.hp,
          pokeATK: poke.attack,
          pokeDEF: poke.defense,
          pokeSPATK: poke.specAtk,
          pokeSPDEF: poke.specDef,
          pokeSPD: poke.speed,
        },
        multitype: poke.type2 !== undefined,
      });
    }
  };

  await outputInfo();

  res.render('index', {

    path: 'https://www.pngkit.com/png/full/783-7831178_pokeball-pokeball-pixel-png.png',
    cards: displayPokes,
    homepage: true,
  });
});

module.exports = router;


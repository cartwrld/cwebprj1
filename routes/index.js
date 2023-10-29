const express = require('express');
const router = express.Router();
const session = require('express-session');
const PowerPoke = require('../utils/PowerPoke.js');
const pp = new PowerPoke();
require('./login');
const passport = require('passport');
const {query, validationResult} = require('express-validator');

let displayPokes;
const POKE_TYPES = ['', 'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

router.use(session({secret: 'supersecretsessionsecret', resave: false, saveUninitialized: true}));
router.use(passport.initialize());
router.use(passport.session());

router.get('/', (req, res) => {
  res.render('login');
});

router.get('/auth/google',
    passport.authenticate('google', {scope: ['openID', 'email', 'profile']},
    ));

router.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/home',
      failureRedirect: '/auth/google/failure',
    }),
);

router.get('/home', isLoggedIn, async (req, res) => {
  const rand8Pokes = await generate8RandomHomePagePokemon();
  displayPokes = await pp.outputFilteredPokes(rand8Pokes);

  res.render('home', {
    cards: displayPokes,
    homepage: true,
  });
});
router.get('/teambuilder', isLoggedIn, [
  query('searchType1')
      .if(query('searchType1').exists())
      .isIn(POKE_TYPES)
      .withMessage('Invalid PokeType - Nice try!'),
  query('searchType2')
      .if(query('searchType2').exists())
      .isIn(POKE_TYPES)
      .withMessage('Invalid PokeType - Nice try!'),
  query('searchGen')
      .if(query('searchGen').exists())
      .isIn(['', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
      .withMessage('Invalid Generation - Nice try!'),
], async function(req, res, next) {
  if (!['pokeuser'].includes(req.currentUser.role)) {
    res.redirect('/?err=insufficient+permissions');
  } else {
    const violations = validationResult(req);
    const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();

    if (violations.isEmpty()) {
      const poke20List = await genFirst20PokeForTeamOptions();
      displayPokes = await pp.outputFilteredPokes(poke20List);
    }

    res.render('teambuilder', {
      sbmtNameID: req.query.searchNameID,
      sbmtType1: req.query.searchType1,
      sbmtType2: req.query.searchType2,
      sbmtGen: req.query.searchGen,

      teambuilder: true,
      cards: displayPokes,
      pokeTeam: pokeTeam,
      err: errorMessages,
    });
  }
});

router.get('/pokebuilder', isLoggedIn, async (req, res) => {
  const rand8Pokes = await generate8RandomHomePagePokemon();
  displayPokes = await pp.outputFilteredPokes(rand8Pokes);

  res.render('pokebuilder', {
    cards: displayPokes,
    pokebuilder: true,
  });
});
router.get('/recentactivity', isLoggedIn, async (req, res) => {
  const rand8Pokes = await generate8RandomHomePagePokemon();
  displayPokes = await pp.outputFilteredPokes(rand8Pokes);

  res.render('recentactivity', {
    cards: displayPokes,
    recentactivity: true,
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('Goodbye!');
});

router.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

// const myHandler = (req, res, next) => {
//   const scope = req.path.replace(/^\/+|\/+$/g, '');
//   let action;
//     action = req.baseUrl + req.path;
//     res.render('secure-generic', {
//       action,
//     });
// };

// router.get('/home', passport.authenticate('google', {
//   successRedirect: '/home',
//   failureRedirect: '/',
// }), async (req, res, next) => {
//   console.log(req.body);
// });

// const routes = ['/home', '/teambuiler', '/pokebuilder', '/recentactivity'];

// router.get(['/home', '/teambuiler', '/pokebuilder', '/recentactivity'], myHandler);
// router.post(['/home', '/teambuiler', '/pokebuilder', '/recentactivity'], myHandler);
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

module.exports = router;


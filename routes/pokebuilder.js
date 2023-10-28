const express = require('express');
const router = express.Router();

const fs = require('fs');
const multer = require('multer');

const upload = multer({
  dest: 'public/uploads',
});

const {body, query, oneOf, validationResult} = require('express-validator');


const onlyMsgErrorFormatter = ({location, msg, param, value, nestedErrors}) => {
  return msg; // just return the string - this is not an object
};

let sessActions = [];

/**
 * Handles the GET requests for the '/pokebuilder/' endpoint.
 * Validates the query parameters provided in the request such as Pokémon name, type, stats, and description.
 *  * Renders the 'pokebuilder' page, displaying any validation errors, if present.
 *
 * @route GET /pokebuilder/
 * @returns {void} Renders the 'pokebuilder' view with potential query values and any validation errors.
 */
router.get('/',
    [
      query('name')
          .if(query('name').exists())
          .trim().notEmpty().withMessage('PokeName is required').bail()
          .isLength({min: 2, max: 20}).withMessage('Name must have between 2 and 20 letters'),

      query('type1')
          .if(query('type1').exists()).trim()
          .notEmpty().withMessage('You must choose at least 1 PokeType')
          .isIn(['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying',
            'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'])
          .withMessage('Invalid PokeType'),

      query('hp')
          .if(query('hp').exists()).trim()
          .notEmpty().withMessage('HP Stat is required').bail()
          .isNumeric().withMessage('Please enter a number between 1 and 999').bail()
          .isInt({min: 1, max: 999}).withMessage('Please enter a number between 1 and 999'),
      query('atk')
          .if(query('atk').exists()).trim()
          .notEmpty().withMessage('ATK Stat is required').bail()
          .isNumeric().withMessage('Please enter a number between 1 and 999').bail()
          .isInt({min: 1, max: 999}).withMessage('Please enter a number between 1 and 999'),
      query('def')
          .if(query('def').exists()).trim()
          .notEmpty().withMessage('DEF Stat is required').bail()
          .isNumeric().withMessage('Please enter a number between 1 and 999').bail()
          .isInt({min: 1, max: 999}).withMessage('Please enter a number between 1 and 999'),
      query('spatk')
          .if(query('spatk').exists()).trim()
          .notEmpty().withMessage('SP. ATK Stat is required').bail()
          .isNumeric().withMessage('Please enter a number between 1 and 999').bail()
          .isInt({min: 1, max: 999}).withMessage('Please enter a number between 1 and 999'),
      query('spdef')
          .if(query('spdef').exists()).trim()
          .notEmpty().withMessage('SP. DEF Stat is required').bail()
          .isNumeric().withMessage('Please enter a number between 1 and 999').bail()
          .isInt({min: 1, max: 999}).withMessage('Please enter a number between 1 and 999'),
      query('spd')
          .if(query('spd').exists()).trim()
          .notEmpty().withMessage('SPD Stat is required').bail()
          .isNumeric().withMessage('Please enter a number between 1 and 999').bail()
          .isInt({min: 1, max: 999}).withMessage('Please enter a number between 1 and 999'),

      query('desc')
          .if(query('desc').exists()).trim()
          .notEmpty().withMessage('You must enter a description for your Pokemon').bail()
          .isLength({min: 5}).withMessage('Please increase the length of your description to 5 characters or more').bail()
          .isLength({max: 500}).withMessage('Please shorten the length of your description to 500 characters or less'),
    ],
    function(req, res, next) {
      const violations = validationResult(req);
      const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();

      let pokeJSON;
      if (req.cookies.pokeCookie) {
        pokeJSON = JSON.parse(req.cookies.pokeCookie);
      }

      console.log(pokeJSON);

      res.render('pokebuilder', {
        pokebuilder: true,

        sbmtName: req.cookies.pokeCookie ? pokeJSON.name : req.query.name,
        sbmtType1: req.cookies.pokeCookie ? pokeJSON.type1 : req.query.type1,
        sbmtType2: req.cookies.pokeCookie ? pokeJSON.type2 : req.query.type2,
        sbmtHP: req.cookies.pokeCookie ? pokeJSON.HP : req.query.hp,
        sbmtATK: req.cookies.pokeCookie ? pokeJSON.ATK : req.query.atk,
        sbmtDEF: req.cookies.pokeCookie ? pokeJSON.DEF : req.query.def,
        sbmtSPATK: req.cookies.pokeCookie ? pokeJSON.SPATK : req.query.spatk,
        sbmtSPDEF: req.cookies.pokeCookie ? pokeJSON.SPDEF : req.query.spdef,
        sbmtSPD: req.cookies.pokeCookie ? pokeJSON.SPD : req.query.spd,
        sbmtPhoto: req.query.photo,
        sbmtDesc: req.query.desc,

        err: errorMessages,

      });
    });


/**
 * Handles POST requests for the '/preview' endpoint.
 * Validates the body parameters provided in the request such as Pokémon name, type, stats, photo, and description.
 *
 * If a file is uploaded as the photo:
 *  - Validates the uploaded file's size and mime type.
 *  - Moves the file to the appropriate directory.
 *
 * Renders the 'pokebuilder' page, displaying any validation errors and the uploaded Pokémon's details.
 *
 * @route POST /preview
 * @throws {Error} Throws an error if Pokémon name is 'satan'.
 * @throws {Error} Throws an error if no file is uploaded or the uploaded file violates the size/mime type constraints.
 * @returns {void} Renders the 'pokebuilder' view with potential body values and any validation errors.
 */
router.post('/preview', upload.single('photo'),
    [
      body('name').trim().notEmpty().withMessage('PokeName is required').bail()
          .isLength({min: 2, max: 20}).withMessage('Name must have between 2 and 20 letters'),
      body('name').custom((value, {req}) => {
        if (req.body.name === 'satan') {
          throw new Error('No Devil Worshiping!');
        }
        return true;
      }),
      body('type1')
          .isIn(['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying',
            'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'])
          .withMessage('Invalid PokeType')
          .notEmpty().withMessage('You must choose at least 1 PokeType'),
      body('hp').trim().notEmpty().withMessage('HP Stat is required!').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      body('atk').trim().notEmpty().withMessage('ATK Stat is required!').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      body('def').trim().notEmpty().withMessage('DEF Stat is required!').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      body('spatk').trim().notEmpty().withMessage('SP. ATK Stat is required!').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      body('spdef').trim().notEmpty().withMessage('SP. DEF Stat is required!').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      body('spd').trim().notEmpty().withMessage('SPD Stat is required!').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      // body('photo').trim().notEmpty().withMessage('PokePhoto is required!').bail(),
      body('photo').custom((value, {req}) => {
      // Check if photo exists
        if (!req.file) {
          throw new Error('No file uploaded');
        }

        // Check file size
        if (req.file.size < 1024 || req.file.size > (25 * 1024 * 1024)) {
          throw new Error('Uploaded file must be at least 1KB and at most 25MB');
        }

        // Check mimetype
        if (!req.file.mimetype.startsWith('image/')) {
          throw new Error('Uploaded file must have an image MimeType');
        }

        return true;
      }),
      body('desc').trim().notEmpty().withMessage('You must enter a description for your Pokemon!').bail()
          .isLength({min: 1, max: 500})
          .withMessage('Please shorten the length of your description to 500 characters or less'),
    ],
    function(req, res, next) {
      const violations = validationResult(req);
      const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();
      let imageProps;

      if (req.file) {
        if (errorMessages['photo']) {
          fs.unlinkSync(req.file.path);
        } else {
          imageProps = [{
            info: req.file.originalname,
            imgsrc: `/images/${req.file.filename}-${req.file.originalname}`,
          }];
          moveFile(req.file, __dirname + '/../public/images/');
        }
      }

      const desctext = [{pokedesc: req.body.desc}];

      if (req.body.rememberMe === 'on') {
        const cookieOptions = {
          path: req.baseUrl,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 60,
        };

        const JSONcookie = {
          name: req.body.name,
          type1: req.body.type1,
          type2: req.body.type2,
          HP: req.body.hp,
          ATK: req.body.atk,
          SPATK: req.body.spatk,
          DEF: req.body.def,
          SPDEF: req.body.spdef,
          SPD: req.body.spd,
        };

        res.cookie('pokeCookie', JSON.stringify(JSONcookie), cookieOptions);
      }

      sessActions = req.session.Actions;
      const JSONAction = createSessionAction('User created a new Pokemon', 'PokeBuilder');
      sessActions.unshift(JSONAction);
      sessActions = sessActions.slice(0, 4);
      req.session.Actions = sessActions;

      console.log(req.session.Actions);


      res.render('pokebuilder', {
        pokebuilder: true,

        sbmtName: req.body.name,
        sbmtType1: req.body.type1,
        sbmtType2: req.body.type2,

        sbmtHP: req.body.hp,
        sbmtATK: req.body.atk,
        sbmtDEF: req.body.def,
        sbmtSPATK: req.body.spatk,
        sbmtSPDEF: req.body.spdef,
        sbmtSPD: req.body.spd,
        sbmtPhoto: imageProps,
        sbmtDesc: desctext,
        multitype: req.body.type2 !== '',

        submitted: Object.keys(errorMessages).length <= 0,
        err: errorMessages,
      });
    });


/**
 * Moves a temporary uploaded file to a specified directory.
 *
 * @param {MulterFileInfo} tempFile - The Multer file object containing file details.
 * @param {string} newPath - The directory to which the file should be moved.
 */
function moveFile(tempFile, newPath) {
  // append the files filename and originalname to the path
  newPath += tempFile.filename + '-' + tempFile.originalname;
  fs.rename(tempFile.path, newPath, (err) => {
    // if there is a file system error just throw the error for now
    if (err) throw err;
  });
}

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


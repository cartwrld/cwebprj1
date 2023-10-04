const express = require('express');
const router = express.Router();
const path = require('path');

const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  dest: 'public/uploads',
});

const {body, query, oneOf, validationResult} = require('express-validator');


const onlyMsgErrorFormatter = ({location, msg, param, value, nestedErrors}) => {
  return msg; // just return the string - this is not an object
};

router.get('/', upload.fields([{name: 'file1', maxCount: 1}]),
    [
      query('name').if(query('name').exists())
          .trim().notEmpty().withMessage('PokeName is required').bail()
          .isLength({min: 2, max: 20}).withMessage('Name must have between 2 and 20 letters'),
      // query('type1').if(query('type1').exists()).withMessage('Type is required')
      //     .notEmpty().withMessage('You must choose at least 1 PokeType')
      //     .isIn(['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground',
      //       'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'])
      //     .withMessage('Invalid PokeType')
      //     .notEmpty().withMessage('You must choose at least 1 PokeType'),
      query('hp').if(query('hp').exists()).trim().notEmpty().withMessage('HP Stat is required').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      query('atk').if(query('atk').exists()).trim().notEmpty().withMessage('ATK Stat is required').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      query('def').if(query('def').exists()).trim().notEmpty().withMessage('DEF Stat is required').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      query('spatk').if(query('spatk').exists()).trim().notEmpty().withMessage('SP. ATK Stat is required').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      query('spdef').if(query('spdef').exists()).trim().notEmpty().withMessage('SP. DEF Stat is required').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      query('spd').if(query('spd').exists()).trim().notEmpty().withMessage('SPD Stat is required').bail()
          .isNumeric().withMessage('Please enter a value between 1 and 999'),
      query('desc').if(query('desc').exists()).trim().notEmpty()
          .withMessage('You must enter a description for your Pokemon').bail().isLength({min: 10, max: 500})
          .withMessage('Please shorten the length of your description to 500 characters or less'),
    ],
    function(req, res, next) {
      const violations = validationResult(req);
      const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();

      console.log(errorMessages);
      console.log(req.files);

      res.render('pokebuilder', {
        pokebuilder: true,

        sbmtName: req.query.name,
        sbmtType1: req.query.type1,
        sbmtType2: req.query.type2,
        sbmtHP: req.query.hp,
        sbmtATK: req.query.atk,
        sbmtDEF: req.query.def,
        sbmtSPATK: req.query.spatk,
        sbmtSPDEF: req.query.spdef,
        sbmtSPD: req.query.spd,
        smbtPhoto: req.query.photo,
        smbtDesc: req.query.desc,

        err: errorMessages,
      });
    });

router.post('/preview',
    [
      body('name').trim().notEmpty().withMessage('PokeName is required!').bail()
          .isLength({min: 2, max: 20}).withMessage('Name must have between 2 and 20 letters'),
      body('type1').notEmpty().withMessage('PokeType is required!').bail()
          .isIn(['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'])
          .withMessage('Invalid PokeType')
          .notEmpty().withMessage('You must choose at least 1 PokeType!'),
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
      body('photo').trim().notEmpty().withMessage('PokePhoto is required!').bail(),
      body('desc').trim().notEmpty().withMessage('You must enter a description for your Pokemon!').bail()
          .isLength({min: 1, max: 500})
          .withMessage('Please shorten the length of your description to 500 characters or less'),
    ],
    function(req, res, next) {
      const violations = validationResult(req);
      const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();

      console.log(errorMessages);
      console.log('++++====++++====++++');
      console.log(req.files);

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
        sbmtPhoto: `/uploads/${req.file.filename}`,
        smbtDesc: req.body.desc,

        submitted: true,
        err: errorMessages,
      });
    });


/**
 * @param {MulterFileInfo} tempFile
 * @param {string} newPath
 */
function moveFile(tempFile, newPath) {
  // append the files filename and originalname to the path
  newPath += tempFile.filename + '-' + tempFile.originalname;
  fs.rename(tempFile.path, newPath, (err) => {
    // if there is a file system error just throw the error for now
    if (err) throw err;

    // OPTIONAL: inspect new path in terminal
    // console.log('File moved to ' + newPath);
  });
}

module.exports = router;
// module.exports = (pp) => {
//     return router;
// };

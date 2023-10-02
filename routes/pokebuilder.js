const express = require('express');
const router = express.Router();

// const fs = require('fs');
// const multer = require('multer');
//
// const upload = multer({
//   dest: 'public/uploads',
// });
//
// const {body, query, oneOf, validationResult} = require('express-validator');

router.get('/', function(req, res, next) {
  res.render('pokebuilder', {
    sbmtName: req.body.name,
    sbmtType1: req.body.type1,
    sbmtType2: req.body.type2,
    sbmtStats: {
      sbmtHp: req.body.hp,
      sbmtAtk: req.body.atk,
      sbmtDef: req.body.def,
      sbmtSpAtk: req.body.spatk,
      sbmtSpDef: req.body.spdef,
      smbtSpd: req.body.spd,
    },
    smbtImage: req.body.pokeImage,
    smbtDesc: req.body.description,
  });
});


// /**
//  * @param {MulterFileInfo} tempFile
//  * @param {string} newPath
//  */
// function moveFile(tempFile, newPath) {
//   // append the files filename and originalname to the path
//   newPath += tempFile.filename + '-' + tempFile.originalname;
//   fs.rename(tempFile.path, newPath, (err) => {
//     // if there is a file system error just throw the error for now
//     if (err) throw err;
//
//     // OPTIONAL: inspect new path in terminal
//     // console.log('File moved to ' + newPath);
//   });
// }

module.exports = router;
// module.exports = (pp) => {
//     return router;
// };

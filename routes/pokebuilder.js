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

router.get('/pokebuilder', function(req, res, next) {
  res.render('pokebuilder', {

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

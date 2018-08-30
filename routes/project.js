var express = require('express');
var router = express.Router();

/* GET local project */
router.get('/get', function(req, res, next) {
  res.send("Hello World!");
  next();
});

/* POST new local project */
router.post('/add', function(req, res, next) {
  res.send("Hello World!");
  next();
});

/* PATCH new local project */
router.patch('/update', function(req, res, next) {
  res.send("Hello World!");
  next();
});


module.exports = router;

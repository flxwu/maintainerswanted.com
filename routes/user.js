var express = require('express');
var router = express.Router();

/* GET all gothub projects of user */
router.get('/ghprojects', function(req, res, next) {
  res.send("Hello World!");
  next();
});

/* GET specific gothub project of user */
router.get('/ghproject/get', function(req, res, next) {
  res.send("Hello World!");
  next();
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET list of local projects */
router.get('/', function(req, res, next) {
  res.send("Hello World!");
  next();
});

module.exports = router;

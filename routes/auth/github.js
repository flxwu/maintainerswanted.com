var express = require('express');
var router = express.Router();
const passport = require('passport');

/* GET users listing. */
router.get('/', (req, res, next) => {

  passport.authenticate('github');

});

module.exports = router;

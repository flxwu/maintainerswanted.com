var express = require('express');
var router = express.Router();
const passport = require('passport');

/* GET users listing. */
router.get('/', (req, res, next) => {

  passport.authenticate('github', { failureRedirect: '/login' }, (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');

  });

});

module.exports = router;

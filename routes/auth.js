const express = require('express');
const router = express.Router();

let passport = null;

const getRouter = (passportRef) => {
  passport = passportRef;
  return router;
}

/**
 * GET Auth Status
 */
router.get('/status', (req, res, next) => {
  return res.json({ loggedIn: req.session.loggedIn });
});

/**
 * GET Github Auth
 */
router.get('/github', (req, res, next) => {
  passport.authenticate('github', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/');
    }
    req.session.loggedIn = true;
  })(req, res, next);
});

/**
 * GET Github Auth Callback
 */
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/'
  })
  return next();
});

module.exports = getRouter;

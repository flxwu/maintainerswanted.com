const express = require('express');
const router = express.Router();

let passport = null;

const getRouter = (passportRef) => {
	passport = passportRef;
	return router;
}

/**
 * GET Github Auth
 */
router.get('/github', (req, res, next) => {
  passport.authenticate('github');
});

/**
 * GET Github Auth Callback
 */
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', {
		successRedirect: '/',
		failureRedirect: '/'
	})
});

/**
 * GET Github Logout
 */
router.get('/github/logout', (req, res, next) => {
	req.logout();
	res.redirect('/');
});

module.exports = getRouter;

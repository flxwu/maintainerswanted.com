const express = require('express');
const router = express.Router();

let passport = null;

const getRouter = passportRef => {
	passport = passportRef;
	return router;
};

/**
 * GET Auth Status
 */
router.get('/status', (req, res, next) => {
  console.log('balblablablablabl');
	res.json({
    loggedIn: req.session.loggedIn,
    user: req.session.user
  });
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
		req.session.user = user;
	})(req, res, next);
});

/**
 * GET Github Auth Callback
 */
router.get('/github/callback', (req, res, next) => {
	passport.authenticate('github', {
		successRedirect: '/',
		failureRedirect: '/'
	});
});

module.exports = getRouter;

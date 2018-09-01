const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const logger = require('morgan');

const GitHubStrategy = require('passport-github').Strategy;

const projectRouter = require('./routes/project');
// var github = require('./routes/auth/github');
// var githubcallback = require('./routes/auth/githubcallback');

var app = express();

// Init passport
app.use(passport.initialize());

// Routes
app.use('/api/project', projectRouter);
app.get('/api/auth/github', passport.authenticate('github'));
app.get(
	'/api/auth/github/callback',
	passport.authenticate('github', {
		successRedirect: '/',
		failureRedirect: '/login'
	})
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/build')));

// Passport user (de)-serialisation to avoid transmitting user info after login
passport.serializeUser(function(user, callback) {
	callback(null, user);
});

passport.deserializeUser(function(obj, callback) {
	callback(null, obj);
});

// Configure Github OAuth
passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GH_KEY,
			clientSecret: process.env.GH_SECRET,
			callbackURL: 'http://localhost:5000/api/auth/github/callback' //TODO: Change localhost to production host
		},
		(accessToken, refreshToken, profile, callback) => {
			return callback(null, profile);
		}
	)
);

// redirect all wildcard matches to landing page
app.get('*', function(req, res) {
  res.redirect('/');
});
// catch 404
app.use(function(req, res) {
	res.redirect('/');
});

module.exports = app;

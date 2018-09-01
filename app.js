var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var logger = require('morgan');
var bodyParser = require('body-parser');

const GitHubStrategy = require('passport-github').Strategy;

var projectRouter = require('./routes/project');
var github = require('./routes/auth/github');
var githubcallback = require('./routes/auth/githubcallback');

var app = express();

// Routes
app.use('/api/project', projectRouter);
app.use('/api/auth/github', github);
app.use('/api/auth/guthub/callback', githubcallback);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/build')));

// Init passport
app.use(passport.initialize());

// Passport user (de)-serialisation to avoid transmitting user info after login
passport.serializeUser(function(user, callback) {
	callback(null, user);
});

passport.deserializeUser(function(obj, callback) {
	callback(null, obj);
});

// Configure Github OAuth
passport.use(new GitHubStrategy({
	clientID: process.env.GH_KEY,
	clientSecret: process.env.GH_SECRET,
	callbackURL: 'localhost:5000/api/auth/github/callback' //TODO: Change localhost to production host
},
(accessToken, refreshToken, profile, callback) => {
	User.findOrCreate({ githubId: profile.id }, function (err, user) {
		return callback(err, user);
	});
}
));

// catch 404
app.use(function(req, res, next) {
  res.json({ status: 404, error: "Not Found"});
});

module.exports = app;

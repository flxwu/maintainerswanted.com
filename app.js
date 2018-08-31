var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var logger = require('morgan');
var bodyParser = require('body-parser');

const GitHubStrategy = require('passport-github').Strategy;

var projectRouter = require('./routes/project');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/api/project', projectRouter);

// Configure Github OAuth
// passport.use(new GitHubStrategy({
// 	clientID: '2ec1ebabf5ae9436245e',
// 	clientSecret: config.GithubSecret,
// 	callbackURL: 'http://poll.io.flxwu.com/auth/github/callback' //TODO: Change localhost to production host
// },
// (accessToken, refreshToken, profile, callback) => {
// 	User.findOrCreate({ githubId: profile.id }, function (err, user) {
// 		return callback(err, user);
// 	});
// }
// ));

// catch 404
app.use(function(req, res, next) {
  res.json({ status: 404, error: "Not Found"});
});

module.exports = app;

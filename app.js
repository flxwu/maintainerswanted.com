const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const logger = require('morgan');
const firebase = require('firebase');
const octokit = require('@octokit/rest')();
const session = require('express-session');
const FirebaseStore = require('connect-session-firebase')(session);

const projectRouter = require('./routes/project');
const authRouter = require('./routes/auth');
const config = require('./util/config');
const { passportSetup } = require('./util/apiHelper');


// Initialize Express App
const app = express();
// Init passport
app.use(passport.initialize());

// run Setup for Firebase, Octokit and Passport
const ref = firebase.initializeApp(config);
octokit.authenticate({
	type: 'oauth',
	key: process.env.GH_KEY,
	secret: process.env.GH_SECRET
});
passportSetup(passport);


// Routes
app.use('/api/project', projectRouter(octokit, firebase));
app.use('/api/auth', authRouter(passport));


// Session Storage
app.use(session({
	store: new FirebaseStore({
		database: ref.database()
	}),
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}));


// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Serve FrontEnd build
app.use(express.static(path.join(__dirname, 'client/build')));


// redirect all wildcard matches to landing page
app.get('*', (req, res) => {
  res.redirect('/');
});
// catch 404
app.use((req, res) => {
	res.redirect('/');
});

module.exports = app;

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
const bodyParser = require('body-parser');


// Initialize Express App
const app = express();
app.use(bodyParser.json());
// Init passport
app.use(passport.initialize());

const GH_KEY = process.env.GH_KEY;
const GH_SECRET = process.env.GH_SECRET;

// run Setup for Firebase, Octokit and Passport
const ref = firebase.initializeApp(config);
octokit.authenticate({
	type: 'oauth',
	key: GH_KEY,
	secret: GH_SECRET
});

// Session Storage
app.use(session({
	store: new FirebaseStore({
		database: ref.database()
	}),
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}));

// Routes
app.use('/api/project', projectRouter(octokit, firebase));
app.use('/api/auth', authRouter(GH_KEY, GH_SECRET));


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

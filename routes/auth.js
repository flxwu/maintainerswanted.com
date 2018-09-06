const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../util/logger');

const env = process.env.NODE_ENV || 'dev';
const rootURL =
  env === 'dev' ? 'http://localhost:5000' : 'https://maintainerswanted.com';
const callbackUrl = rootURL + '/api/auth/github/callback';

let key = null;
let secret = null;

const getRouter = (keyRef, secretRef) => {
  key = keyRef;
  secret = secretRef;
  return router;
};

/**
 * GET Auth Status
 */
router.get('/status', (req, res, next) => {
  res.json({
    loggedIn: req.session.loggedIn,
    user: req.session.user
  });
});

/**
 * GET Github Auth
 */
router.get('/github', (req, res, next) => {
  logger('[AUTH] Redirecting to Github OAuth Authorization');
  res.send(
    'https://github.com/login/oauth/authorize?' +
      `client_id=${key}&scope=user,repo,admin:repo_hook` +
      `&redirect_uri=${callbackUrl}`
  );
});

/**
 * GET Github Auth Callback
 */
router.get('/github/callback', async (req, res, next) => {
  const code = req.query.code;

  let accessToken = null;
  logger('[AUTH] Getting user\'s access token');

  await axios
    .post('https://github.com/login/oauth/access_token', {
      client_id: key,
      client_secret: secret,
      code: code
    })
    .then(response => {
      accessToken = response.data.split('&')[0].split('token=')[1];
      req.session.access_token = accessToken;
    });

  logger('[AUTH] Got user\'s access token');

  await axios
    .get(`https://api.github.com/user?access_token=${accessToken}`)
    .then(response => {
      req.session.user = response.data.login;
      req.session.loggedIn = true;
      logger(`[AUTH] User ${req.session.user}(${response.data.login}) logged in successfully`);
      res.redirect(rootURL);
    });
});

/**
 * GET Github Logout
 */
router.get('/github/logout', (req, res, next) => {
  req.session.loggedIn = false;
  req.session.user = null;

  res.clearCookie('connect.sid');
  res.redirect('/');
});

module.exports = getRouter;

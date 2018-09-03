const express = require('express');
const router = express.Router();
const axios = require('axios');

const { paginate, finished } = require('../util/apiHelper');

const env = process.env.NODE_ENV || 'dev';
const rootURL =
  env === 'dev' ?
		'http://localhost:5000' :
    'https://maintainerswanted.com';

const webHookUrl =
  env === 'dev' ?
    process.env.NGROK :
    'https://maintainerswanted.com';

let octokit = null;
let firebase = null;

let database;
let projectDB;

const getRouter = (octokitRef, firebaseRef) => {
  octokit = octokitRef;
  firebase = firebaseRef;
  database = firebase.database();
  projectDB = database.ref('projects');
  return router;
}

/**
 * GET - /api/project/getList
 * Gets all registered projects from Firebase
 */
router.get('/getList', (req, res, next) => {

  const projectsList = [];

  const gotAll = data => {
    let tmp = data.val();
    projectsList.push(tmp);
  };

  const errData = error => {
    console.error('Something went wrong.');
    console.error(error);
  };

  projectDB.on('value', gotAll, errData);

  // Return project if availible
  if (projectsList) res.json({ status: 200, data: projectsList });
  else
    res.json({
      status: 500,
      err: 'Error while getting registered Repository List'
    });

});

/**
 * GET - /api/project/getStatistics?owner&repo
 * Fetches Repo Data from Github API
 */
router.get('/getStatistics', async (req, res, next) => {
  const { owner, repo } = req.query;

  const repoData = await octokit.repos.get({ owner, repo });
  const contributors = await paginate(octokit, octokit.repos.getContributors, {
    owner,
    repo,
    anon: true
  }).then(data => {
    return data.length;
  });
  
  const data = {
    stars: repoData.data.stargazers_count,
    watchers: repoData.data.watchers_count,
    contributors: contributors,
    description: repoData.data.description,
    url: 'https://github.com/' + owner + '/' + repo
  };

  // Return project if available
  if (data) res.json({ data: await data });
  else res.json({ status: 500, err: 'Error while getting Repository Data' });
});

/**
 * GET - /api/project/getRepos?user
 * All Repos of User from Github API
 * TODO: Change to all Repos he collaborates on
 */
router.get('/getRepos', async (req, res, next) => {
  const username = req.query.user;
  const repos = await octokit.repos.getForUser({ username });

  const repos_temp = repos.data;
  let data = [];
  for (i = 0; i < repos_temp.length; i++) {
    data.push({
      name: repos_temp[i].name,
      stars: repos_temp[i].stargazers_count,
      watchers: repos_temp[i].watchers_count,
      description: repos_temp[i].description,
      url: 'https://github.com/' + username + '/' + repos_temp[i].name
    });
  }

  // Return project if available
  if (data) res.json({ data: await data });
  else res.json({ status: 500, err: 'Error while getting Repository Data' });
});

/**
 * POST - /api/project/add
 * Adds new project to Database
 */
router.post('/add', async (req, res, next) => {
  const owner = req.session.user;
  const repo = req.body.repo;
  const twitterHandle = req.body.twitter;
  const repoData = await octokit.repos.get({ owner, repo });
  const id = Math.random()
    .toString(36)
    .substr(2, 9);
  
  const access_token = req.session.access_token;
  
  // create webhook for the added repository
  axios.post(
    `https://api.github.com/repos/${owner}/${repo}/hooks?access_token=${access_token}`, {
    owner,
    repo,
    name: 'web',
    config: {
      url: `${webHookUrl}/api/project/webhook`,
      content_type: 'json'
    },
    events: ["issues"] 
  });

  // New entry
  var newProject = {
    id: id,
    name: repo,
    owner: owner,
    description: repoData.data.description,
    url: 'https://github.com/' + owner + '/' + repo,
    twitter: twitterHandle
  };

  let projectDBEntry = projectDB.push(newProject, finished);
  console.log('Firebase generated key: ' + projectDBEntry.key);

  if (projectDBEntry) res.json({ status: 200, data: projectDBEntry.key });
  else res.json({ status: 500, err: 'Error while adding project' });

  next();
});

/**
 * POST /api/project/webhook
 * payload url for github issues webhooks
 */
router.post('/webhook', async (req, res, next) => {
  console.log(req.body);
})


module.exports = getRouter;

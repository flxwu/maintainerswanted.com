var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const octokit = require('@octokit/rest')();

const { paginate, setup, finished } = require('../util/apiHelper');

// run Setup for Firebase and Octokit
setup();


/**
 * GET - /api/project/getList
 * Gets all registered projects from Firebase
 */
router.get('/getList', (req, res, next) => {
  var database = firebase.database();
  var projectRef = database.ref('projects');

  const projectsList = [];

  const gotAll = (data) => {
    let tmp = data.val();
    projectsList.push(tmp);
  }

  const errData = (error) => {
    console.error('Something went wrong.');
    console.error(error);
  }

  projectRef.on('value', gotAll, errData);

  // Return project if availible
  if(projectsList)
    res.json({ status: 200, data: projectsList });
  else
    res.json({ status: 500, err: "Error while getting registered Repository List" });

  next();

});


/**
 * GET - /api/project/getStatistics?owner&repo
 * Fetches Repo Data from Github API
 */
router.get('/getStatistics', async (req, res, next) => {
  const { owner, repo } = req.query;

  const repoData = await octokit.repos.get({owner, repo});
  const contributors = await paginate(octokit.repos.getContributors, {owner, repo, anon: true})
    .then(data => {
      return data.length;
    })

  const data = {
    stars: repoData.data.stargazers_count,
    watchers: repoData.data.watchers_count,
    contributors: contributors,
    description: repoData.data.description,
    url: 'https://www.github.com/' + owner + '/' + repo
  }

  // Return project if available
  if(data)
    res.json({ data: await data });
  else
    res.json({ status: 500, err: "Error while getting Repository Data" });
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
  console.log(repos_temp);
  let data = [];
  for(i = 0; i < repos_temp.length; i++) {
    data.push(
      {
        name: repos_temp[i].name,
        stars: repos_temp[i].stargazers_count,
        watchers: repos_temp[i].watchers_count,
        description: repos_temp[i].description,
        url: 'https://www.github.com/' + username + '/' + repos_temp[i].name,
      }
    );
  }

  // let data = repos.data;
  // console.log(data);

  // Return project if available
  if(data)
    res.json({ data: await data });
  else
    res.json({ status: 500, err: "Error while getting Repository Data" });
});


/**
 * POST - /api/project/add
 * Adds new project to Database
 */
router.post('/add', async (req, res, next) => {

  var database = firebase.database();
  const owner = req.body.owner;
  const repo = req.body.repo;
  const twitterHandle = req.body.twitter;
  const repoData = await octokit.repos.get({owner, repo});
  const id = Math.random().toString(36).substr(2, 9);
  

  // New entry
  var newProject = {
    id: id,
    name: repo,
    owner: owner,
    description: repoData.data.description,
    url: 'https://www.github.com/' + owner + '/' + repo,
    twitter: twitterHandle,
  };

  let dbProjects = database.ref('projects');

  let dbProject = dbProjects.push(newProject, finished);
  console.log('Firebase generated key: ' + dbProject.key);

  if(dbProject)
    res.json({ status: 200, data: dbProject.key });
  else
    res.json({ status: 500, err: "Error while adding project" });

  next();

});

module.exports = router;

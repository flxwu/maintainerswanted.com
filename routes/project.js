var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const config = require('./config');
const octokit = require('@octokit/rest')();

// initialize Firebase
firebase.initializeApp(config);

octokit.authenticate({
  type: 'oauth',
  key: 'dbc407eab78d60478da9',
  secret: 'a85529728a40158871c4b9a7e19dab6a81eeb24e'
})

/**
 * Gets all registered projects from Firebase
 */
router.get('/getList', (req, res, next) => {
  var database = firebase.database();

  var projectRef = database.ref('projects/');
  let project;

  projectRef.on('value', (snapshot) => {
    project = snapshot.val();
  });

  // Return project if availible
  if(project)
    res.json({ status: 200, data: project });
  else
    res.json({ status: 500, err: "Error while getting registered Repository List" });

  next();

});


/**
 * Fetches Repo Data from Github API
 * /project/getStatistics?owner=flxwu&repo=test
 */
router.get('/getStatistics', async (req, res, next) => {
  const { owner, repo } = req.query;
  const repoData = await octokit.repos.get({owner, repo});
  const contributors = await octokit.repos.getStatsContributors({owner, repo});

  const data = {
    stars: repoData.data.stargazers_count,
    watchers: repoData.data.watchers_count,
    contributors: contributors.data[0].total,
  }

  // Return project if available
  if(data)
    res.json({ data: await data });
  else
    res.json({ status: 500, err: "Error while getting Repository Data" });
});


/**
 * Adds new project to Firebase
 */

router.post('/add', (req, res, next) => {

  var database = firebase.database();

  console.log(req.body);

  // New entry
  var newProject = {
    id: req.body.id,
    name: req.body.name,
    owner: req.body.owner
  };

  // Get a key for a new Post.
  var newPostKey = database.ref().child('projects').push().key;

  if(newPostKey)
    res.json({ status: 200, data: newProject });
  else
    res.json({ status: 500, err: "Error while adding project" });

  next();

});

module.exports = router;

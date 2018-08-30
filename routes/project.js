var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const config = require('./config');

firebase.initializeApp(config);

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
    res.json({ status: 500, err: "That project does not exist!" });

  next();

});

/**
 * Fetches Repo Data from Github API
 */
router.get('/getStatistics', (req, res, next) => {
  const result = await octokit.repos.get({owner, repo})

  // Return project if available
  if(data)
    res.json({ status: 200, data: data });
  else
    res.json({ status: 500, err: "That project does not exist!" });

  next();

});

module.exports = router;

var express = require('express');
var router = express.Router();
var firebase = require('firebase');

// Database connection
var db = require('../db.js');
var database = firebase.database();

// TODO: Add params

/*

  Data Format:

  {
    id: NUMBER,
    name: STRING,
    owner: STRING
    collaborators: [STRING, STRING, ...],
    stars: NUMBER,
    commits: NUMBER
  }

*/

/* GET local project */
router.get('/get', function(req, res, next) {
  var projectRef = firebase.database().ref('projects/' + projectName);
  projectRef.on('value', function(snapshot) {
    var project = snapshot.val();
  });

  // Return project if availible
  if(project)
    res.send(project);
  else
    res.err(404);

  next();
});

/* POST new local project */
router.post('/add', function(req, res, next) {
  firebase.database().ref('projects/' + projectName).set({
    id: id,
    name: name,
    owner: owner,
    collaborators: JSON.parse(collaborators),
    stars: stars,
    commits: commits
  });
  next();
});

/* PATCH new local project */
router.patch('/update', function(req, res, next) {
  res.send("Hello World!");
  next();
});


module.exports = router;

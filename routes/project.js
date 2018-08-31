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
    owner: STRING,
    collaborators: [STRING, STRING, ...],
    stars: NUMBER,
    commits: NUMBER
  }

*/

/* GET local project */
router.get('/get', (req, res, next) => {

  var projectRef = database.ref('projects/' + req.query.projectname);
  projectRef.on('value', (snapshot) => {
    var project = snapshot.val();
  });

  // Return project if availible
  if(project)
    return res.json({ status: 200, data: project });
  else
    return res.json({ status: 500, err: "That project does not exist!" });

  next();

});

/* POST new local project */
router.post('/add', (req, res, next) => {

  database.ref('projects/' + req.query.projectname).set({
    id: req.query.id,
    name: req.query.name,
    owner: req.query.owner,
    collaborators: JSON.parse(req.query.collaborators),
    stars: req.query.stars,
    commits: req.query.commits
  });

  return res.json({ status: 200, data: project });

  next();

});

/* PATCH new local project */
router.patch('/update', (req, res, next) => {

  res.send("Hello World!");
  next();

});


module.exports = router;

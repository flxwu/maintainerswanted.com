var express = require('express');
var router = express.Router();

/* GET local project */
router.get('/get', (req, res, next) => {
  var database = firebase.database();

  var projectRef = database.ref('projects/' + req.query.name);
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

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET all gothub projects of user */
router.get('/ghprojects', function(req, res, next) {

  // Get projects from github
  // TODO: Add user param
  request('http://api.github.com/', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred and handle it
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    var projects = response.data;
  });

  if(projects) {
    
  }

  next();
});

/* GET specific gothub project of user */
router.get('/ghproject/get', function(req, res, next) {
  res.send("Hello World!");
  next();
});

module.exports = router;

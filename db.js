var firebase = require('firebase');
var dbconfig = require('./dbconfig.json');

// Initialize Firebase
var config = dbconfig;

module.exports = firebase.initializeApp(config);

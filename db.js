var firebase = require('require');
import dbconfig from 'dbconfig.json';

// Initialize Firebase
var config = JSON.parse(dbconfig);

module.exports = firebase.initializeApp(config);

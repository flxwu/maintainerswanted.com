const express = require('express');
const octokit = require('@octokit/rest')()
const router = express.Router();

/* GET project stars and contributors */
router.get('/getStats', async (req, res, next) => {
  const { owner, repo } = req.params;
  const result = await octokit.repos.get({owner, repo});
  console.log(result);
  res.send(result);
});

/* POST new local project */
router.get('/add', function(req, res, next) {
  res.send("Hello World!");
  next();
});

/* PATCH new local project */
router.patch('/update', function(req, res, next) {
  res.send("Hello World!");
  next();
});


module.exports = router;

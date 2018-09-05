const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../util/logger');

const {
	paginate,
	finished,
	checkIfDuplicate,
	deleteProjectFromDB
} = require('../util/apiHelper');
const issueTemplate = require('../util/issueTemplate');

const env = process.env.NODE_ENV || 'dev';
const rootURL =
	env === 'dev' ? 'http://localhost:5000' : 'https://maintainerswanted.com';

const webHookUrl =
	env === 'dev' ? process.env.NGROK : 'https://maintainerswanted.com';

const GH_KEY = process.env.GH_SECRET;
const GH_SECRET = process.env.GH_SECRET;

let octokit = null;
let firebase = null;

let database;
let projectDB;

const getRouter = (octokitRef, firebaseRef) => {
	octokit = octokitRef;
	firebase = firebaseRef;
	database = firebase.database();
	projectDB = database.ref('projects');
	return router;
};

/**
 * GET - /api/project/getList
 * Gets all registered projects from Firebase
 */
router.get('/getList', async (req, res, next) => {
	const gotAll = async data => {
    let projectsList = await data.val();
    projectsList = projectsList ?
      Object.values(projectsList)
        .map(project => {
          delete project.access_token;
          return project;
        }) :
      'None';
		// Return projects if availible
		if (projectsList) res.json({ status: 200, data: projectsList });
		else
			res.json({
				status: 500,
				err: 'Error while getting registered Repository List'
			});
	};

	const errData = error => {
		console.error('Something went wrong.');
		console.error(error);
		res.json({
			status: 500,
			err: 'Error while getting registered Repository List'
		});
	};

	await projectDB.on('value', gotAll, errData);
});

/**
 * GET - /api/project/getStatistics?owner&repo
 * Fetches Repo Data from Github API
 */
router.get('/getStatistics', async (req, res, next) => {
	const { owner, repo } = req.query;

	const repoData = await octokit.repos.get({ owner, repo });
	const contributors = await paginate(octokit, octokit.repos.getContributors, {
		owner,
		repo,
		anon: true
	}).then(data => {
		return data ? data.length : 0;
	});

	const data = {
		stars: repoData.data.stargazers_count,
		watchers: repoData.data.watchers_count,
		contributors: contributors,
		description: repoData.data.description,
		url: 'https://github.com/' + owner + '/' + repo
	};

	// Return project if available
	if (data) res.json({ data: await data });
	else res.json({ status: 500, err: 'Error while getting Repository Data' });
});

/**
 * GET - /api/project/getRepos?user
 * All Repos of User from Github API
 * TODO: Change to all Repos he collaborates on
 */
router.get('/getRepos', async (req, res, next) => {
	const username = req.session.user;
	octokit.authenticate({ type: "token", token: req.session.access_token });
	const repos = await octokit.repos.getAll();

	const repos_temp = repos.data;
	let data = [];
	for (i = 0; i < repos_temp.length; i++) {
		data.push({
			name: repos_temp[i].name,
			stars: repos_temp[i].stargazers_count,
			watchers: repos_temp[i].watchers_count,
			description: repos_temp[i].description,
			url: 'https://github.com/' + username + '/' + repos_temp[i].name
		});
	}

	// Return project if available
	if (data) res.json({ data: await data });
	else res.json({ status: 500, err: 'Error while getting Repository Data' });
});

/**
 * POST - /api/project/add
 * Adds new project to Database
 */
router.post('/add', async (req, res, next) => {
	const owner = req.session.user;
	const repo = req.body.repo;
	const url = 'https://github.com/' + owner + '/' + repo;

	// Check if project got added already
	const duplicate = await checkIfDuplicate(projectDB, url);
	if (duplicate) {
		return res.json(
			res.json({
				status: 400,
				err: 'Project got already added!'
			})
		);
	}

	const twitterHandle = req.body.twitter;
	const access_token = req.session.access_token;
	// Authenticate octokit with new user token
	// TODO: Can we move this directly to the github login callback?
	octokit.authenticate({
		type: 'token',
		token: access_token
	});

	const repoData = await octokit.repos.get({ owner, repo });
	const id = Math.random()
		.toString(36)
		.substr(2, 9);

	// create webhook for the added repository
	const createdHook = await octokit.repos.createHook({
		owner,
		repo,
		name: 'web',
		config: {
			url: `${webHookUrl}/api/project/webhook`,
			content_type: 'json'
		},
		events: ['issues']
  });

	// Create issue on repository
	const createdIssue = await octokit.issues.create({
		owner,
		repo,
		title: issueTemplate.title,
		body: issueTemplate.body,
		labels: ['Maintainers Wanted']
	});

	// New DB entry
	var newProject = {
		id,
		repo,
		owner,
		issueNumber: createdIssue.data.number,
    description: repoData.data.description,
    hookId: createdHook.data.id,
    accessToken: access_token,
		url,
		twitter: twitterHandle
  };

	// push to Firebase
	let projectDBEntry = projectDB.push(newProject, finished);
	logger('Firebase generated key: ' + projectDBEntry.key);

	if (projectDBEntry) res.json({ status: 200, data: projectDBEntry });
	else res.json({ status: 500, err: 'Error while adding project' });
});

/**
 * POST /api/project/webhook
 * payload url for github issues webhooks
 */
router.post('/webhook', async (req, res, next) => {
  const issueAction = req.body.action;

	// TODO: Do we also react on issue being reopened?
	// s. Issue #26
	if (issueAction !== 'closed') {
		return;
  }
  
	// Maintainers-Wanted issue got closed
	const hookedIssueNumber = req.body.issue.number;
	const repoUrl = req.body.repository.html_url;

	let hookedProject = null;
	// neat trick to do a SQL-like search query
	const hookedProjectRef = await projectDB
		.orderByChild('url')
		.startAt(repoUrl)
		.endAt(repoUrl + '\uf8ff')
		.on('value', async snapshot => {
      let tmp = snapshot.val();
      if(tmp) {
        let key = Object.keys(tmp)[0];
        hookedProject = Object.values(tmp)[0];

        const {
          owner,
          repo,
          issueNumber,
          hookId
        } = hookedProject;

        if (issueNumber === hookedIssueNumber) {
          await octokit.repos.deleteHook({
            owner,
            repo,
            hook_id: hookId
          });
          deleteProjectFromDB(database, key);
        }
      }
    });
});

module.exports = getRouter;

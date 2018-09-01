const octokit = require('@octokit/rest')();
var firebase = require('firebase');

const config = require('./config');

const paginate = async (method, params) => {
	let response = await method({ per_page: 100, ...params });
	let { data } = response;
	while (octokit.hasNextPage(response)) {
		response = await octokit.getNextPage(response);
		data = data.concat(response.data);
	}
	return data;
}

const setup = () => {
	firebase.initializeApp(config);
	octokit.authenticate({
		type: 'oauth',
		key: process.env.GH_KEY,
		secret: process.env.GH_SECRET
	});
}

// firebase callback after push finished
const finished = (err) => {
	if (err) {
		console.error(err);
	} else {
		console.log('SUCCESS');
	}
}

module.exports = { paginate, setup, finished };

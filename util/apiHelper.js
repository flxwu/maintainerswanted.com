const octokit = require('@octokit/rest')();

const paginate = async (method) => {
	let response = await method({ per_page: 100 });
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

export { paginate, setup, finished };

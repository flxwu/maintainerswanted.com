const GitHubStrategy = require('passport-github').Strategy;

const paginate = async (octokit, method, params) => {
	let response = await method({ per_page: 100, ...params });
	let { data } = response;
	while (octokit.hasNextPage(response)) {
		response = await octokit.getNextPage(response);
		data = data.concat(response.data);
	}
	return data;
};

const passportSetup = passportRef => {
	// Passport user (de)-serialisation to avoid transmitting user info after login
	passportRef.serializeUser((user, callback) => {
		callback(null, user);
	});

	passportRef.deserializeUser((obj, callback) => {
		callback(null, obj);
	});

	// Configure Github OAuth
	passportRef.use(
		new GitHubStrategy(
			{
				clientID: process.env.GH_KEY,
				clientSecret: process.env.GH_SECRET,
				callbackURL: '/api/auth/github/callback'
			},
			(accessToken, refreshToken, profile, callback) => {
				return callback(null, profile);
			}
		)
	);
};

// firebase callback after push finished
const finished = err => {
	if (err) {
		console.error(err);
	} else {
		console.log('SUCCESS');
	}
};

module.exports = { paginate, finished, passportSetup };

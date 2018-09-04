/**
 * Paginate through octokit results
 * @param {*} octokit 
 * @param {*} method 
 * @param {*} params 
 */
const paginate = async (octokit, method, params) => {
	let response = await method({ per_page: 100, ...params });
	let { data } = response;
	while (octokit.hasNextPage(response)) {
		response = await octokit.getNextPage(response);
		data = data.concat(response.data);
	}
	return data;
};


const checkIfDuplicate = () => {
  
}

// firebase callback after push finished
const finished = err => {
	if (err) {
		console.error(err);
	} else {
		console.log('SUCCESS');
	}
};

module.exports = { paginate, finished };

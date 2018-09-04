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

const checkIfDuplicate = async (projectDB, url) => {
  let isDuplicate = false;

  const gotAll = async data => {
    let projectsList = await data.val();
    isDuplicate = Object.values(projectsList).some(
      project => project.url === url
    );
  };

  await projectDB.on('value', gotAll);
  return isDuplicate;
};

const deleteProjectFromDB = async (projectDB, url) => {
  await projectDB
    .orderByChild('url')
    .startAt(url)
    .endAt(url + '\uf8ff')
    .delete();
};

// firebase callback after push finished
const finished = err => {
  if (err) {
    console.error(err);
  } else {
    console.log('SUCCESS');
  }
};

module.exports = {
  paginate,
  finished,
  checkIfDuplicate,
  deleteProjectFromDB
};

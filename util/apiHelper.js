const logger = require('./logger');

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
    if (projectsList) {
      isDuplicate = Object.values(projectsList).some(
        project => project.url === url
      );
    }
  };

  await projectDB.on('value', gotAll);
  return isDuplicate;
};

const deleteProjectFromDB = async (database, key) => {
  await database.ref(`projects/${key}`)
    .remove()
    .then(() => logger('[FIREBASE] DB Delete Success: ' + key))
    .then((err) => logger(`[FIREBASE] Error while deleting entry ${key}: ${err}`));
};

// firebase callback after push finished
const finished = err => {
  if (err) {
    logger('[FIREBASE] Error while pushing new entry: ' + err, 1);
  } else {
    logger('[FIREBASE] DB Push Success');
  }
};

module.exports = {
  paginate,
  finished,
  checkIfDuplicate,
  deleteProjectFromDB
};

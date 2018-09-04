const chalk = require('chalk');

const logger = (str, type = 0) => {
  switch (type) {
    case 0:
      console.log(chalk.cyan(str));
      break;
    case 1:
      console.log(chalk.red(str));
      break;
  }
};

module.exports = logger;

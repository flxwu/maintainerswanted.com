const issueTemplate = (repo, twitter) => ({
  title: repo + ' searches for Maintainers!',
  body:
    '*This issue was created by [Maintainers Wanted](https://maintainerswanted.com)* :nerd-face: \n' +
    '*Support us by leaving a star on [Github!](https://github.com/flxwu/maintainerswanted.com)* :star2: \n' +
    `\n\n ## ${repo} is searching for new Maintainers! :coder: :mailbox-with-mail:\n` +
    `Do you use ${repo} personally or at work and would like this project to be further developed and improved?\n` +
    'Or are you already a contributor and ready to take the next step to becoming a maintainer?\n\n' +
    twitter
      ? `If you are interested, comment here below on this issue :point-down or
        drop me a message on [Twitter](https://twitter.com/${twitter})! :raised-hands:`
      : 'If you are interested, comment here below on this issue! :point-down::raised-hands:'
});

module.exports = issueTemplate;

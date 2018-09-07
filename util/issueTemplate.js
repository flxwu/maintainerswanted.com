const issueTemplate = (repo, twitter) => ({
  title: repo + ' is searching for Maintainers!',
  body: `*This issue was created by [Maintainers Wanted](https://maintainerswanted.com)* :nerd_face: \n\n
*Support us by leaving a star on [Github](https://github.com/flxwu/maintainerswanted.com)!* :star2: \n\n
## ${repo} is searching for new Maintainers! :man_technologist: :mailbox_with_mail:\n
Do you use ${repo} personally or at work and would like this project to be further developed and improved?\n\n
Or are you already a contributor and ready to take the next step to becoming a maintainer?\n\n${
  twitter
    ? `If you are interested, comment here below on this issue :point_down: or drop me a message on [Twitter](https://twitter.com/${twitter})! :raised_hands:`
    : 'If you are interested, comment here below on this issue! :point_down::raised_hands:'
  }`,
  comment:
    'This issue got closed by the project\'s maintainers. ' +
    'Please don\'t reopen this issue but instead readd the project on [Maintainers Wanted](https://maintainerswanted.com)' +
    ' in case you still search for maintainers.'
});

module.exports = issueTemplate;

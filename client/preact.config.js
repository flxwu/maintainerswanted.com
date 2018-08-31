// module.exports = function(config) {
// 	config.devServer.proxy = [
// 		{
// 			// proxy requests matching a pattern:
// 			path: '/api/**',

// 			// where to proxy to:
// 			target: 'http://localhost:5000',

// 			// optionally change Origin: and Host: headers to match target:
// 			changeOrigin: true,
// 			changeHost: true
// 		}
// 	];
// };

import asyncPlugin from 'preact-cli-plugin-async';

export default (config) => {
	asyncPlugin(config);
};
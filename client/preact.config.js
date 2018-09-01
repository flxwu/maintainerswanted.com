import asyncPlugin from 'preact-cli-plugin-async';

export default (config) => {
	if (config.devServer) {
		config.devServer.proxy = [
			{
				// proxy requests matching a pattern:
				path: '/api/**',
  
				// where to proxy to:
				target: 'http://localhost:5000',
  
				// optionally change Origin: and Host: headers to match target:
				changeOrigin: true,
				changeHost: true
			}
		];
	}
	else {
		asyncPlugin(config);
	}
};

module.exports = function () {
	var client = './src/client/';
	var config = {
		temp : './.tmp/',
		// files paths
		alljs : [ 
			'./src/**/*.js',
			'./*.js'
			],
		less : client + 'styles/styles.less'
	};

	return config;
};
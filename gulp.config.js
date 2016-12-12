module.exports = function () {
	var config = {
		/**
		* File paths
		*/

		// all js to test(vet)
		alljs : [ 
			'./src/**/*.js',
			'./*.js'
			]
	};

	return config;
};
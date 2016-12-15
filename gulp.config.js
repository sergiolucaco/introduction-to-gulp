module.exports = function () {
	var client = './src/client/';
	var clientApp = client + 'app/';
	var server = './src/server/';
	var temp = './.tmp/';

	var config = {
		// files paths
		alljs : [ 
			'./src/**/*.js',
			'./*.js'
			],
		build : './build/', // ./dist , ./production ...
		client : client,
		css : temp + 'styles.css',
		fonts : './bower_components/font-awesome/fonts/**/*.*',
		html : clientApp + '**/*.html',
		htmltemplates : clientApp + '**/*.html',
		images : client + 'images/**/*.*',
		index: client +'index.html',
		js :  [ 
				clientApp +'**/*.module.js',
				clientApp +'**/*.js',
				'!' + clientApp + '**/*.spec.js' // to exclude those files
		],
		less : client + 'styles/styles.less',
		temp : temp,
		server : server,
	
	/**
	 * optimized files
	 */
		optimized : {

			lib : 'lib.js',
			app : 'app.js'

		},			

	/**
	 * template cache
	 */		
	 	templateCache : {
	 		file : 'templates.js',
	 		options: {
	 			module: 'app.core', // to generate a new module, standAlone must be true.
	 			standAlone : false,
	 			root : 'app/'
	 		}
	 	},
	/**
	 * Browser-sync
	 */

		browserReloadDelay : 1000,

	/**
	 * Bower and NPM locations
	 */
	 	bower : { 
	 		json : require('./bower.json'),
	 		directory : './bower_components',
	 		ignorePath : '../..'
	 	},
	/**
	 * Node settings
	 **/
	 	defaultPort : 7203,
	 	nodeServer :  server + 'app.js'
	};
	config.getWiredepDefaultOptions = function (){
		var options = {
			bowerJson : config.bower.json,
			directory : config.bower.directory,
			ignorePath : config.bower.ignorePath
		};
		return options;
	}; 


	return config;
};
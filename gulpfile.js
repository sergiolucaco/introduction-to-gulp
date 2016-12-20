/*jshint -W033,-W101*/
var gulp = require ('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var del = require('del');
var path = require('path');
var _ = require('lodash');
var port = process.env.PORT || config.defaultPort;
// //Plugins Gulp
// var jshint = require ('gulp-jshint');
// var jscs = require ('gulp-jscs');
// var util = require ('gulp-util');
// var gulpprint = require ('gulp-print');
// var gulpif = require('gulp-if');

var $ = require('gulp-load-plugins')({lazy : true});


gulp.task('help', $.taskListing);
// or another way to do the same
// gulp.task('help', function (){
// 	$.taskListing();
// })
gulp.task('default' , ['help']);
//This is a quick solution to avoid error default just typing 'gulp'

gulp.task('vet', function() {
	log('Analizing source with JSHint and JSCS');
	
	return gulp
			.src(config.alljs)
			.pipe($.if(args.verbose, $.print()))
			.pipe($.jscs())
			.pipe($.jshint())
			.pipe($.jshint.reporter('jshint-stylish', { verbose : true }))
			.pipe($.jshint.reporter('fail'));

		});


gulp.task('styles', ['clean-styles']  , function() {
	log('Compiling Less --> CSS');

	return gulp
		.src(config.less)
		.pipe($.plumber())
		.pipe($.less())
		.pipe($.autoprefixer({browsers : ['last 2 version', '> 5%']}))
		.pipe(gulp.dest(config.temp));
});

gulp.task('fonts',['clean-fonts'], function (){
	log('Copying fonts');

	return gulp
			.src(config.fonts)
			.pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('images', ['clean-images'], function (){
	log('Copying and compressing images');

	return gulp
			.src(config.images)
			.pipe($.imagemin({optimizationLevel : 4 })) // by default is 3
			.pipe(gulp.dest(config.build + 'images'))
})

gulp.task('clean', function (done) { 
	var delconfig = [].concat(config.build,config.temp); // to get all the arrays in a unique array
	log('Cleabubg : ' + $.util.colors.blue(delconfig));
	del(delconfig, done);
});

gulp.task('clean-fonts', function () {  
	clean(config.build + 'fonts/**/*.*');
});

gulp.task('clean-images', function () { 
clean(config.build + 'images/**/*.*');
});

gulp.task('clean-styles', function () { // It is needed to add a callback because there is no stream ( TODO )
	clean(config.temp + '**/*.css');
});

gulp.task('clean-code', function () { // callback TODO
	var files = [].concat(
			config.temp + '**/*.js',
			config.build + '**/*.html',
			config.build + 'js/**/*.js'

		) 
	clean(files);
});

gulp.task('less-watcher' , function () {
	gulp.watch([config.less], ['styles']);
});

gulp.task('templatecache' , ['clean-code'] ,function () {
// With this implemented, it will search first if the files needed are in cache or not to avoid http request.
	log('Creating AngularJs $templateCache');
	return gulp 
			.src(config.htmltemplates)
			.pipe($.minifyHtml({empty : true})) // to avoid spaces inside the template cache html file.
			.pipe($.angularTemplatecache(
			config.templateCache.file ,
			config.templateCache.options)) // gulp-angular-templatecache 
			.pipe(gulp.dest(config.temp));
})	

gulp.task('wiredep' , function () {
	log('Wire up the bower css js and our app js into the html');
	var options = config.getWiredepDefaultOptions();
	var wiredep = require ('wiredep').stream; // A property which allow us to use in pipe.
	return gulp
			.src(config.index)
			.pipe(wiredep(options))
			.pipe($.inject(gulp.src(config.js)))
			.pipe(gulp.dest(config.client));
});

gulp.task('inject' , ['wiredep','styles', 'templatecache'] ,   function () { 
// this task is not include in wiredep task because the postinstall script in bower.json must be fast.
	log('Wire up the bower css js and our app js into the html');
	return gulp
			.src(config.index)
			.pipe($.inject(gulp.src(config.css)))
			.pipe(gulp.dest(config.client));
}); // This task will happen when the styles and the wiredep triggered .

gulp.task('build', ['optimize', 'fonts' , 'images'], function (){
	log('Building everything');

	var msg = {
		title : 'gulp build',
		subtitle : 'Deployed to the build folder',
		message: 'Running `gulp serve-build`'
	};
	del(config.temp);
	log(msg);
	notify(msg);


})

gulp.task('optimize' , [ 'inject' , 'test' ], function () {
	log('Optimizing html css and js');

	var assets = $.useref.assets({searchPath: './'}); 
	var templateCache = config.temp + config.templateCache.file;
	var cssFilter = $.filter('**/*.css', { restore : true }); // last version gulp-filter syntax + "filtername.restore"
	var jsLibFilter = $.filter('**/'+ config.optimized.lib, { restore : true });
	var jsAppFilter = $.filter('**/' +  config.optimized.app, { restore : true });

	return gulp 
			.src(config.index)
			.pipe($.plumber())
			.pipe($.inject(gulp.src(templateCache, { read : false }),{
				starttag: ' <!-- inject:templates:js -->'	
			}))
			.pipe(assets)//inject all the assets of the js and css files
			//filter down to css
			.pipe(cssFilter)//filter all the css to minimize it with csso
			.pipe($.csso())//minimize all the css 
			.pipe(cssFilter.restore) // restore to get back all the css files.
			.pipe(jsLibFilter)//filter all the js of lib to minimize it with uglify
			.pipe($.uglify())//minimize all the js of lib
			.pipe(jsLibFilter.restore) // restore to get back all the js of App files
			.pipe(jsAppFilter)//filter all the js of App to minimize it with uglify
			.pipe($.ngAnnotate( { add: true } )) // To only modify custom code , we must separe in two variables JS.
			//With this gulp plugin we achieve that angularjs recognized the variable names and inject the correct name without mangling.
			.pipe($.uglify())//minimize all the js of App
			.pipe(jsAppFilter.restore) // restore to get back all the js of App files
			.pipe($.rev()) // app.js --> app-1281957r.js
			.pipe(assets.restore()) // restore to get back all the html files. ( only index)
// by default concatenate everything js and css code in only one file. Its taking everything between 
// tags build.
			.pipe($.useref()) // to get only one line link for the differents assets.
			.pipe($.revReplace())// to secure that the injection to the html is done with the modified name.
			.pipe(gulp.dest(config.build))//first generate the folder, then add the manifest.
			.pipe($.rev.manifest())
			.pipe(gulp.dest(config.build));
});


/**
 * Bump the version
 * --type=pre will bump the prerelease version *.*.*-x
 * --type=patch or no flag will bump the patch version *.*.x
 * --type=minor will bump the minor version *.x.*
 * --type=major will bump the major version x.*.*
 * --version=1.2.3 will bump to a specific version and ignore other flags
 */

gulp.task('bump' , function(){
//this task is to automation the process of updating the app versions.
	var msg = 'Bumping versions';
	var type = args.type;
	var version = args.version;
	var options = {};
	if (version) {
		options.version = version;
		msg += ' to ' + version;
	} else {
		options.type = type;
		msg += ' for a ' + type;
	}

	log(msg);
	return gulp
			.src(config.packages)
			.pipe($.print())// to see the name file to be bumped
			.pipe($.bump(options))
			.pipe(gulp.dest(config.root))

})

gulp.task('serve-build' , ['build'], function (){
	serve(false /* isDev*/);

})

gulp.task('serve-dev' , ['inject'], function (){
	serve(true /* isDev*/);
});

gulp.task('test' , ['vet' , 'templatecache'], function (done){
	startTests(true /* singleRun */, done);
});

gulp.task('autotest' , ['vet' , 'templatecache'], function (done){
	startTests(false /* singleRun */, done);
});
// To always watch our code in development environmet to continue test our new lines of code.
// a kind of nodemon for test just changing one state of our singlerun startTests function.


/////////////


// function errorLogger(error){
// 	log('***  Start of Error ***');
// 	log(error);
// 	log('***  End of Error ***');
// 	this.emit('end');

// }

function serve(isDev){
	var nodeOptions = {
		script : config.nodeServer,
		delayTime : 1,
		env : {
			'PORT' : port,
			'NODE_ENV' : isDev ? 'dev' : 'build'
		},
		watch : [ config.server ] // define the files to restart on.
	};
	return $.nodemon(nodeOptions)
		.on('restart', [ 'vet' ] , function (event){
// The main advantage of gulp-nodemon is that also you can introduce extra tasks to do
//during nodemon is active and restarting.
			log('*** nodemon restarted');
			log('files changed on restart  :\n' + event);
			setTimeout(function (){
				browserSync.notify('reloading now ...');
				browserSync.reload({stream:false});
			}, config.browserReloadDelay);
		})
		.on('start', function (){
			log('*** nodemon started');
			startBrowserSync(isDev);

		})
		.on('crash', function (){
			log('*** nodemon crashed : script crashed for some reason');

		})
		.on('exit', function (){
			log('*** nodemon exited cleanly');

		});	
} 

function changeEvent (event) {
	var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
	log('File' + event.path.replace(srcPattern,'') + ' ' + event.type);

}

function notify(options){
	var notifier = require('node-notifier');
	var notifyOptions = {
		sound : 'Bottle',
		contentImage : path.join(__dirname, 'gulp.png'),
		icon : path.join(__dirname, 'gulp.png')
	};
	_.assign(notifyOptions, options);
	notifier.notify(notifyOptions);

}
function startBrowserSync(isDev){
	if (args.nosync || browserSync.active) { 
// if only want to active nodemon without browsersync || to see if it is actually running
		return ; 
	}

	log('Starting browser-sync on port' + port);
	if (isDev) {

			gulp.watch([config.less], ['styles'])
				.on('change', function (event){
					changeEvent(event);
				});

	} else {

			gulp.watch([config.less, config.js , config.html], ['optimize', browserSync.reload])
				.on('change', function (event){
					changeEvent(event);
				});

	}

	
	var options = {
		proxy : 'localhost:' + port, //watch out spaces in this string 
		port : 3000,
		files: isDev ? [ 
		config.client + '**/*.*',
		'!' + config.less,
		config.temp + '**/*.css'
		] : [],
		ghostMode : { 
// this ghostMode is to do the same actions equal true in different browsers at the same time. It will do the same scrolls .. etc
			clicks : true,
			location : false,
			forms : true,
			scroll : true
		},
		injectChanges : true, // to avoid reload browser constantly. It will reload it only with js or html changes.
		logFileChanges : true,
		logLevel : 'debug',
		logPrefix : 'gulp-patterns',
		notify : true, //html popup to show you when its ready
		reloadDelay : 1000 //delay to show changes

	};

	browserSync(options); 
}

function startTests(singleRun,done){
	var karma = require('karma').server;
	var excludeFiles = [];
	var serverSpecs = config.serverIntegrationSpecs;

	excludeFiles = serverSpecs;
	
	karma.start({
		configFile : __dirname +'/karma.conf.js',
		exclude : excludeFiles ,
		singleRun : !!singleRun

	}, karmaCompleted);

	function karmaCompleted(karmaResult){
		log('karma completed');
		if(karmaResult === 1) {
			done('karma : tests failed with code ' + karmaResult);
		} else {
			done();
		}
	}

}

function clean(path){
	log('Cleaning' + $.util.colors.blue(path));
	del(path);
}



function log(msg) {
	if (typeof(msg) === 'object') {
		for (var item in msg) {
			if (msg.hasOwnProperty(item)) {
				$.util.log($.util.colors.blue(msg[item]));
			}
		}
	} else {
		$.util.log($.util.colors.blue(msg));
	}

}
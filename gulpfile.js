var gulp = require ('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var del = require('del');
var port = process.env.PORT || config.defaultPort;
// //Plugins Gulp
// var jshint = require ('gulp-jshint');
// var jscs = require ('gulp-jscs');
// var util = require ('gulp-util');
// var gulpprint = require ('gulp-print');
// var gulpif = require('gulp-if');

var $ = require('gulp-load-plugins')({lazy : true});




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
//		.on('error', errorLogger)
		.pipe($.autoprefixer({browsers : ['last 2 version', '> 5%']}))
		.pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles', function ()	 { // It is needed to add a callback because there is no stream ( TODO )
	var files = config.temp + '**/*.css';
	clean(files);
});

gulp.task('less-watcher' , function () {
	gulp.watch([config.less], ['styles']);
});

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

gulp.task('inject' , ['wiredep','styles'] ,   function () { 
// this task is not include in wiredep task because the postinstall script in bower.json must be fast.
	log('Wire up the bower css js and our app js into the html');
	return gulp
			.src(config.index)
			.pipe($.inject(gulp.src(config.css)))
			.pipe(gulp.dest(config.client));
}); // This task will happen when the styles and the wiredep triggered .

gulp.task('serve-dev' , ['inject'], function (){
// this task allow us to run the app locally without recharging manually
	var isDev = true ;
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
			startBrowserSync();

		})
		.on('crash', function (){
			log('*** nodemon crashed : script crashed for some reason');

		})
		.on('exit', function (){
			log('*** nodemon exited cleanly');

		});	
});

/////////////


// function errorLogger(error){
// 	log('***  Start of Error ***');
// 	log(error);
// 	log('***  End of Error ***');
// 	this.emit('end');

// }
function changeEvent (event) {
	var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
	log('File' + event.path.replace(srcPattern,'') + ' ' + event.type);

}
function startBrowserSync(){
	if (args.nosync || browserSync.active) { 
// if only want to active nodemon without browsersync || to see if it is actually running
		return ; 
	}

	log('Starting browser-sync on port' + port);

	gulp.watch([config.less], ['styles'])
		.on('change', function (event){
			changeEvent(event);
		});
	
	var options = {
		proxy : 'localhost:' + port, //watch out spaces in this string 
		port : 3000,
		files:[ 
		config.client + '**/*.*',
		'!' + config.less,
		config.temp + '**/*.css'
		],
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
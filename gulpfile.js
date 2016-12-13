var gulp = require ('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
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
	log('Compiling Less --> CSS')

	return gulp
		.src(config.less)
		.pipe($.less())
		.pipe($.autoprefixer({browsers : ['last 2 version', '> 5%']}))
		.pipe(gulp.dest(config.temp));
})

gulp.task('clean-styles', function ()	 { // It is needed to add a callback because there is no stream ( TODO )
	var files = config.temp + '**/*.css';
	clean(files);
})

gulp.task('less-watcher' , function () {
	gulp.watch([config.less], ['styles']);
})


/////////////

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
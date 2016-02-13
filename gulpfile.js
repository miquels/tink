
'use strict';

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var runseq = require('run-sequence');

var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');

var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');

var assign = require('lodash.assign');
var fs = require('fs');

// application bundler
function getAppBundler(opts) {
	var opts = assign({}, opts, {
		entries: [ './app/app.js'],
		debug: true,
		bundleExternal: false,
	});
	return new browserify(opts)
		.transform(babelify, {
			presets: ["es2015"],
			plugins: ["transform-class-properties"]
		});
}

// library bundler.
function getLibBundler(opts) {
	var json = JSON.parse(fs.readFileSync('./package.json'));
	var deps = Object.keys(json.dependencies);
	var opts = assign({}, opts, {
		debug: true,
	});
	return new browserify(opts)
		.require(deps);
}

function runBundler(b, opts) {
  return b.bundle()
	// log errors if they happen
	.on('error', gutil.log.bind(gutil, 'Browserify Error'))
	.pipe(source(opts.outfile))
	.pipe(buffer())
	// load map from browserify file
	.pipe(gulpif(opts.maps, sourcemaps.init({loadMaps: true})))

	// Add transformation tasks to the pipeline here.
	.pipe(gulpif(opts.uglify, uglify()))

    .pipe(gulpif(opts.maps, sourcemaps.write('./', {
		includeContent: opts.mapsIncludeContent,
	})))
    .pipe(gulp.dest('./app/build'));
}

gulp.task('js-app-once', function() {
	var b = getAppBundler({});
	return runBundler(b, {
		maps: true,
		mapsIncludeContent: true,
		outfile: 'app-bundle.js',
	});
});

gulp.task('js-app-watch', function() {
	var opts = {
		maps: true,
		mapsIncludeContent: true,
		outfile: 'app-bundle.js',
	};
	var b = watchify(getAppBundler(assign({}, watchify.args)));
	b.on('update', function() { runBundler(b, opts); });
	b.on('log', gutil.log);
	return runBundler(b, opts);
});

gulp.task('js-lib-once', function() {
	var b = getLibBundler({});
	return runBundler(b, {
		maps: true,
		mapsIncludeContent: false,
		outfile: 'vendor-bundle.js',
		uglify: true,
	});
});

gulp.task('js-lib-watch', function() {
	var opts = {
		maps: true,
		mapsIncludeContent: false,
		outfile: 'vendor-bundle.js',
		uglify: true,
	};
	var b = watchify(getLibBundler(assign({}, watchify.args)));
	b.on('update', function() { runBundler(b, opts); });
	b.on('log', gutil.log);
	return runBundler(b, opts);
});

gulp.task('samsungtvcss', function() {
  return gulp.src('app/style/samsungtv.css')
	.pipe(gulp.dest('./app/build'));
});

gulp.task('sass', function() {
  return gulp.src('app/style/style.scss')
	.pipe(sourcemaps.init())
	.pipe(sass.sync().on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: [
			'> 1%',
			'last 2 versions',
			'Firefox ESR',
			'chrome >= 24',
		]
	}))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('./app/build'));
});

gulp.task('material-design-icons', function() {
  return gulp.src([ './node_modules/material-design-icons/iconfont/*' ],
					{ base: './node_modules/material-design-icons/' })
	.pipe(gulp.dest('./app/build'));
});

gulp.task('default', [
	'js-app-once',
	'js-lib-once',
	'sass',
	'samsungtvcss',
	'material-design-icons',
]);

gulp.task('scss-watch', function() {
	var w = gulp.watch( [
			'./app/style/*.scss',
			'./app/video/*.scss' ,
			'./app/view/*.scss' ],
		[ 'sass' ]
	);
	w.on('change', function(ev) {
		console.log(ev.path + ' was ' + ev.type + ', running tasks...');
	});
});

gulp.task('samsungtvcss-watch', function() {
	var w = gulp.watch( [ './app/style/samsungtv.css' ],
		[ 'samsungtvcss' ]
	);
	w.on('change', function(ev) {
		console.log(ev.path + ' was ' + ev.type + ', running tasks...');
	});
});

gulp.task('watch', function() {
	//runseq(	[ 'sass', 'samsungtvcss', 'js-lib-once', 'material-design-icons' ],
	runseq(	[ 'default' ],
			[ 'js-app-watch', 'scss-watch', 'samsungtvcss-watch' ]);
});


const gulp = require('gulp');
const clean = require('gulp-clean');
const install = require('gulp-install');
// const exec = require('child_process').exec;

let deployProd = gulp.parallel(npmInstall, deploySources);
let deployDev = gulp.parallel(npmInstall, deploySources, deployDevStubsJS, deployDevStubsPython);

/**
 *  Make everything clean and tidy to start from scratch
 */
gulp.task('clean', cleanBuild);

/**
 * Clean first and the move all relevant production sources to the build folder
 */
gulp.task('build', gulp.series('clean', deployProd));

/*
 * Clean first and the move all relevant development sources to the build folder
 */
gulp.task('build-dev', gulp.series('clean', deployDev));

/**
 * Purge all built contents to start building from scratch
 */
function cleanBuild() {
	return gulp.src('build/*', {read: false})
		.pipe(clean());
}

/**
 * Run npm install for production to fetch all node_modules
 */
function npmInstall() {
	return gulp.src(['./package.json'])
		.pipe(install({ npm: '--production' }));
}

/**
 * Deploy the actual source code into the build folder
 */
function deploySources() {
	return gulp.src(['src/js/**/*', 'src/py/**/*'], { base: 'src' })
		.pipe(gulp.dest('build'));
}

/**
 * Deploy the JS dev stubs needed for development. Not needed when on the raspberry
 */
function deployDevStubsJS() {
	return gulp.src(['src/stubs/js/**/*'], { base: 'src/stubs/js' })
		.pipe(gulp.dest('build/js/node_modules'));
}

/**
 * Deploy the Python dev stubs needed for development. Not needed when on the raspberry
 */
function deployDevStubsPython() {
	return gulp.src(['src/stubs/py/**/*'], { base: 'src/stubs/py' })
		.pipe(gulp.dest('build/py'));
}



// Execute custom command
// gulp.task('build', function execCommand (cb) {
// 	exec('', function (err, stdout, stderr) {
// 		console.log(stdout);
// 		console.error(stderr);
// 		cb(err);
// 	});
// });
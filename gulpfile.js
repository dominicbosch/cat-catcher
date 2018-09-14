const spawn = require('child_process').spawn;
const gulp = require('gulp');
const clean = require('gulp-clean');
const install = require('gulp-install');
// const exec = require('child_process').exec;

let deploy = gulp.parallel(npmInstall, deploySources);
let deleteStubs = gulp.parallel(deleteDevStubsJS, deleteDevStubsPython);
let deployProd = gulp.series(deploy, deleteStubs);

/**
 *  Make everything clean and tidy to start from scratch
 */
gulp.task('clean', cleanBuild);

/**
 * Clean first and the move all relevant production sources to the build folder
 */
gulp.task('build', gulp.series('clean', deployProd));

/**
 * Clean first and the move all relevant development sources to the build folder
 */
gulp.task('build-dev', gulp.series('clean', deploy));

/**
 * Run the cat-catcher on the raspberry
 */
gulp.task('run', gulp.series('build', runCatCatcher));

/**
 * Run the cat-catcher in the development environment
 */
gulp.task('run-dev', gulp.series('build-dev', runCatCatcher));

/**
 * Check whether ultrasonic is working
 */
gulp.task('check-ultrasonic', gulp.series('build', runCatCatcher));

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
 * Delete the JS dev stubs needed for development. Not needed when on the raspberry
 */
function deleteDevStubsJS() {
	return gulp.src(['build/js/node_modules'])
		.pipe(clean());
}

/**
 * Delete the Python dev stubs needed for development. Not needed when on the raspberry
 */
function deleteDevStubsPython() {
	return gulp.src(['build/py/cv2', 'build/py/mvnc', 'build/py/picamera', 'build/py/skimage'])
		.pipe(clean());
}

function runCatCatcher() {
	spawn('node', ['build/js/index.js'], { stdio: 'inherit' });
}

// Execute custom command
// gulp.task('build', function execCommand (cb) {
// 	exec('', function (err, stdout, stderr) {
// 		console.log(stdout);
// 		console.error(stderr);
// 		cb(err);
// 	});
// });
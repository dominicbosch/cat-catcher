const gulp = require('gulp');
const clean = require('gulp-clean');
const exec = require('child_process').exec;

gulp.task('default', ['build']);

// Move all relevant sources to the build folder
gulp.task('build', ['clean'], function (cb) {
	exec('',  function (err, stdout, stderr) {
		console.log(stdout);
		console.error(stderr);
		cb(err);
	});
});

// Move all relevant sources to the build folder
gulp.task('build-dev', ['clean'], function () {
	return gulp.src('src')
		.pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
	return gulp.src('build', {read: false})
		.pipe(clean());
});

let gulp = require('gulp');
let clean = require('gulp-clean');
let exec = require('child_process').exec;

gulp.task('default', ['build']);

// Move all relevant sources to the build folder
gulp.task('build', ['clean'], function () {
	exec('', function (err, stdout, stderr) {
		console.log(stdout);
		console.error(stderr);
		cb(err);
	});
});

gulp.task('clean', function () {
	return gulp.src('build', {read: false})
		.pipe(clean());
});

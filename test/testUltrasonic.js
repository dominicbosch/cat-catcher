const Ultrasonic = require('./../src/js/ultrasonic');

let us = new Ultrasonic();

us.onObstacle(function(data) {
	console.log(data);
});
us.start();

console.log('Measuring for 10 seconds');
setTimeout(function() {
	us.stop();
	process.exit();
}, 10000);
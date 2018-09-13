
const car = require('./carController');

car.init({
	s: true,
	sa: true,
	v: true,
	vf: true,
	iw: 640,
	ih: 480,
	fr: 5,
	steerDevice: 0,
	steerLeft: 200,
	steerCenter: 400,
	steerRight: 500,
	motorDevice: 1,
	motorBack: 200,
	motorNeutral: 400,
	motorForward: 500,
	slowDownDistance: 0.8,
	stopDistance: 0.2,
	obstacleCount: 2,
	turnTime: 500,
	speedUpTime: 3000,
	stayTime: 5000,
	stopTime: 10000
});
car.start();

process.on('SIGINT', function() {
	console.log('Caught SIGINT');
	car.stop();
	process.exit();
});

process.on('SIGTERM', function() {
	console.log('Caught SIGTERM');
	car.stop();
	process.exit();
});

const car = require('./carController');

car.init({ v: true });
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